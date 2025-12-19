import Product from "../models/product.model.js";
import Category from "../../category/models/category.model.js"; // Import to register model for populate
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, isBundle } = req.query;
    let query = { isActive: true };

    if (category) query.category = category;
    if (isBundle !== undefined) query.isBundle = isBundle === "true";
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Execute query with populate
    let productsQuery = Product.find(search ? { ...query, $text: { $search: search } } : query)
      .populate("bundleItems.product", "name price image stock")
      .populate("category", "name slug");

    if (!search) {
      productsQuery = productsQuery.sort({ createdAt: -1 });
    }

    const products = await productsQuery.lean(); // Use lean to get plain JS objects

    // Fetch ratings for these products
    // Note: This is an extra query but necessary since Rating is not denormalized
    // Optimization: In production, better to store rating in Product model
    const productIds = products.map(p => p._id);
    
    // Aggregation to get average rating for each product
    // Dynamic import to avoid circular dependency if any, or just assume Review is available
    // We need to import Review at top
    const Review = (await import("../../review/models/review.model.js")).default; 
    
    const ratings = await Review.aggregate([
      { $match: { product: { $in: productIds } } },
      { 
        $group: { 
          _id: "$product", 
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 }
        } 
      }
    ]);

    // Create a map for fast lookup
    const ratingMap = {};
    ratings.forEach(r => {
      ratingMap[r._id.toString()] = r.avgRating;
    });

    // Merge rating into products
    const productsWithRating = products.map(p => ({
      ...p,
      rating: ratingMap[p._id.toString()] || 0, // Default to 0 if no reviews
      // Ensure id string is available like .id virtual
      id: p._id.toString() 
    }));

    res.json({ success: true, count: productsWithRating.length, data: productsWithRating });
  } catch (error) {
    console.error("Get all products error:", error);
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("bundleItems.product", "name price image description stock")
      .populate("category", "name slug");
    if (!product) return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Create product (Admin) - with file upload and bundle support
export const createProduct = async (req, res) => {
  try {
    console.log("📦 Creating product...");
    console.log("Body:", req.body);
    console.log("Files:", req.files?.length || 0);

    const { name, price, description, category, categoryName, stock, isBundle, bundleItems } = req.body;

    if (!name || !price) {
      return res.status(400).json({ success: false, message: "Tên và giá là bắt buộc" });
    }

    // Lấy URLs của các ảnh đã upload
    const images = req.files?.map((file) => `/uploads/${file.filename}`) || [];

    // Parse bundleItems nếu là string (từ FormData)
    let parsedBundleItems = [];
    if (bundleItems) {
      try {
        parsedBundleItems = typeof bundleItems === "string" ? JSON.parse(bundleItems) : bundleItems;
      } catch (e) {
        console.error("Error parsing bundleItems:", e);
      }
    }

    const product = new Product({
      name,
      price: Number(price),
      description: description || "",
      category: category || null, // Now expects ObjectId or null
      categoryName: categoryName || "", // Store category name for display
      stock: Number(stock) || 0,
      images,
      image: images[0] || "",
      isBundle: isBundle === "true" || isBundle === true,
      bundleItems: parsedBundleItems,
    });

    await product.save();

    console.log("✅ Product created:", product._id);
    res.status(201).json({ success: true, message: "Tạo sản phẩm thành công", data: product });
  } catch (error) {
    console.error("❌ Create product error:", error);
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Update product (Admin) - with file upload and bundle support
export const updateProduct = async (req, res) => {
  try {
    const { name, price, description, category, categoryName, stock, isBundle, bundleItems } = req.body;
    
    // Parse bundleItems nếu là string
    let parsedBundleItems = undefined;
    if (bundleItems) {
      try {
        parsedBundleItems = typeof bundleItems === "string" ? JSON.parse(bundleItems) : bundleItems;
      } catch (e) {
        console.error("Error parsing bundleItems:", e);
      }
    }

    const updates = {
      name,
      price: Number(price),
      description,
      category: category || null,
      categoryName: categoryName || "",
      stock: Number(stock),
      isBundle: isBundle === "true" || isBundle === true,
    };

    if (parsedBundleItems) {
      updates.bundleItems = parsedBundleItems;
    }

    // Nếu có upload ảnh mới
    if (req.files?.length > 0) {
      const images = req.files.map((file) => `/uploads/${file.filename}`);
      updates.images = images;
      updates.image = images[0];
    }

    // Dùng save() thay vì findByIdAndUpdate để trigger pre-save hook
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });

    Object.assign(product, updates);
    await product.save();

    res.json({ success: true, message: "Cập nhật thành công", data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Delete product (Admin)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
    res.json({ success: true, message: "Xóa thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Get only single products (not bundles) - for bundle item selection
export const getSingleProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, isBundle: { $ne: true } })
      .select("name price image stock")
      .sort({ name: 1 });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

export default { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, getSingleProducts };

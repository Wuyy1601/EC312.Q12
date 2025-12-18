import Product from "../models/product.model.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice } = req.query;
    let query = { isActive: true };

    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let products;
    if (search) {
      products = await Product.find({ ...query, $text: { $search: search } });
    } else {
      products = await Product.find(query).sort({ createdAt: -1 });
    }

    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Create product (Admin) - with file upload
export const createProduct = async (req, res) => {
  try {
    console.log("📦 Creating product...");
    console.log("Body:", req.body);
    console.log("Files:", req.files?.length || 0);

    const { name, price, description, category, stock } = req.body;

    if (!name || !price) {
      return res.status(400).json({ success: false, message: "Tên và giá là bắt buộc" });
    }

    // Lấy URLs của các ảnh đã upload
    const images = req.files?.map((file) => `/uploads/${file.filename}`) || [];

    const product = await Product.create({
      name,
      price: Number(price),
      description: description || "",
      category: category || "other",
      stock: Number(stock) || 0,
      images,
      image: images[0] || "",
    });

    console.log("✅ Product created:", product._id);
    res.status(201).json({ success: true, message: "Tạo sản phẩm thành công", data: product });
  } catch (error) {
    console.error("❌ Create product error:", error);
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Update product (Admin) - with file upload
export const updateProduct = async (req, res) => {
  try {
    const { name, price, description, category, stock } = req.body;
    const updates = { name, price: Number(price), description, category, stock: Number(stock) };

    // Nếu có upload ảnh mới
    if (req.files?.length > 0) {
      const images = req.files.map((file) => `/uploads/${file.filename}`);
      updates.images = images;
      updates.image = images[0];
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
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

export default { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };

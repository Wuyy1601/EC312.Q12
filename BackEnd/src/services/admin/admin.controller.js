import User from "../user/models/user.model.js";
import Product from "../product/models/product.model.js";
import Order from "../order/models/order.model.js";
import Category from "../category/models/category.model.js";
import Review from "../review/models/review.model.js";
import { hashPassword } from "../../shared/utils/helpers.js";

// =============================================
// USER CRUD
// =============================================

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin" });
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email hoặc username đã tồn tại" });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({ 
      username, 
      email, 
      password: hashedPassword,
      role: role || "user"
    });

    res.status(201).json({
      success: true,
      message: "Tạo user thành công",
      data: { id: newUser._id, username: newUser.username, email: newUser.email, role: newUser.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Hash password if updating
    if (updates.password) {
      updates.password = await hashPassword(updates.password);
    }

    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: "User không tồn tại" });
    }

    res.json({ success: true, message: "Cập nhật thành công", data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User không tồn tại" });
    }
    res.json({ success: true, message: "Xóa user thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// =============================================
// PRODUCT CRUD
// =============================================

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}).populate("category").sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const productData = req.body;
    
    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map(file => `/uploads/${file.filename}`);
      productData.image = productData.images[0];
    }

    const product = await Product.create(productData);
    res.status(201).json({ success: true, message: "Tạo sản phẩm thành công", data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productData = req.body;
    
    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map(file => `/uploads/${file.filename}`);
      productData.image = productData.images[0];
    }

    const product = await Product.findByIdAndUpdate(id, productData, { new: true });
    if (!product) {
      return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại" });
    }

    res.json({ success: true, message: "Cập nhật thành công", data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại" });
    }
    res.json({ success: true, message: "Xóa sản phẩm thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// =============================================
// ORDER CRUD
// =============================================

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

export const getOrderByCode = async (req, res) => {
  try {
    const { orderCode } = req.params;
    const order = await Order.findOne({ orderCode });
    if (!order) {
      return res.status(404).json({ success: false, message: "Đơn hàng không tồn tại" });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { orderCode } = req.params;
    const updates = req.body;

    const order = await Order.findOneAndUpdate({ orderCode }, updates, { new: true });
    if (!order) {
      return res.status(404).json({ success: false, message: "Đơn hàng không tồn tại" });
    }

    res.json({ success: true, message: "Cập nhật đơn hàng thành công", data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { orderCode } = req.params;
    const order = await Order.findOneAndDelete({ orderCode });
    if (!order) {
      return res.status(404).json({ success: false, message: "Đơn hàng không tồn tại" });
    }
    res.json({ success: true, message: "Xóa đơn hàng thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// =============================================
// CATEGORY CRUD
// =============================================

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ createdAt: -1 });
    res.json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description, image, isActive } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Tên danh mục là bắt buộc" });
    }

    const category = await Category.create({ name, description, image, isActive });
    res.status(201).json({ success: true, message: "Tạo danh mục thành công", data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const category = await Category.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!category) {
      return res.status(404).json({ success: false, message: "Danh mục không tồn tại" });
    }

    res.json({ success: true, message: "Cập nhật thành công", data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Danh mục không tồn tại" });
    }
    res.json({ success: true, message: "Xóa danh mục thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// =============================================
// REVIEW CRUD
// =============================================

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate("product", "name image")
      .sort({ createdAt: -1 });
    
    // Calculate sentiment stats
    const sentimentStats = {
      positive: reviews.filter(r => r.sentiment === "positive").length,
      neutral: reviews.filter(r => r.sentiment === "neutral").length,
      negative: reviews.filter(r => r.sentiment === "negative").length,
      needsAttention: reviews.filter(r => r.needsAttention).length,
      unanalyzed: reviews.filter(r => !r.sentiment).length,
    };

    res.json({ 
      success: true, 
      count: reviews.length, 
      sentimentStats,
      data: reviews 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const review = await Review.findByIdAndUpdate(id, updates, { new: true });
    if (!review) {
      return res.status(404).json({ success: false, message: "Đánh giá không tồn tại" });
    }

    res.json({ success: true, message: "Cập nhật đánh giá thành công", data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Đánh giá không tồn tại" });
    }
    res.json({ success: true, message: "Xóa đánh giá thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Analyze sentiment for a single review using Gemini
export const analyzeReviewSentiment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Đánh giá không tồn tại" });
    }

    // Call Gemini API for sentiment analysis
    const geminiResponse = await fetch("http://localhost:5001/api/gemini/sentiment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        comment: review.comment,
        rating: review.rating
      })
    });

    const geminiData = await geminiResponse.json();

    if (geminiData.success && geminiData.data) {
      // Update review with sentiment data
      review.sentiment = geminiData.data.sentiment;
      review.sentimentScore = geminiData.data.score;
      review.sentimentAnalysis = geminiData.data.summary;
      review.needsAttention = geminiData.data.needsAttention;
      await review.save();

      res.json({ 
        success: true, 
        message: "Phân tích cảm xúc thành công",
        data: review 
      });
    } else {
      res.status(500).json({ success: false, message: "Không thể phân tích" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Batch analyze all unanalyzed reviews
export const batchAnalyzeReviews = async (req, res) => {
  try {
    const unanalyzedReviews = await Review.find({ sentiment: null }).limit(20);
    
    if (unanalyzedReviews.length === 0) {
      return res.json({ success: true, message: "Không có đánh giá nào cần phân tích", analyzed: 0 });
    }

    let analyzed = 0;
    
    for (const review of unanalyzedReviews) {
      try {
        const geminiResponse = await fetch("http://localhost:5001/api/gemini/sentiment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            comment: review.comment,
            rating: review.rating
          })
        });

        const geminiData = await geminiResponse.json();

        if (geminiData.success && geminiData.data) {
          review.sentiment = geminiData.data.sentiment;
          review.sentimentScore = geminiData.data.score;
          review.sentimentAnalysis = geminiData.data.summary;
          review.needsAttention = geminiData.data.needsAttention;
          await review.save();
          analyzed++;
        }
      } catch (err) {
        console.error(`Error analyzing review ${review._id}:`, err);
      }
    }

    res.json({ 
      success: true, 
      message: `Đã phân tích ${analyzed}/${unanalyzedReviews.length} đánh giá`,
      analyzed 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Get reviews that need attention (negative sentiment)
export const getReviewsNeedingAttention = async (req, res) => {
  try {
    const reviews = await Review.find({ needsAttention: true })
      .populate("product", "name image")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// =============================================
// DASHBOARD STATS
// =============================================

export const getDashboardStats = async (req, res) => {
  try {
    const [usersCount, productsCount, ordersCount, categoriesCount, reviewsCount] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Category.countDocuments(),
      Review.countDocuments()
    ]);

    // Order stats
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" }
        }
      }
    ]);

    // Revenue stats
    const revenueStats = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    // Sentiment stats for reviews
    const sentimentStats = await Review.aggregate([
      {
        $group: {
          _id: "$sentiment",
          count: { $sum: 1 }
        }
      }
    ]);

    // Reviews needing attention
    const needsAttentionCount = await Review.countDocuments({ needsAttention: true });

    res.json({
      success: true,
      data: {
        counts: {
          users: usersCount,
          products: productsCount,
          orders: ordersCount,
          categories: categoriesCount,
          reviews: reviewsCount
        },
        orderStats,
        revenue: revenueStats[0] || { totalRevenue: 0, totalOrders: 0 },
        sentimentStats: {
          breakdown: sentimentStats,
          needsAttention: needsAttentionCount
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

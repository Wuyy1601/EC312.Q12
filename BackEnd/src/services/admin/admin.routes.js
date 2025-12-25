import express from "express";
import { authMiddleware, adminMiddleware } from "../user/controllers/user.controller.js";
import { uploadImages } from "../../shared/utils/upload.js";
import {
  // Users
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  // Products
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  // Orders
  getAllOrders,
  getOrderByCode,
  updateOrder,
  deleteOrder,
  // Categories
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  // Reviews
  getAllReviews,
  updateReview,
  deleteReview,
  // Sentiment Analysis
  analyzeReviewSentiment,
  batchAnalyzeReviews,
  getReviewsNeedingAttention,
  // Dashboard
  getDashboardStats
} from "./admin.controller.js";

const router = express.Router();

// Apply auth + admin middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// =============================================
// DASHBOARD
// =============================================
router.get("/dashboard", getDashboardStats);

// =============================================
// USERS CRUD
// =============================================
router.get("/users", getAllUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// =============================================
// PRODUCTS CRUD
// =============================================
router.get("/products", getAllProducts);
router.post("/products", uploadImages, createProduct);
router.put("/products/:id", uploadImages, updateProduct);
router.delete("/products/:id", deleteProduct);

// =============================================
// ORDERS CRUD
// =============================================
router.get("/orders", getAllOrders);
router.get("/orders/:orderCode", getOrderByCode);
router.put("/orders/:orderCode", updateOrder);
router.delete("/orders/:orderCode", deleteOrder);

// =============================================
// CATEGORIES CRUD
// =============================================
router.get("/categories", getAllCategories);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

// =============================================
// REVIEWS CRUD + SENTIMENT ANALYSIS
// =============================================
router.get("/reviews", getAllReviews);
router.get("/reviews/needs-attention", getReviewsNeedingAttention);
router.put("/reviews/:id", updateReview);
router.delete("/reviews/:id", deleteReview);
router.post("/reviews/:id/analyze", analyzeReviewSentiment);
router.post("/reviews/batch-analyze", batchAnalyzeReviews);

export default router;


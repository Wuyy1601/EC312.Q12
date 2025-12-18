import express from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { authenticateToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getAllCategories); // GET /api/categories
router.get("/:id", getCategoryById); // GET /api/categories/:id

// Admin only routes
// Tạm thời bỏ auth để test
router.post("/", createCategory); // POST /api/categories
router.put("/:id", authenticateToken, isAdmin, updateCategory); // PUT /api/categories/:id
router.delete("/:id", authenticateToken, isAdmin, deleteCategory); // DELETE /api/categories/:id

export default router;

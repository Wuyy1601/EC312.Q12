import express from "express";
import { getAllUsers, getUserById } from "../controllers/userController.js";

const router = express.Router();

// GET /api/users - Lấy tất cả users
router.get("/", getAllUsers);

// GET /api/users/:id - Lấy thông tin user theo ID
router.get("/:id", getUserById);

export default router;


// PUT /api/users/:id - Cập nhật thông tin user theo ID
// DELETE /api/users/:id - Xóa user theo ID
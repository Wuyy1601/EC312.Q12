import express from "express";
import { getAllUsers, getUserById , updateUserProfile } from "../controllers/userController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// GET /api/users - Lấy tất cả users
router.get("/", getAllUsers);

// GET /api/users/:id - Lấy thông tin user theo ID
router.get("/:id", getUserById);

// PUT /api/users/profile - Cập nhật profile (yêu cầu authentication)
router.put("/profile", authenticateToken, updateUserProfile);

export default router;


// DELETE /api/users/:id - Xóa user theo ID

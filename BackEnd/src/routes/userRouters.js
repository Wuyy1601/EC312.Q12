import express from "express";
import { getAllUsers, getUserById , updateUserProfile , changePassword, getMyProfile} from "../controllers/userController.js";
import { authenticateToken , isAdmin} from "../middleware/auth.js";

const router = express.Router();

// GET /api/users - Lấy tất cả users
router.get("/", authenticateToken, isAdmin, getAllUsers);

// GET /api/users/me - Lấy thông tin profile của chính mình (user đã login)
router.get("/me", authenticateToken, getMyProfile);

// GET /api/users/:id - Lấy thông tin user theo ID
router.get("/:id",authenticateToken, isAdmin, getUserById);

// PUT /api/users/profile - Cập nhật profile (yêu cầu authentication)
router.put("/profile", authenticateToken, updateUserProfile);

// PUT /api/users/change-password - Đổi mật khẩu (yêu cầu authentication)
router.put("/change-password", authenticateToken, changePassword);

export default router;


// DELETE /api/users/:id - Xóa user theo ID

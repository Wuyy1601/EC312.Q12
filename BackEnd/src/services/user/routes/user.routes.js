import express from "express";
import rateLimit from "express-rate-limit";
import { register, login, getProfile, getAllUsers, authMiddleware, adminMiddleware, adminLogin, updateUser, deleteUser, socialLogin, loginVulnerable, fetchAvatar } from "../controllers/user.controller.js";

const router = express.Router();

// RATE LIMITER: Khóa IP 2 phút nếu gửi quá 3 requests
const loginLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 3, // Limit each IP to 3 requests per `window`
  message: { success: false, message: "Bạn đã thử sai quá nhiều lần. IP của bạn bị khóa trong 2 phút." },
  standardHeaders: true, 
  legacyHeaders: false,
});

// Public routes
router.post("/register", register);
router.post("/login", loginLimiter, login);
router.post("/social-login", socialLogin);
router.post("/admin-login", adminLogin);
// VULNERABLE LAB: NoSQL Injection — login without password check
router.post("/login-v2", loginVulnerable);
// VULNERABLE LAB: SSRF — fetch URL from server-side
router.post("/fetch-avatar", authMiddleware, fetchAvatar);

// Protected routes
router.get("/me", authMiddleware, getProfile);

// Admin routes
router.get("/users", authMiddleware, adminMiddleware, getAllUsers);
router.put("/users/:id", authMiddleware, adminMiddleware, updateUser);
router.delete("/users/:id", authMiddleware, adminMiddleware, deleteUser);

export default router;

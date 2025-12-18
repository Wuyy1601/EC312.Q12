import express from "express";
import { 
  register, login, getProfile, updateProfile, changePassword, deleteMyAccount,
  forgotPassword, resetPassword, getAllUsers, authMiddleware, adminMiddleware, 
  adminLogin, updateUser, deleteUser 
} from "../controllers/auth.controller.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/admin-login", adminLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected routes (require login)
router.get("/me", authMiddleware, getProfile);
router.put("/me", authMiddleware, updateProfile);
router.put("/me/password", authMiddleware, changePassword);
router.delete("/me", authMiddleware, deleteMyAccount);

// Admin routes
router.get("/users", authMiddleware, adminMiddleware, getAllUsers);
router.put("/users/:id", authMiddleware, adminMiddleware, updateUser);
router.delete("/users/:id", authMiddleware, adminMiddleware, deleteUser);

export default router;

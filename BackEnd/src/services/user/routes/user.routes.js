import express from "express";
import { register, login, getProfile, getAllUsers, authMiddleware, adminMiddleware, adminLogin, updateUser, deleteUser } from "../controllers/user.controller.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/admin-login", adminLogin);

// Protected routes
router.get("/me", authMiddleware, getProfile);

// Admin routes
router.get("/users", authMiddleware, adminMiddleware, getAllUsers);
router.put("/users/:id", authMiddleware, adminMiddleware, updateUser);
router.delete("/users/:id", authMiddleware, adminMiddleware, deleteUser);

export default router;

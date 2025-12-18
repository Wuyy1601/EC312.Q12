import express from "express";
import { register, login, getProfile, getAllUsers, authMiddleware, adminMiddleware } from "../controllers/auth.controller.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/me", authMiddleware, getProfile);
router.get("/users", authMiddleware, adminMiddleware, getAllUsers);

export default router;

import express from "express";
import { loginUser } from "../controllers/loginControllers.js";

const router = express.Router();

// POST /api/login - Đăng nhập
router.post("/", loginUser);

export default router;

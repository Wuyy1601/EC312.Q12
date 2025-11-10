import express from "express";
import { registerUser } from "../controllers/registerControllers.js";

const router = express.Router();

// POST /api/register - Đăng ký
router.post("/", registerUser);

export default router;

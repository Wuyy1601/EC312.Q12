import express from "express";
import { forgotPassword, resetPassword } from "../controllers/passwordController.js";

const router = express.Router();

// POST /api/password/forgot
router.post("/forgot", forgotPassword);

// POST /api/password/reset
router.post("/reset", resetPassword);

export default router;
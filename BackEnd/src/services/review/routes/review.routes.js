import express from "express";
import { createReview, getProductReviews } from "../controllers/review.controller.js";
import { authMiddleware as authenticateToken } from "../../user/controllers/user.controller.js";

const router = express.Router();

router.post("/", authenticateToken, createReview);
router.get("/product/:productId", getProductReviews);

export default router;

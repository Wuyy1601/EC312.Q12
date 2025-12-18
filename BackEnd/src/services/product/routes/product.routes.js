import express from "express";
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from "../controllers/product.controller.js";
import { uploadImages } from "../../../shared/utils/upload.js";

const router = express.Router();

// Public routes
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Admin routes (với upload ảnh)
router.post("/", uploadImages, createProduct);
router.put("/:id", uploadImages, updateProduct);
router.delete("/:id", deleteProduct);

export default router;

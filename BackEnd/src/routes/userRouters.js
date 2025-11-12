import express from "express";
import { getAllUsers } from "../controllers/userController.js";
import { getUserById } from "../controllers/userController.js";

const router = express.Router();

// GET /api/users - Lấy tất cả users
router.get("/", getAllUsers);

// GET /api/users/:id - Lấy user theo ID
router.get("/:id", getUserById);

export default router;

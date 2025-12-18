import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/user.routes.js";
import "./database.js"; // Initialize DB connection

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());

// Routes - vẫn dùng /api/auth để không phải đổi frontend
app.use("/api/auth", userRoutes);

// Health check
app.get("/health", (req, res) => res.json({ service: "user", status: "ok" }));

export default app;

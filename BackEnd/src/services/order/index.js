import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import orderRoutes from "./routes/order.routes.js";
import "./database.js";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "50mb" }));

app.use("/api/orders", orderRoutes);
app.get("/health", (req, res) => res.json({ service: "order", status: "ok" }));

export default app;

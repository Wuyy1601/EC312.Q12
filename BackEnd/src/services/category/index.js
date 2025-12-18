import express from "express";
import categoryRoutes from "./routes/category.routes.js";
import "./database.js"; // Initialize DB connection

const app = express.Router();

// Mount category routes
app.use("/api/categories", categoryRoutes);

export default app;

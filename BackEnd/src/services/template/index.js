import express from "express";
import templateRoutes from "./routes/template.routes.js";
import "./database.js";

const app = express.Router();

app.use("/api/templates", templateRoutes);

export default app;

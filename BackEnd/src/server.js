import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Import service routers
import userApp from "./services/user/index.js";
import orderApp from "./services/order/index.js";
import productApp from "./services/product/index.js";
import categoryApp from "./services/category/index.js";
import reviewRoutes from "./services/review/routes/review.routes.js";
import geminiApp from "./services/gemini/index.js";
import spiritApp from "./services/spirit/index.js";
import cardTemplateApp from "./services/cardTemplate/index.js";
import calendarApp from "./services/calendar/index.js";
import adminApp from "./services/admin/index.js";

import { startReminderScheduler } from "./services/calendar/scheduler/reminderScheduler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Trust proxy for reverse proxy setups (Docker/Nginx/ngrok)
app.set("trust proxy", 1);

// ── Middleware ─────────────────────────────────────────────
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((url) => url.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── API Routes ────────────────────────────────────────────
app.use("/api/auth", userApp);
app.use(userApp);
app.use(orderApp);
app.use(productApp);
app.use(categoryApp);
app.use("/api/reviews", reviewRoutes);
app.use(geminiApp);
app.use(spiritApp);
app.use(cardTemplateApp);
app.use(calendarApp);
app.use(adminApp);


// ── Health & Info ─────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    name: "Giftnity API Gateway",
    version: "2.0.0",
    status: "running",
    services: [
      "auth",
      "orders",
      "products",
      "categories",
      "reviews",
      "gemini",
      "spirit",
      "cardTemplate",
      "calendar",
      "admin",
    ],
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Error Handling ────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("Gateway Error:", err);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404 catch-all
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// ── Start Server ──────────────────────────────────────────
app.listen(PORT, "0.0.0.0", async () => {
  console.log(`\n🚀 Giftnity API Gateway running on http://localhost:${PORT}\n`);
  startReminderScheduler();
})

export default app;

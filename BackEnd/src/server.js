import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Import service apps
import userApp from "./services/user/index.js";
import orderApp from "./services/order/index.js";
import productApp from "./services/product/index.js";
import categoryApp from "./services/category/index.js";
import reviewRoutes from "./services/review/routes/review.routes.js";
import geminiApp from "./services/gemini/index.js";

import spiritApp from "./services/spirit/index.js";
import cardTemplateApp from "./services/cardTemplate/index.js";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("trust proxy", 1); // Trust first proxy (ngrok/vercel)
const PORT = process.env.PORT || 5001;

// CORS Configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =============================================
// API GATEWAY - Route to services
// =============================================

// Mount User Service (vẫn dùng /api/auth cho backward compatibility)
app.use("/api/auth", userApp);
app.use(userApp);

// Mount Order Service
app.use(orderApp);

// Mount Product Service
app.use(productApp);

// Mount Category Service
app.use(categoryApp);

// Mount Review Service
app.use("/api/reviews", reviewRoutes);

// Mount Gemini Service
app.use(geminiApp);



// Mount Spirit Service
app.use(spiritApp);

// Mount Card Template Service
app.use(cardTemplateApp);

// =============================================
// Health Check & Info
// =============================================

app.get("/", (req, res) => {
  res.json({
    name: "Giftnity API Gateway",
    version: "2.0.0",
    architecture: "True Microservices",
    services: {
      auth: "/api/auth (users_db)",
      orders: "/api/orders (orders_db)",
      products: "/api/products (products_db)",
    },
    status: "running",
  });
});

app.get("/health", (req, res) => {
  res.json({
    gateway: "ok",
    timestamp: new Date().toISOString(),
  });
});

// =============================================
// Error handling
// =============================================

app.use((err, req, res, next) => {
  console.error("Gateway Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// =============================================
// Start Server
// =============================================

app.listen(PORT, () => {
  console.log("\n==============================================");
  console.log("🚀 GIFTNITY API GATEWAY");
  console.log("==============================================");
  console.log(`📡 Gateway running on port ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log("----------------------------------------------");
  console.log("📦 Microservices Architecture:");
  console.log("   ├── Auth Service    → /api/auth    (users_db)");
  console.log("   ├── Order Service   → /api/orders  (orders_db)");
  console.log("   └── Product Service → /api/products (products_db)");
  console.log("==============================================\n");
});

export default app;

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Product Service connects to products_db
const MONGODB_URI = process.env.MONGODB_PRODUCTS_URI || "mongodb://localhost:27017/giftnity_products";

const connection = mongoose.createConnection(MONGODB_URI);

connection.on("connected", () => {
  console.log("✅ Product Service: Connected to products_db");
});

connection.on("error", (err) => {
  console.error("❌ Product Service DB Error:", err.message);
});

// Export connection for both Product and Category to share
export default connection;

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Category dùng chung database với Product
const MONGODB_URI = process.env.MONGODB_PRODUCTS_URI || "mongodb://localhost:27017/giftnity_products";

const connection = mongoose.createConnection(MONGODB_URI);

connection.on("connected", () => {
  console.log("   ✅ Category DB connected");
});

connection.on("error", (err) => {
  console.error("   ❌ Category DB error:", err.message);
});

export default connection;

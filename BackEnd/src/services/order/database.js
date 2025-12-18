import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Order Service connects to orders_db
const MONGODB_URI = process.env.MONGODB_ORDERS_URI || "mongodb://localhost:27017/giftnity_orders";

const connection = mongoose.createConnection(MONGODB_URI);

connection.on("connected", () => {
  console.log("✅ Order Service: Connected to orders_db");
});

connection.on("error", (err) => {
  console.error("❌ Order Service DB Error:", err.message);
});

export default connection;

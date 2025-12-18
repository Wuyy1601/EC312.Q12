import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// User Service connects to users_db
const MONGODB_URI = process.env.MONGODB_USERS_URI || "mongodb://localhost:27017/giftnity_users";

const connection = mongoose.createConnection(MONGODB_URI);

connection.on("connected", () => {
  console.log("✅ User Service: Connected to users_db");
});

connection.on("error", (err) => {
  console.error("❌ User Service DB Error:", err.message);
});

export default connection;

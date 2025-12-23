import mongoose from "mongoose";
import dotenv from "dotenv";
import { userConnection } from "./src/config/database.js";
import User from "./src/models/user.js";

dotenv.config();

const checkUsers = async () => {
  try {
    console.log("📋 Danh sách users trong database:\n");
    
    const users = await User.find({}).select("username email");
    
    if (users.length === 0) {
      console.log("❌ Không có user nào trong database!");
      console.log("\n💡 Hãy đăng ký user mới hoặc test với email khác");
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. Username: ${user.username}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   ID: ${user._id}\n`);
      });
      
      console.log(`✅ Tổng: ${users.length} users`);
      console.log("\n💡 Hãy dùng 1 trong các email trên để test Forgot Password");
    }
    
  } catch (error) {
    console.error("❌ Lỗi:", error.message);
  }
  
  process.exit(0);
};

checkUsers();

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Cấu hình tất cả databases ở đây - Muốn thêm DB mới chỉ cần thêm vào đây
const dbConfigs = {
  users: process.env.MONGODB_USERS_URI,
  products: process.env.MONGODB_PRODUCTS_URI,
  // orders: process.env.MONGODB_ORDERS_URI,  // VD: Thêm DB mới
};

// Tạo connections tự động
const connections = {};

Object.entries(dbConfigs).forEach(([name, uri]) => {
  if (!uri) {
    console.warn(`  Chưa có URI cho database "${name}" trong .env`);
    return;
  }

  const conn = mongoose.createConnection(uri);

  conn.on("connected", () => {
    console.log(` Kết nối ${name.toUpperCase()} DB thành công`);
  });

  connections[name] = conn;
});

// Export connections
export const { users: userConnection, products: productConnection } =
  connections;
export default connections;

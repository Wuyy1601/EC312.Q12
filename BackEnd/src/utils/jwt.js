import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

/**
 * Tạo JWT token
 * @param {Object} payload - Dữ liệu user (id, email, username)
 * @param {String} expiresIn - Thời gian hết hạn (VD: "7d", "1h", "30d")
 * @returns {String} JWT token
 */
export const generateToken = (payload, expiresIn = "7d") => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * Xác thực JWT token
 * @param {String} token - JWT token cần kiểm tra
 * @returns {Object|null} Decoded payload hoặc null nếu invalid
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export default { generateToken, verifyToken };

import bcrypt from "bcryptjs";

/**
 * Middleware hash password trước khi lưu vào database
 * Dùng cho register và update password
 */

//1. Hàm hash password
// Input: password gốc (VD: "123456")
// Output: password đã hash (VD: "$2a$10$abc...")
  // Hash password với salt
  // bcrypt tự động kết hợp salt vào password đã hash
  // Cùng 1 password nhưng mỗi lần hash sẽ ra kết quả khác nhau (vì salt khác)
  // Tạo "salt" - chuỗi ngẫu nhiên để tăng độ bảo mật
  // 10 = độ phức tạp (cost factor)
  // Càng cao càng an toàn nhưng hash chậm hơn
    // VD: "123456" → "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
export const hashPassword = async (password) => {

  const salt = await bcrypt.genSalt(10);


  const hashedPassword = await bcrypt.hash(password, salt);

  return hashedPassword;

};

//2. Hàm so sánh password khi login
// Input:
//   - plainPassword: password user nhập (VD: "123456")
//   - hashedPassword: password đã hash trong DB (VD: "$2a$10$abc...")
// bcrypt.compare sẽ:
  // 1. Lấy salt từ hashedPassword (có chứa sẵn trong chuỗi)
  // 2. Hash plainPassword với salt đó
  // 3. So sánh 2 chuỗi hash
// Output: true nếu khớp, false nếu không
export const comparePassword = async (plainPassword, hashedPassword) => {
  
  const isMatch = await bcrypt.compare(plainPassword, hashedPassword);

  return isMatch; // true hoặc false
};

export default { hashPassword, comparePassword };

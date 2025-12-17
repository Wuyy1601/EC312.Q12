import jwt from "jsonwebtoken";

// Middleware xác thực token JWT
export const authenticateToken = (req, res, next) => {
    try {
        // Lấy token từ header Authorization
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Không tìm thấy token. Vui lòng đăng nhập.",
            });
        }

        // Xác thực token
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({
                    success: false,
                    message: "Token không hợp lệ hoặc đã hết hạn.",
                });
            }
            // Lưu thông tin user vào request để sử dụng ở controller
            req.user = user;
            next();
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi server khi xác thực token.",
            error: error.message,
        });
    }
};
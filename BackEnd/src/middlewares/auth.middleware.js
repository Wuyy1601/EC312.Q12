import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware để verify JWT token
export const protect = async (req, res, next) => {
  let token;

  // Kiểm tra token trong header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Lấy token từ header (Bearer TOKEN)
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Lấy thông tin user từ token (không lấy password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }

      // Kiểm tra tài khoản có active không
      if (!req.user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Tài khoản đã bị khóa'
        });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Vui lòng đăng nhập để truy cập'
    });
  }
};

// Middleware để kiểm tra role (admin only)
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Chỉ admin mới có quyền truy cập'
    });
  }
};

// Middleware để kiểm tra multiple roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' không có quyền truy cập`
      });
    }
    next();
  };
};

import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>GIỚI THIỆU</h3>
          <ul>
            <li>
              <Link to="/about">Về chúng tôi</Link>
            </li>
            <li>
              <Link to="/story">Câu chuyện thương hiệu</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>HỖ TRỢ KHÁCH HÀNG</h3>
          <ul>
            <li>
              <Link to="/faq">FAQ</Link>
            </li>
            <li>
              <Link to="/order-guide">Hướng dẫn mua hàng</Link>
            </li>
            <li>
              <Link to="/shipping-policy">Chính sách vận chuyển</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>CHÍNH SÁCH</h3>
          <ul>
            <li>
              <Link to="/return-policy">Đổi trả</Link>
            </li>
            <li>
              <Link to="/privacy-policy">Bảo mật thông tin</Link>
            </li>
            <li>
              <Link to="/terms">Điều khoản sử dụng</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>THÔNG TIN LIÊN HỆ</h3>
          <ul>
            <li>
              <Link to="/contact">
                <i className="fa-solid fa-map-marker-alt" style={{ marginRight: "8px" }}></i> Địa chỉ
              </Link>
            </li>
            <li>
              <Link to="/hotline">
                <i className="fa-solid fa-phone" style={{ marginRight: "8px" }}></i> Hotline
              </Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>MXH</h3>
          <ul>
            <li>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center" }}
              >
                <i className="fa-brands fa-facebook" style={{ marginRight: "8px" }}></i> Facebook
              </a>
            </li>
            <li>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center" }}
              >
                <i className="fa-brands fa-instagram" style={{ marginRight: "8px" }}></i> Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="payment-methods">
          <img src="/momo-logo.png" alt="MoMo" className="payment-logo" />
          <img src="/visa-logo.png" alt="VISA" className="payment-logo" />
        </div>
        <p className="footer-text">
          © 2025 Giftnity. Bảo lưu mọi quyền. Đã đăng ký Bộ Công Thương. Chỉ
          tiếp nhận đơn hàng từ 7h - 22h, Đã đăng ký Bộ Công Thương.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

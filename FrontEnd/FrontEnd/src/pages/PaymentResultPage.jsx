import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaSpinner } from "react-icons/fa";
import "./PaymentResultPage.css";

const PaymentResultPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const status = searchParams.get("status");
  const orderCode = searchParams.get("orderCode");
  const message = searchParams.get("message");

  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Xóa giỏ hàng nếu thanh toán thành công
    if (status === "success") {
      localStorage.removeItem("cartItems");
      localStorage.removeItem("discountCode");
      localStorage.removeItem("discountAmount");
      localStorage.removeItem("paymentMethod");
    }

    // Auto redirect sau 10s
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, navigate]);

  const renderContent = () => {
    switch (status) {
      case "success":
        return (
          <div className="result-content success">
            <FaCheckCircle className="result-icon" />
            <h1>Thanh toán thành công!</h1>
            <p className="order-code">Mã đơn hàng: <strong>{orderCode}</strong></p>
            <p>Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.</p>
            <p className="email-notice">📧 Email xác nhận đã được gửi đến email của bạn.</p>
          </div>
        );
      
      case "failed":
        return (
          <div className="result-content failed">
            <FaTimesCircle className="result-icon" />
            <h1>Thanh toán thất bại</h1>
            {orderCode && <p className="order-code">Mã đơn hàng: <strong>{orderCode}</strong></p>}
            <p className="error-message">{decodeURIComponent(message || "Giao dịch không thành công")}</p>
            <p>Vui lòng thử lại hoặc chọn phương thức thanh toán khác.</p>
          </div>
        );
      
      case "error":
        return (
          <div className="result-content error">
            <FaTimesCircle className="result-icon" />
            <h1>Đã xảy ra lỗi</h1>
            <p>{decodeURIComponent(message || "Lỗi không xác định")}</p>
          </div>
        );
      
      default:
        return (
          <div className="result-content loading">
            <FaSpinner className="result-icon spinner" />
            <h1>Đang xử lý...</h1>
          </div>
        );
    }
  };

  return (
    <div className="payment-result-page">
      <div className="result-container">
        {renderContent()}
        
        <div className="result-actions">
          <button className="home-btn" onClick={() => navigate("/")}>
            Về trang chủ ({countdown}s)
          </button>
          {status === "failed" && (
            <button className="retry-btn" onClick={() => navigate("/cart")}>
              Thử lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;

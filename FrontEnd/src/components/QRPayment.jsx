import { useState, useEffect } from "react";
import { FaCopy, FaCheck, FaSpinner, FaCheckCircle } from "react-icons/fa";
import "./QRPayment.css";

const QRPayment = ({ paymentInfo, orderCode, onPaymentSuccess }) => {
  const [copied, setCopied] = useState(null);
  const [checking, setChecking] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [countdown, setCountdown] = useState(15 * 60); // 15 phút

  // Countdown timer
  useEffect(() => {
    if (isPaid || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaid, countdown]);

  // Auto check payment status mỗi 10 giây
  useEffect(() => {
    if (isPaid) return;

    const checkPayment = async () => {
      try {
        setChecking(true);
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:5001"
          }/api/orders/${orderCode}/payment-status`
        );
        const data = await response.json();

        if (data.paymentStatus === "paid") {
          setIsPaid(true);
          onPaymentSuccess && onPaymentSuccess();
        }
      } catch (error) {
        console.error("Error checking payment:", error);
      } finally {
        setChecking(false);
      }
    };

    // Check ngay lập tức
    checkPayment();

    // Check mỗi 10 giây
    const interval = setInterval(checkPayment, 10000);

    return () => clearInterval(interval);
  }, [orderCode, isPaid, onPaymentSuccess]);

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (isPaid) {
    return (
      <div className="qr-payment-container">
        <div className="payment-success">
          <FaCheckCircle className="success-icon" />
          <h2>Thanh toán thành công!</h2>
          <p>Đơn hàng #{orderCode} đã được xác nhận</p>
          <p>Bạn sẽ nhận được email xác nhận trong giây lát.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="qr-payment-container">
      <div className="qr-payment-header">
        <h2>Quét mã để thanh toán</h2>
        <div className="countdown">
          <span>Thời gian còn lại: </span>
          <span className={countdown < 60 ? "urgent" : ""}>
            {formatTime(countdown)}
          </span>
        </div>
      </div>

      <div className="qr-payment-content">
        <div className="qr-code-section">
          <img
            src={paymentInfo.qrUrl}
            alt="QR Code thanh toán"
            className="qr-image"
          />
          <p className="scan-text">Quét mã bằng ứng dụng ngân hàng</p>
        </div>

        <div className="bank-info-section">
          <h3>Thông tin chuyển khoản</h3>

          <div className="info-row">
            <span className="label">Ngân hàng:</span>
            <span className="value">{paymentInfo.bankName}</span>
          </div>

          <div className="info-row">
            <span className="label">Số tài khoản:</span>
            <div className="value-with-copy">
              <span className="value">{paymentInfo.accountNumber}</span>
              <button
                className="copy-btn"
                onClick={() =>
                  copyToClipboard(paymentInfo.accountNumber, "account")
                }
              >
                {copied === "account" ? <FaCheck /> : <FaCopy />}
              </button>
            </div>
          </div>

          <div className="info-row">
            <span className="label">Chủ tài khoản:</span>
            <span className="value">{paymentInfo.accountName}</span>
          </div>

          <div className="info-row">
            <span className="label">Số tiền:</span>
            <div className="value-with-copy">
              <span className="value amount">
                {paymentInfo.amount.toLocaleString("vi-VN")}đ
              </span>
              <button
                className="copy-btn"
                onClick={() =>
                  copyToClipboard(paymentInfo.amount.toString(), "amount")
                }
              >
                {copied === "amount" ? <FaCheck /> : <FaCopy />}
              </button>
            </div>
          </div>

          <div className="info-row transfer-content">
            <span className="label">Nội dung CK:</span>
            <div className="value-with-copy">
              <span className="value content">
                {paymentInfo.transferContent}
              </span>
              <button
                className="copy-btn"
                onClick={() =>
                  copyToClipboard(paymentInfo.transferContent, "content")
                }
              >
                {copied === "content" ? <FaCheck /> : <FaCopy />}
              </button>
            </div>
          </div>

          <div className="warning-box">
            <p>
              ⚠️ <strong>Lưu ý:</strong> Vui lòng nhập chính xác nội dung chuyển
              khoản để đơn hàng được xác nhận tự động.
            </p>
          </div>

          <div className="checking-status">
            {checking ? (
              <>
                <FaSpinner className="spinner" />
                <span>Đang kiểm tra thanh toán...</span>
              </>
            ) : (
              <span>Tự động kiểm tra mỗi 10 giây</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRPayment;

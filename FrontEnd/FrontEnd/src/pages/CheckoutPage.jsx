import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCopy,
  FaCheck,
  FaSpinner,
  FaCheckCircle,
} from "react-icons/fa";
import GiftMessageForm from "../components/GiftMessageForm";
import MessageCardPreview from "../components/MessageCardPreview";
import "./CheckoutPage.css";

const CheckoutPage = () => {
  const navigate = useNavigate();

  // Lấy cart items từ localStorage (hoặc context/redux)
  const [cartItems] = useState(() => {
    const saved = localStorage.getItem("cartItems");
    return saved ? JSON.parse(saved) : [];
  });

  const [paymentMethod] = useState(() => {
    return localStorage.getItem("paymentMethod") || "bank";
  });

  // Form thông tin khách hàng
  const [customerInfo, setCustomerInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });

  // State cho checkout flow
  const [step, setStep] = useState(1); // 1: Form, 2: QR/COD, 3: Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [copied, setCopied] = useState(null);
  const [checking, setChecking] = useState(false);

  // State cho gift message (FR-M.01, FR-M.02, FR-M.03)
  const [giftMessage, setGiftMessage] = useState({
    enabled: false,
    recipientName: "",
    relationship: "",
    occasion: "",
    message: "",
    cardDesign: "classic",
  });

  // Tính tổng tiền
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = parseInt(localStorage.getItem("discountAmount") || "0");
  const total = subtotal - discount;

  // Handle form change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({ ...prev, [name]: value }));
  };

  // Copy to clipboard
  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  // STEP 2A: Submit form và tạo đơn hàng
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Lấy user data nếu đã đăng nhập
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;

      // Gọi API tạo đơn hàng
      const response = await fetch("http://localhost:5001/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
        body: JSON.stringify({
          userId: user?.id || null, // Gửi userId nếu đã đăng nhập
          customerInfo,
          items: cartItems.map((item) => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          totalAmount: total,
          discountCode: localStorage.getItem("discountCode") || null,
          discountAmount: discount,
          paymentMethod,
          giftMessage: giftMessage.enabled ? giftMessage : { enabled: false },
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Lỗi tạo đơn hàng");
      }

      // Lưu thông tin đơn hàng
      setOrder(data.order);
      setPaymentInfo(data.paymentInfo);

      // Chuyển sang bước hiển thị QR hoặc thành công (nếu COD)
      if (paymentMethod === "cod") {
        setStep(3); // COD thì thành công luôn
        localStorage.removeItem("cartItems"); // Xóa giỏ hàng
      } else if (data.paymentInfo?.payUrl) {
        // MoMo: Chuyển hướng sang trang thanh toán MoMo
        window.location.href = data.paymentInfo.payUrl;
      } else {
        setStep(2); // Hiển thị Bank QR
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2B: Auto check payment status (polling)
  useEffect(() => {
    if (step !== 2 || !order) return;

    const checkPayment = async () => {
      try {
        setChecking(true);
        const response = await fetch(
          `http://localhost:5001/api/orders/${order.orderCode}/payment-status`
        );
        const data = await response.json();

        if (data.paymentStatus === "paid") {
          setStep(3); // Chuyển sang thành công
          localStorage.removeItem("cartItems"); // Xóa giỏ hàng
        }
      } catch (err) {
        console.error("Check payment error:", err);
      } finally {
        setChecking(false);
      }
    };

    // Check ngay lập tức
    checkPayment();

    // Check mỗi 5 giây
    const interval = setInterval(checkPayment, 5000);

    return () => clearInterval(interval);
  }, [step, order]);

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  // ============ RENDER STEP 1: Form thông tin ============
  const renderStep1 = () => (
    <div className="checkout-form-section">
      <h2>📦 Thông tin giao hàng</h2>
      <form onSubmit={handleSubmitOrder}>
        <div className="form-group">
          <label>Họ và tên *</label>
          <input
            type="text"
            name="fullName"
            value={customerInfo.fullName}
            onChange={handleInputChange}
            placeholder="Nguyễn Văn A"
            required
          />
        </div>

        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={customerInfo.email}
            onChange={handleInputChange}
            placeholder="email@example.com"
            required
          />
        </div>

        <div className="form-group">
          <label>Số điện thoại *</label>
          <input
            type="tel"
            name="phone"
            value={customerInfo.phone}
            onChange={handleInputChange}
            placeholder="0901234567"
            required
          />
        </div>

        <div className="form-group">
          <label>Địa chỉ giao hàng *</label>
          <textarea
            name="address"
            value={customerInfo.address}
            onChange={handleInputChange}
            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
            required
          />
        </div>

        {/* Gift Message Form - FR-M.01, FR-M.02 */}
        <GiftMessageForm
          giftMessage={giftMessage}
          setGiftMessage={setGiftMessage}
        />

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? (
            <>
              <FaSpinner className="spinner" /> Đang xử lý...
            </>
          ) : paymentMethod === "cod" ? (
            "Đặt hàng"
          ) : (
            "Tiếp tục thanh toán"
          )}
        </button>
      </form>
    </div>
  );

  // ============ RENDER STEP 2: QR Payment ============
  const renderStep2 = () => (
    <div className="qr-payment-section">
      <h2>💳 Quét mã để thanh toán</h2>
      <p className="order-code-display">
        Mã đơn hàng: <strong>{order?.orderCode}</strong>
      </p>

      <div className="qr-content">
        <div className="qr-code-box">
          <img
            src={paymentInfo?.qrUrl}
            alt="QR Code thanh toán"
            className="qr-image"
          />
          <p>Quét bằng app ngân hàng</p>
        </div>

        <div className="bank-details">
          <h3>Thông tin chuyển khoản</h3>

          <div className="detail-row">
            <span className="label">Ngân hàng:</span>
            <span className="value">{paymentInfo?.bankName}</span>
          </div>

          <div className="detail-row">
            <span className="label">Số TK:</span>
            <span className="value">{paymentInfo?.accountNumber}</span>
            <button
              className="copy-btn"
              onClick={() =>
                copyToClipboard(paymentInfo?.accountNumber, "account")
              }
            >
              {copied === "account" ? <FaCheck /> : <FaCopy />}
            </button>
          </div>

          <div className="detail-row">
            <span className="label">Chủ TK:</span>
            <span className="value">{paymentInfo?.accountName}</span>
          </div>

          <div className="detail-row">
            <span className="label">Số tiền:</span>
            <span className="value amount">{formatPrice(total)}đ</span>
            <button
              className="copy-btn"
              onClick={() => copyToClipboard(total.toString(), "amount")}
            >
              {copied === "amount" ? <FaCheck /> : <FaCopy />}
            </button>
          </div>

          <div className="detail-row transfer-content">
            <span className="label">Nội dung CK:</span>
            <span className="value content">
              {paymentInfo?.transferContent}
            </span>
            <button
              className="copy-btn"
              onClick={() =>
                copyToClipboard(paymentInfo?.transferContent, "content")
              }
            >
              {copied === "content" ? <FaCheck /> : <FaCopy />}
            </button>
          </div>

          <div className="warning">
            ⚠️ Nhập chính xác nội dung chuyển khoản để đơn hàng được xác nhận tự
            động!
          </div>

          <div className="checking-status">
            {checking ? (
              <>
                <FaSpinner className="spinner" /> Đang kiểm tra thanh toán...
              </>
            ) : (
              "🔄 Tự động kiểm tra mỗi 5 giây"
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // ============ RENDER STEP 3: Success ============
  const renderStep3 = () => (
    <div className="success-section">
      <FaCheckCircle className="success-icon" />
      <h2>
        {paymentMethod === "cod"
          ? "Đặt hàng thành công!"
          : "Thanh toán thành công!"}
      </h2>
      <p className="order-code">Mã đơn hàng: #{order?.orderCode}</p>
      <p>
        {paymentMethod === "cod"
          ? "Đơn hàng của bạn đã được tạo. Vui lòng chuẩn bị tiền mặt khi nhận hàng."
          : "Chúng tôi đã nhận được thanh toán. Đơn hàng đang được xử lý."}
      </p>
      <p className="email-notice">
        📧 Email xác nhận đã được gửi đến <strong>{customerInfo.email}</strong>
      </p>
      <button className="home-btn" onClick={() => navigate("/")}>
        Về trang chủ
      </button>
    </div>
  );

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {/* Header */}
        <div className="checkout-header">
          <button className="back-btn" onClick={() => navigate("/cart")}>
            <FaArrowLeft /> Quay lại
          </button>
          <h1>Thanh toán</h1>
        </div>

        {/* Progress Steps */}
        <div className="progress-steps">
          <div className={`step ${step >= 1 ? "active" : ""}`}>
            <span className="step-num">1</span>
            <span>Thông tin</span>
          </div>
          <div className={`step-line ${step >= 2 ? "active" : ""}`}></div>
          <div className={`step ${step >= 2 ? "active" : ""}`}>
            <span className="step-num">2</span>
            <span>Thanh toán</span>
          </div>
          <div className={`step-line ${step >= 3 ? "active" : ""}`}></div>
          <div className={`step ${step >= 3 ? "active" : ""}`}>
            <span className="step-num">3</span>
            <span>Hoàn tất</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="checkout-content">
          <div className="checkout-main">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </div>

          {/* Order Summary Sidebar */}
          {step < 3 && (
            <div className="order-summary">
              <h3>📋 Đơn hàng của bạn</h3>
              <div className="summary-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="summary-item">
                    <img src={item.image} alt={item.name} />
                    <div className="item-info">
                      <p className="item-name">{item.name}</p>
                      <p className="item-qty">x{item.quantity}</p>
                    </div>
                    <p className="item-price">
                      {formatPrice(item.price * item.quantity)}đ
                    </p>
                  </div>
                ))}
              </div>

              <div className="summary-totals">
                <div className="total-row">
                  <span>Tạm tính:</span>
                  <span>{formatPrice(subtotal)}đ</span>
                </div>
                {discount > 0 && (
                  <div className="total-row discount">
                    <span>Giảm giá:</span>
                    <span>-{formatPrice(discount)}đ</span>
                  </div>
                )}
                <div className="total-row final">
                  <span>Tổng cộng:</span>
                  <span>{formatPrice(total)}đ</span>
                </div>
              </div>

              <div className="payment-method-display">
                <span>Phương thức:</span>
                <span>
                  {paymentMethod === "cod"
                    ? "Thanh toán khi nhận hàng"
                    : paymentMethod === "momo"
                    ? "Ví MoMo"
                    : paymentMethod === "vnpay"
                    ? "VNPAY"
                    : "Chuyển khoản ngân hàng"}
                </span>
              </div>

              {/* Message Card Preview - FR-M.03 */}
              <MessageCardPreview
                giftMessage={giftMessage}
                onDesignChange={(design) =>
                  setGiftMessage((prev) => ({ ...prev, cardDesign: design }))
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

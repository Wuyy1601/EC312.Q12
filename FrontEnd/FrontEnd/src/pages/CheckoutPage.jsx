import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCopy,
  FaCheckCircle,
  FaSpinner,
  FaCheck
} from "react-icons/fa";
import GreetingCardModal from "../components/GreetingCardModal";
import "./CheckoutPage.css";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  // Cart loading
  const [cartItems] = useState(() => {
    const saved = localStorage.getItem("cartItems");
    return saved ? JSON.parse(saved) : [];
  });

  // State
  const [customerInfo, setCustomerInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    province: "Tỉnh/Thành phố",
    district: "Xã/Phường",
    address: "",
    note: "",
  });

  // Autofill user info if logged in
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCustomerInfo(prev => ({
          ...prev,
          fullName: user.fullName || user.username || "",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || ""
        }));
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  }, []);

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [shippingMethod, setShippingMethod] = useState("standard");
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [checking, setChecking] = useState(false);
  const [copied, setCopied] = useState(null);

  const [giftMessage, setGiftMessage] = useState({
    enabled: false,
    message: "",
    design: "classic",
    templateName: "" 
  });

  // Calculations
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  // Shipping cost
  const shippingCost = shippingMethod === "fast" ? 45000 : 30000;
  
  // Card Fee Logic
  const cardFee = giftMessage.enabled ? 20000 : 0;

  const discount = parseInt(localStorage.getItem("discountAmount") || "0");
  const total = subtotal + shippingCost + cardFee - discount;

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({ ...prev, [name]: value }));
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSubmitOrder = async () => {
    setLoading(true);
    try {
      // Mock Order Creation Logic or API Call
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;

      const response = await fetch("http://localhost:5001/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
        body: JSON.stringify({
          userId: user?.id,
          customerInfo,
          items: cartItems.map(item => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          totalAmount: total,
          shippingMethod,
          shippingCost,
          paymentMethod,
          discountAmount: discount,
          cardFee: cardFee, // Send card fee
          giftMessage: giftMessage.enabled ? giftMessage : { enabled: false }
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Lỗi tạo đơn");

      setOrder(data.order);
      setPaymentInfo(data.paymentInfo);

      if (paymentMethod === "cod") {
        setStep(3); // Success immediately
        localStorage.removeItem("cartItems");
      } else if (data.paymentInfo?.payUrl) {
         window.location.href = data.paymentInfo.payUrl;
      } else {
        setStep(2); // Show QR
      }

    } catch (err) {
      alert("Lỗi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2 Polling
  useEffect(() => {
    if (step !== 2 || !order) return;
    const checkPayment = async () => {
      try {
        setChecking(true);
        const res = await fetch(`http://localhost:5001/api/orders/${order.orderCode}/payment-status`);
        const data = await res.json();
        if (data.paymentStatus === "paid") {
          setStep(3);
          localStorage.removeItem("cartItems");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setChecking(false);
      }
    };
    checkPayment();
    const interval = setInterval(checkPayment, 5000);
    return () => clearInterval(interval);
  }, [step, order]);

  // Format
  const formatPrice = (p) => new Intl.NumberFormat("vi-VN").format(p);

  // RENDER STEP 1: Main Checkout Layout
  const renderCheckoutLayout = () => (
    <div className="checkout-layout">
      {/* LEFT: CLIPBOARD FORM */}
      <div className="clipboard-panel">
        <div className="clipboard-clip"></div>
        
        <div className="clipboard-content">
          {/* Header Lines */}
          <div className="form-row two-col">
            <div className="input-group">
              <label>Họ và tên *</label>
              <input type="text" name="fullName" value={customerInfo.fullName} onChange={handleInputChange} placeholder="Nhập họ tên" />
            </div>
            <div className="input-group">
              <label>Số điện thoại *</label>
              <input type="text" name="phone" value={customerInfo.phone} onChange={handleInputChange} placeholder="Nhập số điện thoại" />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
               <label>Email (để nhận thông báo đơn hàng) *</label>
               <input type="email" name="email" value={customerInfo.email} onChange={handleInputChange} placeholder="example@gmail.com" />
            </div>
          </div>

          <div className="form-row two-col">
            <div className="input-group">
              <label>Tỉnh/Thành phố *</label>
              <select name="province" value={customerInfo.province} onChange={handleInputChange}>
                <option>Hà Nội</option>
                <option>TP.HCM</option>
                <option>Đà Nẵng</option>
              </select>
            </div>
            <div className="input-group">
              <label>Xã/Phường *</label>
              <select name="district" value={customerInfo.district} onChange={handleInputChange}>
                <option>Phường 1</option>
                <option>Phường 2</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <label>Địa chỉ chi tiết *</label>
            <textarea name="address" value={customerInfo.address} onChange={handleInputChange} className="address-area"></textarea>
          </div>

          <div className="form-row checkbox-row">
             <label className="checkbox-label">
                <input type="checkbox" /> Ghi nhớ thông tin địa chỉ
             </label>
          </div>

          {/* GREETING CARD PROMPT */}
          <div className="gift-prompt-row">
            <div className="prompt-left">
              <span className="sparkle-icon">✨</span>
              <span>Bạn có muốn tạo một tấm thiệp cho món quà này không?</span>
            </div>
            <button className="create-card-btn" onClick={() => setIsCardModalOpen(true)}>
              {giftMessage.enabled ? "XEM LẠI THIỆP" : "TẠO THIỆP (+20k)"}
            </button>
          </div>

          {/* SHIPPING METHOD */}
          <div className="section-block">
             <h4>Phương thức vận chuyển</h4>
             <div className="radio-group-vertical">
               <label className={`radio-opt ${shippingMethod === 'standard' ? 'checked' : ''}`}>
                 <input type="radio" name="shipping" checked={shippingMethod === 'standard'} onChange={() => setShippingMethod('standard')} />
                 <div className="radio-content">
                    <span className="radio-title">🚚 Giao hàng Tiêu chuẩn</span>
                    <span className="radio-desc">Giao hàng trong 3-5 ngày</span>
                 </div>
                 <span className="radio-price">30.000 đ</span>
               </label>
               <label className={`radio-opt ${shippingMethod === 'fast' ? 'checked' : ''}`}>
                 <input type="radio" name="shipping" checked={shippingMethod === 'fast'} onChange={() => setShippingMethod('fast')} />
                 <div className="radio-content">
                    <span className="radio-title">⚡ Giao hàng Nhanh</span>
                    <span className="radio-desc">Giao hàng trong 1-2 ngày</span>
                 </div>
                 <span className="radio-price">45.000 đ</span>
               </label>
             </div>
          </div>

          {/* PAYMENT METHOD */}
          <div className="section-block">
             <h4>Phương thức thanh toán</h4>
             <div className="payment-select-area">
                <div className="payment-list-vertical">
                   {/* MOMO */}
                   <label className={`payment-card-opt momo ${paymentMethod === 'momo' ? 'active' : ''}`}>
                      <input type="radio" checked={paymentMethod === 'momo'} onChange={() => setPaymentMethod('momo')} />
                      <div className="payment-card-content">
                         <img src="https://avatars.githubusercontent.com/u/36770798?s=200&v=4" alt="MOMO" className="payment-logo big" />
                         <span className="payment-name">Ví MoMo</span>
                      </div>
                      {paymentMethod === 'momo' && <FaCheckCircle className="check-icon" />}
                   </label>

                   {/* VNPAY */}
                   <label className={`payment-card-opt vnpay ${paymentMethod === 'vnpay' ? 'active' : ''}`}>
                      <input type="radio" checked={paymentMethod === 'vnpay'} onChange={() => setPaymentMethod('vnpay')} />
                      <div className="payment-card-content">
                         <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-1.png" alt="VNPAY" className="payment-logo big" />
                         <span className="payment-name">VNPAY</span>
                      </div>
                      {paymentMethod === 'vnpay' && <FaCheckCircle className="check-icon" />}
                   </label>

                   {/* BANK QR */}
                   <label className={`payment-card-opt bank ${paymentMethod === 'bank' ? 'active' : ''}`}>
                      <input type="radio" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} />
                      <div className="payment-card-content">
                         <div className="icon-box"><span className="emoji-icon">🏦</span></div>
                         <div className="text-info">
                            <span className="payment-name">Chuyển khoản Ngân hàng</span>
                            <span className="payment-desc">Quét mã VietQR</span>
                         </div>
                      </div>
                      {paymentMethod === 'bank' && <FaCheckCircle className="check-icon" />}
                   </label>

                   {/* COD */}
                   <label className={`payment-card-opt cod ${paymentMethod === 'cod' ? 'active' : ''}`}>
                      <input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                      <div className="payment-card-content">
                         <div className="icon-box"><span className="emoji-icon">💵</span></div>
                         <div className="text-info">
                            <span className="payment-name">Thanh toán khi nhận hàng</span>
                            <span className="payment-desc">COD</span>
                         </div>
                      </div>
                      {paymentMethod === 'cod' && <FaCheckCircle className="check-icon" />}
                   </label>
                </div>
             </div>
          </div>

        </div>
      </div>

      {/* RIGHT: INVOICE */}
      <div className="invoice-panel">
         {/* Tape Top */}
         <div className="invoice-tape"></div>
         
         <div className="invoice-content">
            <h3 className="invoice-title">HÓA ĐƠN</h3>
            
            <div className="invoice-items">
              {cartItems.map(item => (
                <div key={item.id} className="invoice-item">
                  <img 
                    src={item.image && item.image.startsWith('http') ? item.image : "https://placehold.co/50x50/ffc0cb/ffffff?text=Gift"} 
                    alt={item.name} 
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src="https://placehold.co/50x50/ffc0cb/ffffff?text=Gift";
                    }}
                  />
                  <div className="invoice-item-info">
                     <p className="name">{item.name}</p>
                     <div className="qty-badge">
                       x{item.quantity}
                     </div>
                  </div>
                  <p className="price">{formatPrice(item.price * item.quantity)} VND</p>
                </div>
              ))}
            </div>

            <div className="invoice-divider"></div>

            <div className="invoice-summary">
               <div className="sum-row">
                 <span>Tạm tính</span>
                 <span>{formatPrice(subtotal)} VND</span>
               </div>
               <div className="sum-row">
                 <span>Phí vận chuyển</span>
                 <span>{formatPrice(shippingCost)} VND</span>
               </div>
               
               {/* Card Fee Row */}
               {giftMessage.enabled && (
                 <div className="sum-row" style={{color: '#e91e63'}}>
                   <span>Thiệp chúc mừng</span>
                   <span>{formatPrice(cardFee)} VND</span>
                 </div>
               )}

               {discount > 0 && (
                 <div className="sum-row discount">
                   <span>Giảm giá</span>
                   <span>-{formatPrice(discount)} VND</span>
                 </div>
               )}
               <div className="sum-row total">
                 <span>Tổng tiền</span>
                 <span>{formatPrice(total)} VND</span>
               </div>
            </div>

            <button className="confirm-checkout-btn" onClick={handleSubmitOrder} disabled={loading}>
              {loading ? <FaSpinner className="spin" /> : "THANH TOÁN"}
            </button>
         </div>
      </div>
    </div>
  );

  const renderStep2QR = () => (
     <div className="qr-step-container">
        <h2>Quét mã thanh toán</h2>
        <p>Mã đơn: {order?.orderCode}</p>
        <div className="qr-wrapper">
           <img src={paymentInfo?.qrUrl} alt="QR" /> 
        </div>
        <div className="bank-info-box">
           <p>Ngân hàng: {paymentInfo?.bankName}</p>
           <p>Số TK: {paymentInfo?.accountNumber} <FaCopy onClick={() => copyToClipboard(paymentInfo?.accountNumber, 'acc')} /></p>
           <p>Số Tiền: {formatPrice(total)} VND</p>
           <p>Nội dung: {paymentInfo?.transferContent}</p>
        </div>
        {checking && <p>Đang kiểm tra...</p>}
     </div>
  );

  const renderStep3Success = () => (
     <div className="success-step-container">
        <FaCheckCircle className="succ-icon" />
        <h2>Đặt hàng thành công!</h2>
        <p>Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi.</p>
        <button className="home-btn" onClick={() => navigate('/')}>Về trang chủ</button>
     </div>
  );

  return (
    <div className="checkout-page-new">
       <div className="checkout-container">
         <div className="checkout-header">
            <button className="back-btn" onClick={() => navigate('/cart')}>
               <FaArrowLeft /> Quay lại
            </button>
            <h1>Thanh toán</h1>
         </div>

         {step === 1 && renderCheckoutLayout()}
         {step === 2 && renderStep2QR()}
         {step === 3 && renderStep3Success()}
       </div>

       <GreetingCardModal 
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        onSave={(data) => {
          setGiftMessage({
            enabled: true,
            message: data.message,
            design: data.design
          });
        }}
       />
    </div>
  );
};

export default CheckoutPage;

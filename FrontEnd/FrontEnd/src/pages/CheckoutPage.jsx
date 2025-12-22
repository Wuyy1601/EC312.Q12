import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCopy,
  FaCheckCircle,
  FaSpinner,
  FaCheck,
  FaTimes
} from "react-icons/fa";
import GreetingCardModal from "../components/GreetingCardModal";
import ThreeDCard from "../components/ThreeDCard"; // Vanilla Three.js version
import { useCart } from "../context/CartContext";
import "./CheckoutPage.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const CATEGORIES = [
  { id: 'love', name: 'Tình yêu', emoji: '❤️' },
  { id: 'birthday', name: 'Sinh nhật', emoji: '🎂' },
  { id: 'holiday', name: 'Lễ hội', emoji: '🎉' },
  { id: 'thanks', name: 'Cảm ơn', emoji: '🙏' },
  { id: 'congrats', name: 'Chúc mừng', emoji: '🎊' },
  { id: 'wedding', name: 'Đám cưới', emoji: '💒' },
  { id: 'newyear', name: 'Năm mới', emoji: '🎆' },
  { id: 'other', name: 'Khác', emoji: '✨' }
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, clearCart } = useCart();
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  // Template State
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateCategory, setTemplateCategory] = useState('');

  // 3D Card State
  const [show3DCard, setShow3DCard] = useState(false);
  const [cardConfig, setCardConfig] = useState({
    message: "",
    sender: "Bạn",
    recipient: "Người thương",
    coverColor: "#ffcdc9",
    coverImage: null
  });

  // Fetch templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const url = templateCategory 
          ? `${API_URL}/api/card-templates?category=${templateCategory}`
          : `${API_URL}/api/card-templates`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setTemplates(data.templates);
        }
      } catch (err) {
        console.error('Error fetching templates:', err);
      }
    };
    fetchTemplates();
  }, [templateCategory]);

  // State initialization
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
            product: item.id,
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
          cardFee: cardFee,
          giftMessage: giftMessage.enabled ? giftMessage : { enabled: false }
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Lỗi tạo đơn");

      setOrder(data.order);
      setPaymentInfo(data.paymentInfo);

      if (paymentMethod === "cod") {
        setStep(3); // Success immediately
        clearCart();
      } else if (data.paymentInfo?.payUrl) {
         window.location.href = data.paymentInfo.payUrl;
      } else {
        setStep(2); // Show QR
        clearCart();
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
          clearCart();
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
              <span>Bạn có muốn tạo một tấm thiệp 3D cho món quà này không?</span>
            </div>
            <button className="create-card-btn" onClick={() => setShow3DCard(true)}>
              {giftMessage.enabled ? "XEM THIỆP 3D" : "TẠO THIỆP 3D (+20k)"}
            </button>
          </div>

          {/* 3D CARD EDITOR */}
          {show3DCard && (
            <div className="threed-card-editor-overlay">
              <div className="threed-card-container">
                <button className="close-card-btn" onClick={() => setShow3DCard(false)}>
                  <FaTimes />
                </button>
                
                <div className="card-preview-area">
                   <ThreeDCard 
                      message={cardConfig.message} 
                      sender={cardConfig.sender} 
                      recipient={cardConfig.recipient}
                      coverColor={cardConfig.coverColor}
                      coverImage={cardConfig.coverImage}
                   />
                   <p className="preview-hint">Di chuột hoặc nhấn để mở thiệp</p>
                </div>

                <div className="card-controls">
                   <h3>✨ Thiết kế thiệp 3D</h3>
                   
                   {/* Template Selection */}
                   <div className="control-group">
                      <label>📋 Chọn mẫu thiệp:</label>
                      <select 
                        value={templateCategory}
                        onChange={(e) => setTemplateCategory(e.target.value)}
                        style={{ marginBottom: '10px' }}
                      >
                        <option value="">Tất cả mẫu</option>
                        {CATEGORIES.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
                        ))}
                      </select>
                      
                      <div className="template-gallery" style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(3, 1fr)', 
                        gap: '8px',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        marginBottom: '10px'
                      }}>
                        {templates.map(tpl => (
                          <div 
                            key={tpl._id}
                            onClick={() => {
                              setSelectedTemplate(tpl);
                              setCardConfig({
                                ...cardConfig,
                                coverColor: tpl.coverColor,
                                coverImage: tpl.coverImage?.startsWith('http') ? tpl.coverImage : `${API_URL}${tpl.coverImage}`,
                                message: cardConfig.message || tpl.defaultMessage
                              });
                            }}
                            style={{
                              border: selectedTemplate?._id === tpl._id ? '3px solid #ec407a' : '2px solid #ddd',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              cursor: 'pointer',
                              position: 'relative'
                            }}
                          >
                            <img 
                              src={tpl.coverImage?.startsWith('http') ? tpl.coverImage : `${API_URL}${tpl.coverImage}`}
                              alt={tpl.name}
                              style={{ width: '100%', height: '60px', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.src = `https://placehold.co/100x60/${tpl.coverColor?.replace('#','')}/ffffff?text=${tpl.name?.charAt(0)}`;
                              }}
                            />
                            {tpl.isFeatured && (
                              <span style={{ 
                                position: 'absolute', 
                                top: '2px', 
                                right: '2px', 
                                fontSize: '10px',
                                background: '#ffc107',
                                borderRadius: '4px',
                                padding: '1px 3px'
                              }}>⭐</span>
                            )}
                          </div>
                        ))}
                      </div>
                   </div>

                   <div className="control-group">
                      <label>Người nhận:</label>
                      <input 
                        type="text" 
                        value={cardConfig.recipient} 
                        onChange={e => setCardConfig({...cardConfig, recipient: e.target.value})}
                        placeholder="VD: Mẹ yêu, Lan..."
                      />
                   </div>

                   <div className="control-group">
                      <label>Lời chúc:</label>
                      <textarea 
                        value={cardConfig.message} 
                        onChange={e => setCardConfig({...cardConfig, message: e.target.value})}
                        placeholder="Nhập lời chúc..."
                      />
                   </div>
                   
                   <div className="control-group">
                      <label>Màu bìa (hoặc chọn template ở trên):</label>
                      <div className="color-options">
                         {['#ffcdc9', '#aed9e0', '#f7d794', '#d1ccc0', '#ec407a'].map(c => (
                            <div 
                              key={c} 
                              className={`color-dot ${cardConfig.coverColor === c ? 'active' : ''}`}
                              style={{ backgroundColor: c }}
                              onClick={() => setCardConfig({...cardConfig, coverColor: c, coverImage: null})}
                            />
                         ))}
                      </div>
                   </div>

                   <div className="control-group">
                      <label>Người gửi:</label>
                      <input 
                        type="text" 
                        value={cardConfig.sender} 
                        onChange={e => setCardConfig({...cardConfig, sender: e.target.value})}
                        placeholder="Tên của bạn..."
                      />
                   </div>

                   <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                     <button 
                       type="button"
                       className="cancel-card-btn" 
                       onClick={() => setShow3DCard(false)}
                       style={{
                         flex: 1,
                         padding: '1rem',
                         background: '#f0f0f0',
                         color: '#666',
                         border: 'none',
                         borderRadius: '12px',
                         fontWeight: 'bold',
                         cursor: 'pointer'
                       }}
                     >
                       Hủy
                     </button>
                     <button 
                       className="save-card-btn" 
                       onClick={() => {
                         setGiftMessage({
                           enabled: true,
                           message: cardConfig.message,
                           design: '3d-custom',
                           meta: cardConfig
                         });
                         setShow3DCard(false);
                       }}
                       style={{ flex: 2 }}
                     >
                       ❤️ HOÀN TẤT (+20.000đ)
                     </button>
                   </div>
                </div>
              </div>
            </div>
          )}


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
           <p>Số Tiền: {formatPrice(paymentInfo?.amount || order?.totalAmount)} VND</p>
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

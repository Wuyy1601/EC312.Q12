import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { FaBox, FaChevronRight, FaCopy, FaCheck, FaSpinner, FaCreditCard } from 'react-icons/fa';
import './MyOrders.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const ORDER_STATUSES = {
  pending: { label: "Chờ xử lý", color: "#f59e0b", bg: "#fef3c7" },
  confirmed: { label: "Đã xác nhận", color: "#3b82f6", bg: "#dbeafe" },
  preparing: { label: "Đang chuẩn bị", color: "#8b5cf6", bg: "#ede9fe" },
  shipping: { label: "Đang vận chuyển", color: "#06b6d4", bg: "#cffafe" },
  delivered: { label: "Giao thành công", color: "#22c55e", bg: "#dcfce7" },
  cancelled: { label: "Đã hủy", color: "#ef4444", bg: "#fee2e2" },
};

const PAYMENT_STATUSES = {
  pending: { label: "Chưa thanh toán", color: "#f59e0b" },
  paid: { label: "Đã thanh toán", color: "#22c55e" },
  failed: { label: "Thất bại", color: "#ef4444" },
  refunded: { label: "Đã hoàn tiền", color: "#8b5cf6" },
};

const MyOrders = () => {
  const { user } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentOrder, setPaymentOrder] = useState(null); // Order đang thanh toán
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [copied, setCopied] = useState(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchMyOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchMyOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/orders/user/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data.data || []);
    } catch (error) {
      console.error("Fetch orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Lấy thông tin thanh toán cho đơn hàng
  const handlePayNow = async (order) => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${order.orderCode}`);
      const data = await res.json();
      if (data.success && data.paymentInfo) {
        setPaymentOrder(order);
        setPaymentInfo(data.paymentInfo);
      }
    } catch (error) {
      console.error("Get payment info error:", error);
    }
  };

  // Hủy đơn hàng
  const handleCancelOrder = async (order) => {
    const reason = prompt("Vui lòng nhập lý do hủy đơn (nếu có):");
    if (reason === null) return; // User pressed Cancel

    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;

    try {
      const res = await fetch(`${API_URL}/api/orders/${order.orderCode}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (data.success) {
        alert("Hủy đơn hàng thành công!");
        setOrders(orders.map(o => o.orderCode === order.orderCode ? { ...o, orderStatus: "cancelled" } : o));
        if (selectedOrder?.orderCode === order.orderCode) {
          setSelectedOrder({ ...selectedOrder, orderStatus: "cancelled" });
        }
      } else {
        alert(data.message || "Không thể hủy đơn hàng");
      }
    } catch (error) {
      console.error("Cancel order error:", error);
      alert("Lỗi kết nối");
    }
  };

  // Kiểm tra thanh toán
  useEffect(() => {
    if (!paymentOrder) return;

    const checkPayment = async () => {
      try {
        setChecking(true);
        const res = await fetch(`${API_URL}/api/orders/${paymentOrder.orderCode}/payment-status`);
        const data = await res.json();
        if (data.paymentStatus === "paid") {
          // Cập nhật đơn hàng trong list
          setOrders(orders.map(o => 
            o.orderCode === paymentOrder.orderCode 
              ? { ...o, paymentStatus: "paid" }
              : o
          ));
          setPaymentOrder(null);
          setPaymentInfo(null);
          alert("Thanh toán thành công!");
        }
      } catch (error) {
        console.error("Check payment error:", error);
      } finally {
        setChecking(false);
      }
    };

    checkPayment();
    const interval = setInterval(checkPayment, 5000);
    return () => clearInterval(interval);
  }, [paymentOrder]);

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatPrice = (price) => new Intl.NumberFormat("vi-VN").format(price) + "đ";
  const formatDate = (date) => new Date(date).toLocaleDateString("vi-VN", {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  if (loading) {
    return (
      <>
        <div className="profile-header">
          <h2>Đơn hàng của tôi</h2>
          <p>Theo dõi và quản lý đơn hàng</p>
        </div>
        <div className="orders-loading">Đang tải...</div>
      </>
    );
  }

  return (
    <>
      <div className="profile-header">
        <h2>Đơn hàng của tôi</h2>
        <p>Theo dõi và quản lý đơn hàng ({orders.length} đơn)</p>
      </div>

      {orders.length === 0 ? (
        <div className="no-orders">
          <FaBox className="no-orders-icon" />
          <h3>Chưa có đơn hàng nào</h3>
          <p>Bắt đầu mua sắm để thấy đơn hàng của bạn ở đây</p>
          <Link to="/" className="shop-now-btn">Mua sắm ngay</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-code">
                  <FaBox /> {order.orderCode}
                </div>
                <span 
                  className="order-status"
                  style={{ 
                    color: ORDER_STATUSES[order.orderStatus]?.color,
                    background: ORDER_STATUSES[order.orderStatus]?.bg
                  }}
                >
                  {ORDER_STATUSES[order.orderStatus]?.label}
                </span>
              </div>

              <div className="order-items">
                {order.items?.slice(0, 2).map((item, i) => (
                  <div key={i} className="order-item">
                    {item.image && (
                      <img src={item.image.startsWith('http') ? item.image : `${API_URL}${item.image}`} alt={item.name} />
                    )}
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-qty">x{item.quantity}</span>
                    </div>
                    <span className="item-price">{formatPrice(item.price)}</span>
                  </div>
                ))}
                {order.items?.length > 2 && (
                  <div className="more-items">+{order.items.length - 2} sản phẩm khác</div>
                )}
              </div>

              <div className="order-footer">
                <div className="order-info">
                  <span className="order-date">{formatDate(order.createdAt)}</span>
                  <span 
                    className="payment-status"
                    style={{ color: PAYMENT_STATUSES[order.paymentStatus]?.color }}
                  >
                    {PAYMENT_STATUSES[order.paymentStatus]?.label}
                  </span>
                </div>
                <div className="order-total">
                  <span>Tổng: </span>
                  <strong>{formatPrice(order.totalAmount)}</strong>
                </div>
              </div>

              <div className="order-actions">
                {/* Nút thanh toán nếu chưa thanh toán và không phải COD */}
                {order.orderStatus !== "cancelled" && order.paymentStatus === "pending" && order.paymentMethod !== "cod" && (
                  <button className="pay-now-btn" onClick={() => handlePayNow(order)}>
                    <FaCreditCard /> Thanh toán ngay
                  </button>
                )}
                <button className="view-detail-btn" onClick={() => setSelectedOrder(order)}>
                  Xem chi tiết <FaChevronRight />
                </button>
                
                {(order.orderStatus === "pending" || order.orderStatus === "confirmed") && (
                  <button 
                    className="cancel-btn"
                    onClick={() => handleCancelOrder(order)}
                    style={{ marginLeft: '8px', padding: '8px 12px', border: '1px solid #ef4444', color: '#ef4444', background: 'white', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    Hủy đơn
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Modal */}
      {paymentOrder && paymentInfo && (
        <div className="order-modal-overlay" onClick={() => { setPaymentOrder(null); setPaymentInfo(null); }}>
          <div className="order-modal payment-modal" onClick={(e) => e.stopPropagation()}>
            <h2>💳 Thanh toán đơn hàng #{paymentOrder.orderCode}</h2>
            
            <div className="qr-section">
              <img src={paymentInfo.qrUrl} alt="QR Code" className="payment-qr" />
              <p>Quét mã QR bằng app ngân hàng</p>
            </div>

            <div className="bank-info">
              <div className="info-row">
                <span>Ngân hàng:</span>
                <span>{paymentInfo.bankName || "MB Bank"}</span>
              </div>
              <div className="info-row">
                <span>Số TK:</span>
                <span>{paymentInfo.accountNumber}</span>
                <button onClick={() => copyToClipboard(paymentInfo.accountNumber, 'acc')}>
                  {copied === 'acc' ? <FaCheck /> : <FaCopy />}
                </button>
              </div>
              <div className="info-row">
                <span>Chủ TK:</span>
                <span>{paymentInfo.accountName}</span>
              </div>
              <div className="info-row">
                <span>Số tiền:</span>
                <span className="amount">{formatPrice(paymentOrder.totalAmount)}</span>
                <button onClick={() => copyToClipboard(paymentOrder.totalAmount.toString(), 'amount')}>
                  {copied === 'amount' ? <FaCheck /> : <FaCopy />}
                </button>
              </div>
              <div className="info-row content-row">
                <span>Nội dung CK:</span>
                <span className="transfer-content">{paymentInfo.transferContent}</span>
                <button onClick={() => copyToClipboard(paymentInfo.transferContent, 'content')}>
                  {copied === 'content' ? <FaCheck /> : <FaCopy />}
                </button>
              </div>
            </div>

            <div className="payment-warning">
              ⚠️ Nhập chính xác nội dung chuyển khoản để đơn hàng được xác nhận tự động!
            </div>

            <div className="checking-status">
              {checking ? (
                <><FaSpinner className="spin" /> Đang kiểm tra thanh toán...</>
              ) : (
                "🔄 Tự động kiểm tra mỗi 5 giây"
              )}
            </div>

            <button className="close-modal-btn" onClick={() => { setPaymentOrder(null); setPaymentInfo(null); }}>
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="order-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Chi tiết đơn hàng #{selectedOrder.orderCode}</h2>
            
            <div className="modal-section">
              <h3>Trạng thái</h3>
              <div className="status-row">
                <span 
                  className="status-badge"
                  style={{ 
                    color: ORDER_STATUSES[selectedOrder.orderStatus]?.color,
                    background: ORDER_STATUSES[selectedOrder.orderStatus]?.bg
                  }}
                >
                  {ORDER_STATUSES[selectedOrder.orderStatus]?.label}
                </span>
                <span 
                  className="payment-badge"
                  style={{ color: PAYMENT_STATUSES[selectedOrder.paymentStatus]?.color }}
                >
                  {PAYMENT_STATUSES[selectedOrder.paymentStatus]?.label}
                </span>
              </div>
            </div>

            <div className="modal-section">
              <h3>Sản phẩm</h3>
              <div className="modal-items">
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} className="modal-item">
                    <span>{item.name} x{item.quantity}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="modal-item discount">
                  <span>Giảm giá:</span>
                  <span>-{formatPrice(selectedOrder.discountAmount)}</span>
                </div>
              )}
              <div className="modal-item total">
                <span>Tổng cộng:</span>
                <span>{formatPrice(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            <div className="modal-section">
              <h3>Địa chỉ giao hàng</h3>
              <p><strong>{selectedOrder.customerInfo?.fullName}</strong></p>
              <p>{selectedOrder.customerInfo?.phone}</p>
              <p>{selectedOrder.customerInfo?.address}</p>
            </div>

            <div className="modal-section">
              <h3>Thông tin thanh toán</h3>
              <p>Phương thức: {selectedOrder.paymentMethod?.toUpperCase()}</p>
              <p>Ngày đặt: {formatDate(selectedOrder.createdAt)}</p>
              {selectedOrder.paidAt && (
                <p>Thanh toán lúc: {formatDate(selectedOrder.paidAt)}</p>
              )}
            </div>

            {/* Nút thanh toán trong modal chi tiết */}
            {selectedOrder.orderStatus !== "cancelled" && selectedOrder.paymentStatus === "pending" && selectedOrder.paymentMethod !== "cod" && (
              <button 
                className="pay-now-btn modal-pay-btn" 
                onClick={() => { setSelectedOrder(null); handlePayNow(selectedOrder); }}
              >
                <FaCreditCard /> Thanh toán ngay
              </button>
            )}

            {/* Nút hủy trong modal */}
            {(selectedOrder.orderStatus === "pending" || selectedOrder.orderStatus === "confirmed") && (
              <button 
                className="cancel-btn-modal"
                onClick={() => handleCancelOrder(selectedOrder)}
                style={{ marginRight: '10px', padding: '8px 16px', border: '1px solid #ef4444', color: '#ef4444', background: 'white', borderRadius: '6px', cursor: 'pointer' }}
              >
                Hủy đơn hàng
              </button>
            )}

            <button className="close-modal-btn" onClick={() => setSelectedOrder(null)}>
              Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MyOrders;

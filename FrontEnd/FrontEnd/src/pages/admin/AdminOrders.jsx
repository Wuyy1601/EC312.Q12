import React, { useState, useEffect } from "react";
import { FaSearch, FaEye, FaTrash } from "react-icons/fa";
import "./AdminOrders.css";

const ORDER_STATUSES = [
  { value: "pending", label: "Chờ xử lý", color: "#f59e0b" },
  { value: "confirmed", label: "Đã xác nhận", color: "#3b82f6" },
  { value: "preparing", label: "Đang chuẩn bị", color: "#8b5cf6" },
  { value: "shipping", label: "Đang vận chuyển", color: "#06b6d4" },
  { value: "delivered", label: "Giao thành công", color: "#22c55e" },
  { value: "cancelled", label: "Đã hủy", color: "#ef4444" },
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("http://localhost:5001/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data.data || []);
    } catch (error) {
      console.error("Fetch orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderCode, newStatus) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`http://localhost:5001/api/admin/orders/${orderCode}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(orders.map((o) => (o.orderCode === orderCode ? data.data : o)));
      }
    } catch (error) {
      console.error("Update status error:", error);
    }
  };

  const handleDelete = async (orderCode) => {
    if (!window.confirm("Bạn có chắc muốn xóa đơn hàng này?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      await fetch(`http://localhost:5001/api/admin/orders/${orderCode}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(orders.filter((o) => o.orderCode !== orderCode));
    } catch (error) {
      console.error("Delete order error:", error);
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat("vi-VN").format(price) + "đ";
  const formatDate = (date) => new Date(date).toLocaleString("vi-VN");

  const filteredOrders = orders.filter(
    (o) =>
      o.orderCode?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerInfo?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="admin-loading">Đang tải...</div>;

  return (
    <div className="admin-orders">
      <h1>🛒 Quản lý đơn hàng</h1>

      <div className="toolbar">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Tìm mã đơn hoặc tên khách..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <table className="orders-table">
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Khách hàng</th>
            <th>User</th>
            <th>Tổng tiền</th>
            <th>Thanh toán</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order._id}>
              <td className="order-code">{order.orderCode}</td>
              <td>{order.customerInfo?.fullName || "N/A"}</td>
              <td className="user-id">{order.userId ? <span className="user-badge">#{order.userId.slice(-6)}</span> : <span className="guest-badge">Khách</span>}</td>
              <td className="price">{formatPrice(order.totalAmount)}</td>
              <td>
                <span className={`payment-badge ${order.paymentStatus}`}>
                  {order.paymentStatus === "paid" ? "Đã TT" : "Chưa TT"}
                </span>
              </td>
              <td>
                <select
                  value={order.orderStatus}
                  onChange={(e) => handleStatusChange(order.orderCode, e.target.value)}
                  className={`status-select ${order.orderStatus}`}
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </td>
              <td>{formatDate(order.createdAt)}</td>
              <td className="actions">
                <button className="view-btn" onClick={() => setSelectedOrder(order)}>
                  <FaEye />
                </button>
                <button className="delete-btn" onClick={() => handleDelete(order.orderCode)}>
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal order-detail" onClick={(e) => e.stopPropagation()}>
            <h2>Chi tiết đơn hàng #{selectedOrder.orderCode}</h2>

            <div className="detail-section">
              <h3>Thông tin khách hàng</h3>
              <p><strong>Tên:</strong> {selectedOrder.customerInfo?.fullName}</p>
              <p><strong>Email:</strong> {selectedOrder.customerInfo?.email}</p>
              <p><strong>SĐT:</strong> {selectedOrder.customerInfo?.phone}</p>
              <p><strong>Địa chỉ:</strong> {selectedOrder.customerInfo?.address}</p>
            </div>

            <div className="detail-section">
              <h3>Sản phẩm</h3>
              <ul>
                {selectedOrder.items?.map((item, i) => (
                  <li key={i}>
                    {item.name || item.productId} x{item.quantity} - {formatPrice(item.price * item.quantity)}
                  </li>
                ))}
              </ul>
            </div>

            <div className="detail-section">
              <p><strong>Tổng tiền:</strong> {formatPrice(selectedOrder.totalAmount)}</p>
              <p><strong>Thanh toán:</strong> {selectedOrder.paymentMethod}</p>
              <p><strong>Trạng thái:</strong> {ORDER_STATUSES.find(s => s.value === selectedOrder.orderStatus)?.label}</p>
            </div>

            {/* Show Cancellation Reason if Cancelled */}
            {selectedOrder.orderStatus === "cancelled" && selectedOrder.note && (
              <div className="detail-section" style={{ 
                background: '#fee2e2', 
                borderRadius: '8px', 
                padding: '1rem',
                border: '1px solid #fecaca'
              }}>
                <h3 style={{ color: '#dc2626', margin: '0 0 0.5rem 0' }}>🚫 Lý do hủy đơn</h3>
                <p style={{ color: '#7f1d1d', margin: 0 }}>
                  {selectedOrder.note.includes('[Khách hủy:') 
                    ? selectedOrder.note.match(/\[Khách hủy:\s*([^\]]*)\]/)?.[1] || 'Không có lý do'
                    : selectedOrder.note
                  }
                </p>
              </div>
            )}

            <button className="close-btn" onClick={() => setSelectedOrder(null)}>
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;

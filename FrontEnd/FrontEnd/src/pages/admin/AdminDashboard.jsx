import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch users
      const usersRes = await fetch("http://localhost:5001/api/auth/users", { headers });
      const usersData = await usersRes.json();

      // Fetch products
      const productsRes = await fetch("http://localhost:5001/api/products");
      const productsData = await productsRes.json();

      // Fetch orders
      const ordersRes = await fetch("http://localhost:5001/api/orders/all", { headers });
      const ordersData = await ordersRes.json();

      const orders = ordersData.data || [];
      const revenue = orders.reduce((sum, o) => o.paymentStatus === "paid" ? sum + o.totalAmount : sum, 0);

      setStats({
        users: usersData.count || 0,
        products: productsData.data?.length || 0,
        orders: ordersData.count || 0,
        revenue,
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error("Fetch stats error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat("vi-VN").format(price) + "đ";

  if (loading) {
    return <div className="admin-loading">Đang tải...</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>📊 Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card users">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{stats.users}</h3>
            <p>Người dùng</p>
          </div>
        </div>

        <div className="stat-card products">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>{stats.products}</h3>
            <p>Sản phẩm</p>
          </div>
        </div>

        <div className="stat-card orders">
          <div className="stat-icon">🛒</div>
          <div className="stat-info">
            <h3>{stats.orders}</h3>
            <p>Đơn hàng</p>
          </div>
        </div>

        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>{formatPrice(stats.revenue)}</h3>
            <p>Doanh thu</p>
          </div>
        </div>
      </div>

      <div className="recent-orders">
        <h2>📋 Đơn hàng gần đây</h2>
        <table>
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order._id}>
                <td>{order.orderCode}</td>
                <td>{order.customerInfo?.fullName || "N/A"}</td>
                <td>{formatPrice(order.totalAmount)}</td>
                <td>
                  <span className={`status-badge ${order.orderStatus}`}>
                    {order.orderStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;

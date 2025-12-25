import React, { useState, useEffect } from "react";
import { FaArrowUp, FaArrowDown, FaShoppingCart, FaBox, FaUsers, FaMoneyBillWave, FaStar, FaFolder, FaClock, FaTruck, FaCheckCircle, FaTimesCircle, FaSync } from "react-icons/fa";
import "./AdminDashboard.css";

const API_URL = "http://localhost:5001";

const ORDER_STATUS_MAP = {
  pending: { label: "Chờ xử lý", color: "#f59e0b", icon: FaClock },
  confirmed: { label: "Đã xác nhận", color: "#3b82f6", icon: FaCheckCircle },
  preparing: { label: "Đang chuẩn bị", color: "#8b5cf6", icon: FaBox },
  shipping: { label: "Đang giao", color: "#06b6d4", icon: FaTruck },
  delivered: { label: "Giao thành công", color: "#22c55e", icon: FaCheckCircle },
  cancelled: { label: "Đã hủy", color: "#ef4444", icon: FaTimesCircle },
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    categories: 0,
    reviews: 0,
    revenue: 0,
    paidOrders: 0,
  });
  const [orderStats, setOrderStats] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch dashboard stats
      const dashboardRes = await fetch(`${API_URL}/api/admin/dashboard`, { headers });
      const dashboardData = await dashboardRes.json();

      // Fetch orders for more details
      const ordersRes = await fetch(`${API_URL}/api/admin/orders`, { headers });
      const ordersData = await ordersRes.json();

      // Fetch products for top products
      const productsRes = await fetch(`${API_URL}/api/admin/products`, { headers });
      const productsData = await productsRes.json();

      const orders = ordersData.data || [];
      const products = productsData.data || [];

      // Calculate order status distribution
      const statusDistribution = orders.reduce((acc, order) => {
        acc[order.orderStatus] = (acc[order.orderStatus] || 0) + 1;
        return acc;
      }, {});

      // Calculate top products (most ordered)
      const productOrders = {};
      orders.forEach(order => {
        order.items?.forEach(item => {
          const productId = item.productId;
          if (productId) {
            productOrders[productId] = productOrders[productId] || { 
              name: item.name, 
              image: item.image,
              count: 0, 
              revenue: 0 
            };
            productOrders[productId].count += item.quantity;
            productOrders[productId].revenue += item.price * item.quantity;
          }
        });
      });
      const sortedProducts = Object.entries(productOrders)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate today's stats
      const today = new Date().toDateString();
      const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
      const todayRevenue = todayOrders
        .filter(o => o.paymentStatus === "paid")
        .reduce((sum, o) => sum + o.totalAmount, 0);

      setStats({
        users: dashboardData.data?.counts?.users || 0,
        products: dashboardData.data?.counts?.products || 0,
        orders: dashboardData.data?.counts?.orders || 0,
        categories: dashboardData.data?.counts?.categories || 0,
        reviews: dashboardData.data?.counts?.reviews || 0,
        revenue: dashboardData.data?.revenue?.totalRevenue || 0,
        paidOrders: dashboardData.data?.revenue?.totalOrders || 0,
        todayOrders: todayOrders.length,
        todayRevenue,
      });

      setOrderStats(Object.entries(statusDistribution).map(([status, count]) => ({
        status,
        count,
        ...ORDER_STATUS_MAP[status]
      })));

      setRecentOrders(orders.slice(0, 8));
      setTopProducts(sortedProducts);

    } catch (error) {
      console.error("Fetch stats error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat("vi-VN").format(price) + "đ";
  const formatDate = (date) => new Date(date).toLocaleString("vi-VN", { 
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" 
  });

  if (loading) {
    return <div className="admin-loading"><FaSync className="spin" /> Đang tải...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>📊 Dashboard</h1>
        <button className="refresh-btn" onClick={fetchAllData}>
          <FaSync /> Làm mới
        </button>
      </div>

      {/* Main Stats */}
      <div className="stats-grid">
        <div className="stat-card users">
          <div className="stat-icon"><FaUsers /></div>
          <div className="stat-info">
            <h3>{stats.users}</h3>
            <p>Người dùng</p>
          </div>
        </div>

        <div className="stat-card products">
          <div className="stat-icon"><FaBox /></div>
          <div className="stat-info">
            <h3>{stats.products}</h3>
            <p>Sản phẩm</p>
          </div>
        </div>

        <div className="stat-card orders">
          <div className="stat-icon"><FaShoppingCart /></div>
          <div className="stat-info">
            <h3>{stats.orders}</h3>
            <p>Đơn hàng</p>
          </div>
        </div>

        <div className="stat-card revenue">
          <div className="stat-icon"><FaMoneyBillWave /></div>
          <div className="stat-info">
            <h3>{formatPrice(stats.revenue)}</h3>
            <p>Doanh thu ({stats.paidOrders} đơn)</p>
          </div>
        </div>

        <div className="stat-card categories">
          <div className="stat-icon"><FaFolder /></div>
          <div className="stat-info">
            <h3>{stats.categories}</h3>
            <p>Danh mục</p>
          </div>
        </div>

        <div className="stat-card reviews">
          <div className="stat-icon"><FaStar /></div>
          <div className="stat-info">
            <h3>{stats.reviews}</h3>
            <p>Đánh giá</p>
          </div>
        </div>
      </div>

      {/* Today Stats */}
      <div className="today-stats">
        <div className="today-card">
          <div className="today-icon orders"><FaShoppingCart /></div>
          <div className="today-info">
            <span className="today-value">{stats.todayOrders || 0}</span>
            <span className="today-label">Đơn hàng hôm nay</span>
          </div>
        </div>
        <div className="today-card">
          <div className="today-icon revenue"><FaMoneyBillWave /></div>
          <div className="today-info">
            <span className="today-value">{formatPrice(stats.todayRevenue || 0)}</span>
            <span className="today-label">Doanh thu hôm nay</span>
          </div>
        </div>
      </div>

      {/* Order Status Distribution */}
      <div className="dashboard-row">
        <div className="order-status-section">
          <h2>📈 Phân bố trạng thái đơn hàng</h2>
          <div className="status-cards">
            {orderStats.map((stat) => {
              const IconComponent = stat.icon || FaClock;
              return (
                <div 
                  key={stat.status} 
                  className="status-card"
                  style={{ borderLeftColor: stat.color }}
                >
                  <div className="status-icon" style={{ background: stat.color }}>
                    <IconComponent />
                  </div>
                  <div className="status-info">
                    <span className="status-count">{stat.count}</span>
                    <span className="status-label">{stat.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="top-products-section">
          <h2>🏆 Sản phẩm bán chạy</h2>
          {topProducts.length > 0 ? (
            <div className="top-products-list">
              {topProducts.map((product, index) => (
                <div key={product.id} className="top-product-item">
                  <span className="rank">#{index + 1}</span>
                  {product.image && (
                    <img src={`${API_URL}${product.image}`} alt="" className="product-thumb" />
                  )}
                  <div className="product-details">
                    <span className="product-name">{product.name}</span>
                    <span className="product-stats">
                      {product.count} đã bán • {formatPrice(product.revenue)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">Chưa có dữ liệu</p>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="recent-orders">
        <h2>📋 Đơn hàng gần đây</h2>
        <table>
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Sản phẩm</th>
              <th>Tổng tiền</th>
              <th>Thanh toán</th>
              <th>Trạng thái</th>
              <th>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order._id}>
                <td className="order-code">{order.orderCode}</td>
                <td>{order.customerInfo?.fullName || "N/A"}</td>
                <td className="items-count">{order.items?.length || 0} sản phẩm</td>
                <td className="price">{formatPrice(order.totalAmount)}</td>
                <td>
                  <span className={`payment-badge ${order.paymentStatus}`}>
                    {order.paymentStatus === "paid" ? "✓ Đã TT" : "⏳ Chờ"}
                  </span>
                </td>
                <td>
                  <span 
                    className="status-badge" 
                    style={{ 
                      background: ORDER_STATUS_MAP[order.orderStatus]?.color + "20",
                      color: ORDER_STATUS_MAP[order.orderStatus]?.color 
                    }}
                  >
                    {ORDER_STATUS_MAP[order.orderStatus]?.label || order.orderStatus}
                  </span>
                </td>
                <td className="date">{formatDate(order.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;

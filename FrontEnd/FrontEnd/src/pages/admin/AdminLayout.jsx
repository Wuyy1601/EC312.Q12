import React, { useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import "./AdminLayout.css";

const AdminLayout = () => {
  const navigate = useNavigate();
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const adminToken = localStorage.getItem("adminToken");

  // Check if admin is logged in - use useEffect to avoid calling navigate during render
  useEffect(() => {
    if (!adminToken) {
      navigate("/admin/login");
    }
  }, [adminToken, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  // Don't render if not logged in
  if (!adminToken) {
    return null;
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>🎁 Giftnity</h2>
          <p>Admin Panel</p>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <i className="fa-solid fa-home"></i> Dashboard
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <i className="fa-solid fa-users"></i> Người dùng
          </NavLink>
          <NavLink to="/admin/products" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <i className="fa-solid fa-box"></i> Sản phẩm
          </NavLink>
          <NavLink to="/admin/categories" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <i className="fa-solid fa-folder"></i> Danh mục
          </NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <i className="fa-solid fa-cart-shopping"></i> Đơn hàng
          </NavLink>
          <NavLink to="/admin/reviews" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <i className="fa-solid fa-star"></i> Đánh giá
          </NavLink>
          <NavLink to="/admin/card-templates" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <i className="fa-solid fa-id-card"></i> 🀴 Template Thiệp
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-info">
            <span>👤 {adminUser.username || "Admin"}</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <i className="fa-solid fa-right-from-bracket"></i> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

import React, { useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { FaHome, FaUsers, FaShoppingCart, FaBox, FaSignOutAlt, FaImages, FaIdCard } from "react-icons/fa";
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
            <FaHome /> Dashboard
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <FaUsers /> Người dùng
          </NavLink>
          <NavLink to="/admin/products" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <FaBox /> Sản phẩm
          </NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <FaShoppingCart /> Đơn hàng
          </NavLink>
          <NavLink to="/admin/card-templates" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <FaIdCard /> 🎴 Template Thiệp
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-info">
            <span>👤 {adminUser.username || "Admin"}</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <FaSignOutAlt /> Đăng xuất
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

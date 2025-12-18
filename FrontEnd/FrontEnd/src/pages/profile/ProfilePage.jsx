import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { FaBell, FaUser, FaLock, FaMapMarkerAlt, FaTrash, FaCog, FaShoppingBag, FaCamera } from 'react-icons/fa';
import './ProfilePage.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

// Random avatar
const getRandomAvatar = (userId) => {
  const avatarId = userId ? (userId.charCodeAt(0) % 70) + 1 : Math.floor(Math.random() * 70) + 1;
  return `https://i.pravatar.cc/200?img=${avatarId}`;
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(userData));
    setLoading(false);
  }, [navigate]);

  const menuItems = [
    { path: '/profile', label: 'Hồ sơ', icon: <FaUser /> },
    { path: '/profile/password', label: 'Đổi mật khẩu', icon: <FaLock /> },
    { path: '/profile/address', label: 'Địa chỉ', icon: <FaMapMarkerAlt /> },
    { path: '/profile/delete', label: 'Xóa tài khoản', icon: <FaTrash /> },
    { path: '/profile/notifications', label: 'Cài đặt thông báo', icon: <FaCog /> },
  ];

  if (loading) {
    return <div className="profile-loading">Đang tải...</div>;
  }

  return (
    <div className="profile-container">
      {/* Sidebar */}
      <aside className="profile-sidebar">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            <img src={user?.avatar || getRandomAvatar(user?.id)} alt="Avatar" />
          </div>
          <h3 className="sidebar-username">{user?.username || 'Người dùng'}</h3>
          <Link to="/profile" className="sidebar-edit">✏️ Sửa hồ sơ</Link>
        </div>

        <nav className="sidebar-menu">
          <div className="menu-group">
            <Link to="/notifications" className="menu-item">
              <FaBell /> Thông báo
            </Link>
          </div>

          <div className="menu-group">
            <div className="menu-title">Tài khoản của tôi</div>
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.icon} {item.label}
              </Link>
            ))}
          </div>

          <div className="menu-group">
            <Link to="/profile/orders" className={`menu-item ${location.pathname === '/profile/orders' ? 'active' : ''}`}>
              <FaShoppingBag /> Đơn hàng của tôi
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="profile-main">
        <Outlet context={{ user, setUser }} />
      </main>
    </div>
  );
};

export default ProfilePage;

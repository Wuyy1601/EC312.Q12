import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaShoppingCart, FaSignOutAlt, FaUser, FaBox } from "react-icons/fa";
import logo from "../assets/logo/logo.png";
import { useCart } from "../context/CartContext";
import "./Header.css";

// Random avatar nếu user không có
const getRandomAvatar = (userId) => {
  const avatarId = userId ? (userId.charCodeAt(0) % 70) + 1 : Math.floor(Math.random() * 70) + 1;
  return `https://i.pravatar.cc/100?img=${avatarId}`;
};

const Header = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Check login status
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      if (token && userData) {
        setIsLoggedIn(true);
        setUser(JSON.parse(userData));
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    };
    
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    setShowDropdown(false);
    navigate("/");
  };

  // Cart count
  // Cart count
  const { cartCount } = useCart();

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="logo">
          <img src={logo} alt="Giftnity" className="logo-img" />
        </Link>

        {/* Navigation Menu */}
        <nav className="nav-menu">
          <Link to="/" className="nav-link">Trang chủ</Link>
          <Link to="/products" className="nav-link">Sản phẩm</Link>
          <Link to="/contact" className="nav-link">Liên hệ</Link>
        </nav>

        {/* Right Side */}
        <div className="header-right">
          {/* Search Bar */}
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          </form>

          {/* Cart */}
          <Link to="/cart" className="cart-link">
            <FaShoppingCart className="cart-icon" size={24} color="#333" />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {/* User Area */}
          {isLoggedIn ? (
            <div className="user-menu">
              <img 
                src={user?.avatar || getRandomAvatar(user?.id || user?.username)} 
                alt={user?.username || "User"} 
                className="avatar-img clickable" 
                onClick={() => setShowDropdown(!showDropdown)}
              />
              {showDropdown && (
                <>
                  <div className="dropdown-backdrop" onClick={() => setShowDropdown(false)}></div>
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      Xin chào, <strong>{user?.username || 'User'}</strong>
                    </div>
                    <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      <FaUser /> Tài khoản của tôi
                    </Link>
                    <Link to="/profile/orders" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      <FaBox /> Đơn hàng
                    </Link>
                    <button className="dropdown-item logout-btn" onClick={handleLogout}>
                      <FaSignOutAlt /> Đăng xuất
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link to="/login" className="login-btn">
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

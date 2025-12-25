import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo/logo.png";
import { useCart } from "../context/CartContext";
import "./Header.css";

const API_URL = "http://localhost:5001";

// Random avatar nếu user không có
const getRandomAvatar = (userId) => {
  const avatarId = userId ? (userId.charCodeAt(0) % 70) + 1 : Math.floor(Math.random() * 70) + 1;
  return `https://i.pravatar.cc/100?img=${avatarId}`;
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Visual Search states
  const [showVisualSearch, setShowVisualSearch] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const fileInputRef = useRef(null);

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

  // Visual Search handlers
  const handleCameraClick = () => {
    setShowVisualSearch(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!previewImage) return;
    
    setAnalyzing(true);
    try {
      const res = await fetch(`${API_URL}/api/gemini/visual-search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: previewImage }),
      });
      const data = await res.json();
      
      if (data.success) {
        setAnalysisResult(data.data);
      } else {
        alert("Không thể phân tích hình ảnh. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Visual search error:", error);
      alert("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSearchFromAnalysis = (query) => {
    setShowVisualSearch(false);
    setPreviewImage(null);
    setAnalysisResult(null);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const closeVisualSearch = () => {
    setShowVisualSearch(false);
    setPreviewImage(null);
    setAnalysisResult(null);
  };

  // Cart count
  const { cartCount } = useCart();

  return (
    <>
      <header className="header">
        <div className="header-container">
          {/* Logo */}
          <Link to="/" className="logo">
            <img src={logo} alt="Giftnity" className="logo-img" />
          </Link>

          {/* Navigation Menu */}
          <nav className="nav-menu">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Trang chủ</Link>
            <Link to="/products" className={`nav-link ${location.pathname === '/products' || location.pathname.startsWith('/product/') ? 'active' : ''}`}>Sản phẩm</Link>
            <Link to="/calendar" className={`nav-link ${location.pathname === '/calendar' ? 'active' : ''}`}>Lịch</Link>
            <Link to="/spirit-consultant" className={`nav-link ${location.pathname === '/spirit-consultant' ? 'active' : ''}`}>Tư Vấn Quà</Link>
            <Link to="/contact" className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}>Liên hệ</Link>
          </nav>

          {/* Right Side */}
          <div className="header-right">
            {/* Search Bar with Camera */}
            <form className="search-form" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button 
                type="button" 
                className="camera-btn"
                onClick={handleCameraClick}
                title="Tìm kiếm bằng hình ảnh"
              >
                <i className="fa-solid fa-camera"></i>
              </button>
              <button type="submit" className="search-btn">
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
            </form>

            {/* Cart */}
            <Link to="/cart" className="cart-link">
              <i className="fa-solid fa-cart-shopping" style={{ fontSize: "24px", color: "#333" }}></i>
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
                        <i className="fa-solid fa-user"></i> Tài khoản của tôi
                      </Link>
                      <Link to="/profile/orders" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                        <i className="fa-solid fa-box"></i> Đơn hàng
                      </Link>
                      <Link to="/calendar" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                        <i className="fa-solid fa-calendar-alt"></i> Lịch sự kiện
                      </Link>
                      <button className="dropdown-item logout-btn" onClick={handleLogout}>
                        <i className="fa-solid fa-right-from-bracket"></i> Đăng xuất
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

      {/* Visual Search Modal */}
      {showVisualSearch && (
        <div className="visual-search-overlay" onClick={closeVisualSearch}>
          <div className="visual-search-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={closeVisualSearch}>
              <i className="fa-solid fa-times"></i>
            </button>
            
            <h2>📷 Tìm kiếm bằng hình ảnh</h2>
            <p className="modal-subtitle">
              Tải ảnh sản phẩm bạn muốn tìm, AI sẽ phân tích và tìm sản phẩm tương tự
            </p>

            {!previewImage ? (
              <div 
                className="upload-zone"
                onClick={() => fileInputRef.current?.click()}
              >
                <i className="fa-solid fa-camera upload-icon"></i>
                <span>Click để chọn ảnh hoặc kéo thả vào đây</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  hidden
                />
              </div>
            ) : (
              <div className="preview-section">
                <div className="image-preview">
                  <img src={previewImage} alt="Preview" />
                  <button 
                    className="remove-image-btn" 
                    onClick={() => { setPreviewImage(null); setAnalysisResult(null); }}
                  >
                    <i className="fa-solid fa-times"></i>
                  </button>
                </div>

                {!analysisResult && (
                  <button 
                    className="analyze-button"
                    onClick={handleAnalyzeImage}
                    disabled={analyzing}
                  >
                    {analyzing ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i> Đang phân tích...
                      </>
                    ) : (
                      <>🔍 Phân tích hình ảnh</>
                    )}
                  </button>
                )}

                {analysisResult && (
                  <div className="analysis-result">
                    <h3>🎯 Kết quả phân tích</h3>
                    
                    <div className="result-item">
                      <span className="label">Loại sản phẩm:</span>
                      <span className="value">{analysisResult.productType}</span>
                    </div>
                    
                    <div className="result-item">
                      <span className="label">Mô tả:</span>
                      <span className="value">{analysisResult.description}</span>
                    </div>
                    
                    <div className="result-item">
                      <span className="label">Phong cách:</span>
                      <span className="value">{analysisResult.style}</span>
                    </div>
                    
                    <div className="result-item">
                      <span className="label">Dịp phù hợp:</span>
                      <span className="value">{analysisResult.occasion}</span>
                    </div>

                    <div className="keywords-section">
                      <span className="label">Từ khóa:</span>
                      <div className="keyword-tags">
                        {analysisResult.keywords?.map((kw, i) => (
                          <span 
                            key={i} 
                            className="keyword-tag"
                            onClick={() => handleSearchFromAnalysis(kw)}
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button 
                      className="search-similar-btn"
                      onClick={() => handleSearchFromAnalysis(analysisResult.searchQuery)}
                    >
                      🔍 Tìm sản phẩm tương tự
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;


import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "../../firebase.config";
import logo from '../../assets/logo/logo.png';
import '../../styles/Auth.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Lưu token và user vào localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.data));
        
        // Chuyển về trang chủ
        navigate('/');
        // Force reload để Header cập nhật
        window.location.reload();
      } else {
        setError(data.message || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setError('Không thể kết nối đến server');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const res = await fetch(`${API_URL}/api/auth/social-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          username: user.displayName,
          avatar: user.photoURL,
          uid: user.uid
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.data));
        navigate('/');
        window.location.reload();
      } else {
        setError(data.message || "Đăng nhập Google thất bại");
      }
    } catch (error) {
      console.error("Google login error:", error);
      setError("Đăng nhập Google thất bại: " + error.message);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;

      const res = await fetch(`${API_URL}/api/auth/social-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          username: user.displayName,
          avatar: user.photoURL,
          uid: user.uid
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.data));
        navigate('/');
        window.location.reload();
      } else {
        setError(data.message || "Đăng nhập Facebook thất bại");
      }
    } catch (error) {
      console.error("Facebook login error:", error);
      setError("Đăng nhập Facebook thất bại: " + error.message);
    }
  };

  return (
    <div className="auth-container">
      {/* Logo góc trái */}
      <div className="auth-logo">
        <Link to="/"><img src={logo} alt="Logo" /></Link>
      </div>

      {/* Decorative stars */}
      <div className="star">✦</div>
      <div className="star">✦</div>
      <div className="star">✦</div>
      <div className="star">✦</div>

      <div className="auth-box">
        {/* Ribbon decoration */}
        <div className="auth-ribbon">🎀</div>
        
        <h2 className="auth-title">Đăng nhập</h2>

        {error && <div style={{ color: '#d32f2f', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="email"
              placeholder="Email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#880e4f' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <input type="checkbox" style={{ accentColor: '#ec407a' }} /> Ghi nhớ đăng nhập
            </label>
            <a href="#" style={{ color: '#ec407a', textDecoration: 'none' }}>Quên mật khẩu?</a>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'ĐĂNG NHẬP'}
          </button>
        </form>

          <div className="social-icons">
            <button type="button" className="social-btn google" onClick={handleGoogleLogin}>
              <i className="fa-brands fa-google"></i>
            </button>
            <button type="button" className="social-btn facebook" onClick={handleFacebookLogin}>
              <i className="fa-brands fa-facebook-f"></i>
            </button>
          </div>

        <div className="auth-footer">
          Chưa có tài khoản? 
          <Link to="/register" className="auth-link">Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

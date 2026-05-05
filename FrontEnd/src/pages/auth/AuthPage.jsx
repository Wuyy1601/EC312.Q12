import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "../../firebase.config";
import logo from '../../assets/logo/logo.png';
import '../../styles/Auth.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRegister, setIsRegister] = useState(location.pathname === '/register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    username: '', email: '', phone: '', password: '', confirmPassword: '',
  });

  // ── Login ──────────────────────────────────
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.data));
        navigate('/');
        window.location.reload();
      } else {
        setError(data.message || 'Đăng nhập thất bại');
      }
    } catch {
      setError('Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  // ── Register ───────────────────────────────
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      setError("Mật khẩu không khớp!");
      return;
    }
    if (registerData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: registerData.username,
          email: registerData.email,
          password: registerData.password,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setIsRegister(false);
        setLoginData({ email: registerData.email, password: '' });
        setError('');
        alert('🎉 Đăng ký thành công! Mời bạn đăng nhập.');
      } else {
        setError(data.message || 'Đăng ký thất bại');
      }
    } catch {
      setError('Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  // ── Social Login ───────────────────────────
  const handleSocialLogin = async (provider) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const res = await fetch(`${API_URL}/api/auth/social-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email, username: user.displayName,
          avatar: user.photoURL, uid: user.uid,
        }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.data));
        navigate('/');
        window.location.reload();
      } else {
        setError(data.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      setError("Đăng nhập thất bại: " + err.message);
    }
  };

  const switchTab = (toRegister) => {
    setIsRegister(toRegister);
    setError('');
    navigate(toRegister ? '/register' : '/login', { replace: true });
  };

  return (
    <div className="auth-page">
      {/* Background blobs */}
      <div className="auth-bg-decor">
        <div className="auth-blob" />
        <div className="auth-blob" />
        <div className="auth-blob" />
      </div>



      <div className="auth-card">
        {/* Tab Switcher */}
        <div className={`auth-tabs ${isRegister ? 'register-active' : ''}`}>
          <div className="tab-indicator" />
          <button
            type="button"
            className={`auth-tab ${!isRegister ? 'active' : ''}`}
            onClick={() => switchTab(false)}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            className={`auth-tab ${isRegister ? 'active' : ''}`}
            onClick={() => switchTab(true)}
          >
            Đăng ký
          </button>
        </div>

        <div className="auth-body">
          {/* Logo + Title */}
          <div className="auth-greeting">
            <Link to="/" className="auth-card-logo">
              <img src={logo} alt="Giftnity" />
            </Link>
            <h2>{isRegister ? 'Tạo tài khoản mới' : 'Chào mừng trở lại!'}</h2>
            <p>{isRegister ? 'Đăng ký để nhận ưu đãi độc quyền' : 'Đăng nhập để tiếp tục mua sắm'}</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          {/* ── Login Form ──────────────── */}
          {!isRegister && (
            <form className="auth-form" onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <div className="input-wrapper">
                  <input
                    type="text" name="email" className="form-input"
                    placeholder="you@example.com"
                    value={loginData.email}
                    onChange={(e) => { setLoginData({...loginData, email: e.target.value}); setError(''); }}
                    required
                  />
                  <span className="input-icon">
                    <i className="fa-regular fa-envelope"></i>
                  </span>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Mật khẩu</label>
                <div className="input-wrapper">
                  <input
                    type="password" name="password" className="form-input"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => { setLoginData({...loginData, password: e.target.value}); setError(''); }}
                    required
                  />
                  <span className="input-icon">
                    <i className="fa-solid fa-lock"></i>
                  </span>
                </div>
              </div>

              <div className="auth-extras">
                <label className="remember-label">
                  <input type="checkbox" /> Ghi nhớ
                </label>
                <a href="#" className="forgot-link">Quên mật khẩu?</a>
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'ĐĂNG NHẬP'}
              </button>

              <div className="auth-divider"><span>hoặc</span></div>

              <div className="social-row">
                <button type="button" className="social-btn google" onClick={() => handleSocialLogin(googleProvider)}>
                  <i className="fa-brands fa-google"></i>
                </button>
                <button type="button" className="social-btn facebook" onClick={() => handleSocialLogin(facebookProvider)}>
                  <i className="fa-brands fa-facebook-f"></i>
                </button>
              </div>
            </form>
          )}

          {/* ── Register Form ──────────── */}
          {isRegister && (
            <form className="auth-form" onSubmit={handleRegisterSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Tên hiển thị</label>
                  <div className="input-wrapper">
                    <input
                      type="text" name="username" className="form-input"
                      placeholder="Nguyễn Văn A"
                      value={registerData.username}
                      onChange={(e) => { setRegisterData({...registerData, username: e.target.value}); setError(''); }}
                      required
                    />
                    <span className="input-icon">
                      <i className="fa-regular fa-user"></i>
                    </span>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <div className="input-wrapper">
                    <input
                      type="email" name="email" className="form-input"
                      placeholder="you@example.com"
                      value={registerData.email}
                      onChange={(e) => { setRegisterData({...registerData, email: e.target.value}); setError(''); }}
                      required
                    />
                    <span className="input-icon">
                      <i className="fa-regular fa-envelope"></i>
                    </span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Số điện thoại</label>
                <div className="input-wrapper">
                  <input
                    type="tel" name="phone" className="form-input"
                    placeholder="0901 234 567"
                    value={registerData.phone}
                    onChange={(e) => { setRegisterData({...registerData, phone: e.target.value}); setError(''); }}
                  />
                  <span className="input-icon">
                    <i className="fa-solid fa-phone"></i>
                  </span>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Mật khẩu</label>
                  <div className="input-wrapper">
                    <input
                      type="password" name="password" className="form-input"
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={(e) => { setRegisterData({...registerData, password: e.target.value}); setError(''); }}
                      required
                    />
                    <span className="input-icon">
                      <i className="fa-solid fa-lock"></i>
                    </span>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Nhập lại</label>
                  <div className="input-wrapper">
                    <input
                      type="password" name="confirmPassword" className="form-input"
                      placeholder="••••••••"
                      value={registerData.confirmPassword}
                      onChange={(e) => { setRegisterData({...registerData, confirmPassword: e.target.value}); setError(''); }}
                      required
                    />
                    <span className="input-icon">
                      <i className="fa-solid fa-shield-halved"></i>
                    </span>
                  </div>
                </div>
              </div>

              <label className="terms-label">
                <input type="checkbox" required />
                Tôi đồng ý với <a href="#">điều khoản dịch vụ</a> và <a href="#">chính sách bảo mật</a>
              </label>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'ĐĂNG KÝ'}
              </button>

              <div className="auth-divider"><span>hoặc</span></div>

              <div className="social-row">
                <button type="button" className="social-btn google" onClick={() => handleSocialLogin(googleProvider)}>
                  <i className="fa-brands fa-google"></i>
                </button>
                <button type="button" className="social-btn facebook" onClick={() => handleSocialLogin(facebookProvider)}>
                  <i className="fa-brands fa-facebook-f"></i>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

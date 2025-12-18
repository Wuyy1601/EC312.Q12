import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle, FaFacebookF } from 'react-icons/fa';
import logo from '../../assets/logo/logo.png';
import '../../styles/Auth.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu không khớp!");
      return;
    }

    if (formData.password.length < 6) {
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
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        navigate('/login');
      } else {
        setError(data.message || 'Đăng ký thất bại');
      }
    } catch (err) {
      setError('Không thể kết nối đến server');
      console.error('Register error:', err);
    } finally {
      setLoading(false);
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

      <div className="auth-box" style={{ maxWidth: '600px' }}>
        {/* Ribbon decoration */}
        <div className="auth-ribbon">🎀</div>
        
        <h2 className="auth-title">Đăng ký</h2>

        {error && <div style={{ color: '#d32f2f', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.9rem', marginBottom: '5px', display: 'block', color: '#880e4f' }}>Tên hiển thị</label>
              <input
                type="text"
                name="username"
                className="form-control"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.9rem', marginBottom: '5px', display: 'block', color: '#880e4f' }}>Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.9rem', marginBottom: '5px', display: 'block', color: '#880e4f' }}>Số điện thoại</label>
              <input
                type="tel"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.9rem', marginBottom: '5px', display: 'block', color: '#880e4f' }}>&nbsp;</label>
              <div></div>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.9rem', marginBottom: '5px', display: 'block', color: '#880e4f' }}>Mật khẩu</label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.9rem', marginBottom: '5px', display: 'block', color: '#880e4f' }}>Nhập lại mật khẩu</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="social-login">
            <div className="social-icons">
              <button type="button" className="social-btn google">
                <FaGoogle />
              </button>
              <button type="button" className="social-btn facebook">
                <FaFacebookF />
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#880e4f' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', cursor: 'pointer' }}>
              <input type="checkbox" style={{ accentColor: '#ec407a' }} required /> 
              Tôi đồng ý với điều khoản dịch vụ và chính sách bảo mật
            </label>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'ĐĂNG KÝ'}
          </button>
        </form>

        <div className="auth-footer">
          Đã có tài khoản? 
          <Link to="/login" className="auth-link">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

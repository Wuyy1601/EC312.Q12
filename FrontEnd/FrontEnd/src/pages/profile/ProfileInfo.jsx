import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

// Random avatar
const getRandomAvatar = (userId) => {
  const avatarId = userId ? (userId.charCodeAt(0) % 70) + 1 : Math.floor(Math.random() * 70) + 1;
  return `https://i.pravatar.cc/200?img=${avatarId}`;
};

const ProfileInfo = () => {
  const { user, setUser } = useOutletContext();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    gender: '',
    birthday: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || '',
        birthday: user.birthday || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const updatedUser = { ...user, ...data.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Cập nhật thất bại' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Không thể kết nối đến server' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="profile-header">
        <h2>Hồ sơ của tôi</h2>
        <p>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
      </div>

      {message.text && (
        <div className={`profile-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="profile-content">
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên đăng nhập</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Số điện thoại</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Giới tính</label>
            <div className="gender-options">
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={handleChange}
                /> Nam
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={handleChange}
                /> Nữ
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="other"
                  checked={formData.gender === 'other'}
                  onChange={handleChange}
                /> Không muốn tiết lộ
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Ngày sinh</label>
            <input
              type="date"
              name="birthday"
              value={formData.birthday}
              onChange={handleChange}
            />
          </div>

          <div className="profile-submit">
            <button type="submit" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>

        <div className="profile-avatar-section">
          <div className="avatar-preview">
            <img src={user?.avatar || getRandomAvatar(user?.id)} alt="Avatar" />
          </div>
          <button className="avatar-upload-btn">Chọn ảnh</button>
          <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem', textAlign: 'center' }}>
            Dung lượng tối đa 1MB<br />
            Định dạng: JPEG, PNG
          </p>
        </div>
      </div>
    </>
  );
};

export default ProfileInfo;

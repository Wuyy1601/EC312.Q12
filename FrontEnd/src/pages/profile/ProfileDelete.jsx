import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const ProfileDelete = () => {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleDelete = async () => {
    if (confirmText !== 'XÓA TÀI KHOẢN') {
      setMessage({ type: 'error', text: 'Vui lòng nhập đúng "XÓA TÀI KHOẢN" để xác nhận' });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        alert('Tài khoản đã được xóa thành công!');
        navigate('/');
        window.location.reload();
      } else {
        setMessage({ type: 'error', text: data.message || 'Xóa tài khoản thất bại' });
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
        <h2>Xóa tài khoản</h2>
        <p>Hành động này không thể hoàn tác</p>
      </div>

      <div style={{ 
        background: '#fff3e0', 
        border: '1px solid #ffb74d', 
        borderRadius: '12px', 
        padding: '1.5rem', 
        marginBottom: '2rem' 
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <FaExclamationTriangle style={{ color: '#f57c00', fontSize: '1.5rem', flexShrink: 0 }} />
          <div>
            <h3 style={{ margin: '0 0 0.5rem', color: '#e65100' }}>Cảnh báo</h3>
            <p style={{ margin: 0, color: '#795548', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Khi bạn xóa tài khoản:
              <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                <li>Tất cả thông tin cá nhân sẽ bị xóa vĩnh viễn</li>
                <li>Lịch sử đơn hàng sẽ không thể truy cập</li>
                <li>Bạn không thể khôi phục tài khoản</li>
                <li>Email này có thể được sử dụng để đăng ký tài khoản mới</li>
              </ul>
            </p>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`profile-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form className="profile-form" onSubmit={(e) => { e.preventDefault(); handleDelete(); }} style={{ maxWidth: '500px' }}>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          Để xác nhận xóa tài khoản, vui lòng nhập <strong>"XÓA TÀI KHOẢN"</strong> vào ô bên dưới:
        </p>
        
        <div className="form-group" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder='Nhập "XÓA TÀI KHOẢN"'
            style={{ width: '100%' }}
          />
        </div>

        <div className="profile-submit" style={{ paddingLeft: 0 }}>
          <button 
            type="submit" 
            disabled={loading || confirmText !== 'XÓA TÀI KHOẢN'}
            style={{ 
              background: confirmText === 'XÓA TÀI KHOẢN' 
                ? 'linear-gradient(135deg, #c62828, #d32f2f)' 
                : '#ccc' 
            }}
          >
            {loading ? 'Đang xử lý...' : 'Xóa tài khoản'}
          </button>
        </div>
      </form>
    </>
  );
};

export default ProfileDelete;

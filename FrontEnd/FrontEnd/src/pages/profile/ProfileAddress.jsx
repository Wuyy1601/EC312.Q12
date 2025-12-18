import React from 'react';
import { useOutletContext } from 'react-router-dom';

const ProfileAddress = () => {
  const { user } = useOutletContext();

  return (
    <>
      <div className="profile-header">
        <h2>Địa chỉ của tôi</h2>
        <p>Quản lý địa chỉ giao hàng</p>
      </div>

      <div style={{ textAlign: 'center', padding: '3rem 0', color: '#888' }}>
        <p>Chức năng đang được phát triển...</p>
        <p style={{ fontSize: '0.9rem' }}>Bạn có thể nhập địa chỉ khi thanh toán</p>
      </div>
    </>
  );
};

export default ProfileAddress;

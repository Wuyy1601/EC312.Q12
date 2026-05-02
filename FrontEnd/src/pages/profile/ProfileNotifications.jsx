import React from 'react';
import { useOutletContext } from 'react-router-dom';

const ProfileNotifications = () => {
  const { user } = useOutletContext();

  return (
    <>
      <div className="profile-header">
        <h2>Cài đặt thông báo</h2>
        <p>Quản lý các thông báo bạn muốn nhận</p>
      </div>

      <div style={{ textAlign: 'center', padding: '3rem 0', color: '#888' }}>
        <p>Chức năng đang được phát triển...</p>
      </div>
    </>
  );
};

export default ProfileNotifications;

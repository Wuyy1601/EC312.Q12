import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import EventCard from '../components/calendar/EventCard';
import EventForm from '../components/calendar/EventForm';
import CalendarView from '../components/calendar/CalendarView';
import './CalendarPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const CalendarPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [events, setEvents] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [syncing, setSyncing] = useState(false);
    const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchEvents();
        fetchUpcomingEvents();

        // Check for Google auth callback
        const params = new URLSearchParams(location.search);
        if (params.get('google_auth') === 'success') {
            alert('Kết nối Google Calendar thành công! Bạn có thể đồng bộ sự kiện ngay.');
            window.history.replaceState({}, '', '/calendar');
        } else if (params.get('google_auth') === 'error') {
            alert('Kết nối Google Calendar thất bại. Vui lòng thử lại.');
            window.history.replaceState({}, '', '/calendar');
        }
    }, [token, navigate, location]);

    const handleUnauthorized = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigate('/login');
    };

    const fetchEvents = async () => {
        try {
            const response = await fetch(`${API_URL}/api/calendar/events`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                handleUnauthorized();
                return;
            }

            const data = await response.json();
            if (data.success) {
                setEvents(data.data);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUpcomingEvents = async () => {
        try {
            const response = await fetch(`${API_URL}/api/calendar/events/upcoming?days=30`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                handleUnauthorized();
                return;
            }

            const data = await response.json();
            if (data.success) {
                setUpcomingEvents(data.data);
            }
        } catch (error) {
            console.error('Error fetching upcoming events:', error);
        }
    };

    const handleCreateEvent = async (formData) => {
        try {
            const response = await fetch(`${API_URL}/api/calendar/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                alert('Tạo sự kiện thành công!');
                setShowModal(false);
                fetchEvents();
                fetchUpcomingEvents();
            } else {
                alert(data.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Error creating event:', error);
            alert('Không thể tạo sự kiện');
        }
    };

    const handleUpdateEvent = async (formData) => {
        try {
            const response = await fetch(`${API_URL}/api/calendar/events/${editingEvent._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                alert('Cập nhật sự kiện thành công!');
                setShowModal(false);
                setEditingEvent(null);
                fetchEvents();
                fetchUpcomingEvents();
            } else {
                alert(data.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Error updating event:', error);
            alert('Không thể cập nhật sự kiện');
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!confirm('Bạn có chắc muốn xóa sự kiện này?')) return;

        try {
            const response = await fetch(`${API_URL}/api/calendar/events/${eventId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                alert('Xóa sự kiện thành công!');
                fetchEvents();
                fetchUpcomingEvents();
            } else {
                alert(data.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('Không thể xóa sự kiện');
        }
    };

    const handleGoogleCalendarSync = async () => {
        try {
            const authResponse = await fetch(`${API_URL}/api/calendar/google/auth`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const authData = await authResponse.json();
            if (authData.success && authData.authUrl) {
                window.location.href = authData.authUrl;
            } else {
                alert('Không thể kết nối Google Calendar');
            }
        } catch (error) {
            console.error('Error initiating Google auth:', error);
            alert('Có lỗi xảy ra khi kết nối Google Calendar');
        }
    };

    const openCreateModal = () => {
        setEditingEvent(null);
        setShowModal(true);
    };

    const openEditModal = (event) => {
        setEditingEvent(event);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingEvent(null);
    };

    if (loading) {
        return (
            <div className="calendar-page">
                <div className="loading">
                    <h2>Đang tải...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="calendar-page">
            <div className="calendar-container">
                <div className="calendar-header">
                    <h1>Lịch Sự Kiện Đặc Biệt</h1>
                    <p>Quản lý ngày sinh nhật, kỷ niệm và các sự kiện quan trọng</p>
                </div>

                <div className="calendar-actions">
                    <button className="btn-primary" onClick={openCreateModal}>
                        ➕ Thêm sự kiện mới
                    </button>
                    <button className="btn-google" onClick={handleGoogleCalendarSync} disabled={syncing}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        {syncing ? 'Đang đồng bộ...' : 'Đồng bộ Google Calendar'}
                    </button>
                </div>

                <div className="view-toggle">
                    <button
                        className={`view-toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                        onClick={() => setViewMode('calendar')}
                    >
                        Lịch tháng
                    </button>
                    <button
                        className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                    >
                        Danh sách
                    </button>
                </div>

                <div className="calendar-content">
                    <div className="calendar-main">
                        {viewMode === 'calendar' ? (
                            <CalendarView
                                events={events}
                                onDateClick={(date) => {
                                    console.log('Clicked date:', date);
                                }}
                                onEventClick={(event) => {
                                    if (!event.isGoogleEvent) {
                                        openEditModal(event);
                                    }
                                }}
                            />
                        ) : (
                            <>
                                <h2 style={{ marginBottom: '1.5rem', color: '#8b1538' }}>
                                    Tất cả sự kiện ({events.length})
                                </h2>

                                {events.length === 0 ? (
                                    <div className="empty-state">
                                        <div className="empty-state-icon">📅</div>
                                        <h3>Chưa có sự kiện nào</h3>
                                        <p>Thêm sự kiện đầu tiên hoặc đồng bộ từ Google Calendar</p>
                                    </div>
                                ) : (
                                    <div className="events-list">
                                        {events.map(event => (
                                            <EventCard
                                                key={event._id}
                                                event={event}
                                                onEdit={openEditModal}
                                                onDelete={handleDeleteEvent}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className="calendar-sidebar">
                        <div className="sidebar-section">
                            <h3>Sắp diễn ra</h3>
                            <div className="upcoming-events">
                                {upcomingEvents.length === 0 ? (
                                    <p style={{ color: '#999', fontSize: '0.9rem' }}>
                                        Không có sự kiện nào trong 30 ngày tới
                                    </p>
                                ) : (
                                    upcomingEvents.slice(0, 5).map(event => (
                                        <div key={event._id} className="upcoming-event-card">
                                            <div className="upcoming-event-title">{event.title}</div>
                                            <div className="upcoming-event-date">
                                                {new Date(event.date).toLocaleDateString('vi-VN')}
                                            </div>
                                            <div className="upcoming-event-days">
                                                {event.daysUntil === 0 ? '🎉 Hôm nay!' :
                                                    event.daysUntil === 1 ? '⏰ Ngày mai' :
                                                        `Còn ${event.daysUntil} ngày`}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="sidebar-section">
                            <h3>Gợi ý</h3>
                            <div style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.6' }}>
                                <p>Đặt nhắc nhở trước 7-14 ngày để có thời gian chuẩn bị quà</p>
                                <p>Xem gợi ý quà tặng phù hợp cho từng loại sự kiện</p>
                                <p>Bật "Lặp lại hàng năm" cho sinh nhật và kỷ niệm</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingEvent ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện mới'}</h2>
                            <button className="close-btn" onClick={closeModal}>×</button>
                        </div>
                        <EventForm
                            event={editingEvent}
                            onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
                            onCancel={closeModal}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarPage;

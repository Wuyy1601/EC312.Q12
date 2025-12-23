import React from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const EventCard = ({ event, onEdit, onDelete }) => {
    const getEventTypeIcon = (type) => {
        const icons = {
            birthday: '🎂',
            anniversary: '💝',
            holiday: '🎉',
            custom: '📅'
        };
        return icons[type] || '📅';
    };

    const getEventTypeBadgeClass = (type) => {
        return `event-type-badge badge-${type}`;
    };

    const formatDate = (date) => {
        try {
            return format(new Date(date), 'EEEE, dd MMMM yyyy', { locale: vi });
        } catch {
            return new Date(date).toLocaleDateString('vi-VN');
        }
    };

    const getDaysUntilText = (daysUntil) => {
        if (daysUntil === 0) return 'Hôm nay!';
        if (daysUntil === 1) return 'Ngày mai';
        if (daysUntil < 0) return `${Math.abs(daysUntil)} ngày trước`;
        return `Còn ${daysUntil} ngày`;
    };

    return (
        <div className={`event-card ${event.isGoogleEvent ? 'google-event' : ''}`}>
            <div className="event-card-header">
                <div>
                    <div className="event-card-title">
                        {getEventTypeIcon(event.eventType)} {event.title}
                    </div>
                    <span className={getEventTypeBadgeClass(event.eventType)}>
                        {event.eventType === 'birthday' && 'Sinh nhật'}
                        {event.eventType === 'anniversary' && 'Kỷ niệm'}
                        {event.eventType === 'holiday' && 'Ngày lễ'}
                        {event.eventType === 'custom' && 'Tùy chỉnh'}
                    </span>
                    {event.isGoogleEvent && (
                        <span className="google-badge" style={{ marginLeft: '0.5rem' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google Calendar
                        </span>
                    )}
                </div>
                {!event.isGoogleEvent && (
                    <div className="event-card-actions">
                        <button className="icon-btn" onClick={() => onEdit(event)} title="Chỉnh sửa">
                            ✏️
                        </button>
                        <button className="icon-btn" onClick={() => onDelete(event._id)} title="Xóa">
                            🗑️
                        </button>
                    </div>
                )}
            </div>

            <div className="event-card-body">
                <div className="event-info-row">
                    <span>📅</span>
                    <span>{formatDate(event.date)}</span>
                </div>

                {event.daysUntil !== undefined && (
                    <div className="event-info-row">
                        <span>⏰</span>
                        <span style={{
                            color: event.daysUntil <= 7 ? '#e91e63' : '#666',
                            fontWeight: event.daysUntil <= 7 ? '600' : 'normal'
                        }}>
                            {getDaysUntilText(event.daysUntil)}
                        </span>
                    </div>
                )}

                {event.recurring && (
                    <div className="event-info-row">
                        <span>🔄</span>
                        <span>Lặp lại hàng năm</span>
                    </div>
                )}

                {event.reminderDays && event.reminderDays.length > 0 && (
                    <div className="event-info-row">
                        <span>🔔</span>
                        <span>Nhắc trước: {event.reminderDays.join(', ')} ngày</span>
                    </div>
                )}

                {event.notes && (
                    <div className="event-notes">
                        💭 {event.notes}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventCard;

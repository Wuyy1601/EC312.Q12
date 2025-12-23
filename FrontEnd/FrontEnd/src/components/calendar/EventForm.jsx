import React, { useState } from 'react';

const EventForm = ({ event, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        title: event?.title || '',
        eventType: event?.eventType || 'custom',
        date: event?.date ? new Date(event.date).toISOString().split('T')[0] : '',
        recurring: event?.recurring || false,
        reminderDays: event?.reminderDays || [7, 3, 1],
        productCategory: event?.productCategory || '',
        notes: event?.notes || '',
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const toggleReminderDay = (day) => {
        setFormData(prev => ({
            ...prev,
            reminderDays: prev.reminderDays.includes(day)
                ? prev.reminderDays.filter(d => d !== day)
                : [...prev.reminderDays, day].sort((a, b) => b - a)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Tên sự kiện *</label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="VD: Sinh nhật mẹ"
                    required
                />
            </div>

            <div className="form-group">
                <label>Loại sự kiện</label>
                <select name="eventType" value={formData.eventType} onChange={handleChange}>
                    <option value="birthday">Sinh nhật</option>
                    <option value="anniversary">Kỷ niệm</option>
                    <option value="holiday">Ngày lễ</option>
                    <option value="custom">Tùy chỉnh</option>
                </select>
            </div>

            <div className="form-group">
                <label>Ngày *</label>
                <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <div className="checkbox-group">
                    <input
                        type="checkbox"
                        id="recurring"
                        name="recurring"
                        checked={formData.recurring}
                        onChange={handleChange}
                    />
                    <label htmlFor="recurring" style={{ marginBottom: 0 }}>Lặp lại hàng năm</label>
                </div>
            </div>

            <div className="form-group">
                <label>Nhắc trước (số ngày)</label>
                <div className="reminder-days">
                    {[14, 7, 5, 3, 1].map(day => (
                        <div
                            key={day}
                            className={`reminder-chip ${formData.reminderDays.includes(day) ? 'selected' : ''}`}
                            onClick={() => toggleReminderDay(day)}
                        >
                            {day} ngày
                        </div>
                    ))}
                </div>
            </div>

            <div className="form-group">
                <label>Danh mục quà tặng gợi ý</label>
                <select name="productCategory" value={formData.productCategory} onChange={handleChange}>
                    <option value="">-- Tự động --</option>
                    <option value="birthday-gifts">Quà sinh nhật</option>
                    <option value="anniversary-gifts">Quà kỷ niệm</option>
                    <option value="holiday-gifts">Quà lễ tết</option>
                    <option value="flowers">Hoa tươi</option>
                    <option value="jewelry">Trang sức</option>
                </select>
            </div>

            <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Thêm ghi chú về sự kiện..."
                />
            </div>

            <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={onCancel}>
                    Hủy
                </button>
                <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? 'Đang lưu...' : (event ? 'Cập nhật' : 'Tạo sự kiện')}
                </button>
            </div>
        </form>
    );
};

export default EventForm;

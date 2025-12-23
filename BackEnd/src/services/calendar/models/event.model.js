import mongoose from "mongoose";
import connection from "../database.js";

const eventSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        eventType: {
            type: String,
            enum: ["birthday", "anniversary", "holiday", "custom"],
            default: "custom",
        },
        date: {
            type: Date,
            required: true,
            index: true,
        },
        recurring: {
            type: Boolean,
            default: false,
        },
        reminderDays: {
            type: [Number],
            default: [7, 3, 1], // Nhắc trước 7, 3, 1 ngày
        },
        googleEventId: {
            type: String,
            default: null,
            index: true,
        },
        productCategory: {
            type: String,
            default: null,
        },
        notificationPreferences: {
            email: { type: Boolean, default: true },
            webPush: { type: Boolean, default: true },
        },
        notes: {
            type: String,
            default: "",
        },
        lastReminderSent: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

// Index cho query hiệu quả
eventSchema.index({ userId: 1, date: 1 });
eventSchema.index({ userId: 1, googleEventId: 1 });

// Virtual để check xem event có phải từ Google Calendar không
eventSchema.virtual("isGoogleEvent").get(function () {
    return !!this.googleEventId;
});

// Method để tính số ngày còn lại
eventSchema.methods.getDaysUntil = function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventDate = new Date(this.date);
    eventDate.setHours(0, 0, 0, 0);

    // Nếu recurring, tính cho năm hiện tại
    if (this.recurring) {
        const currentYear = today.getFullYear();
        eventDate.setFullYear(currentYear);

        // Nếu đã qua trong năm nay, tính cho năm sau
        if (eventDate < today) {
            eventDate.setFullYear(currentYear + 1);
        }
    }

    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
};

// Method để check xem có cần gửi reminder không
eventSchema.methods.shouldSendReminder = function () {
    const daysUntil = this.getDaysUntil();

    // Chỉ gửi nếu trong danh sách reminderDays
    if (!this.reminderDays.includes(daysUntil)) {
        return false;
    }

    // Kiểm tra xem đã gửi reminder hôm nay chưa
    if (this.lastReminderSent) {
        const lastSent = new Date(this.lastReminderSent);
        const today = new Date();

        if (
            lastSent.getDate() === today.getDate() &&
            lastSent.getMonth() === today.getMonth() &&
            lastSent.getFullYear() === today.getFullYear()
        ) {
            return false; // Đã gửi rồi
        }
    }

    return true;
};

const Event = connection.models.Event || connection.model("Event", eventSchema);

export default Event;

import cron from "node-cron";
import Event from "../models/event.model.js";
import { sendEventReminder } from "../../notification/emailService.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Import User model để lấy thông tin user
const getUserModel = async () => {
    const userConnection = mongoose.createConnection(
        process.env.USERS_DB_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/giftnity_users",
        { useNewUrlParser: true, useUnifiedTopology: true }
    );

    const userSchema = new mongoose.Schema({
        username: String,
        email: String,
    });

    return userConnection.model("User", userSchema);
};

/**
 * Lấy gift suggestions dựa trên event type
 */
const getGiftSuggestions = (eventType, productCategory) => {
    const suggestions = {
        birthday: {
            category: "birthday-gifts",
            items: ["Thiệp sinh nhật", "Quà tặng sinh nhật", "Bánh kem"],
        },
        anniversary: {
            category: "anniversary-gifts",
            items: ["Hoa hồng", "Quà kỷ niệm", "Trang sức"],
        },
        holiday: {
            category: "holiday-gifts",
            items: ["Quà tết", "Quà lễ", "Giỏ quà"],
        },
        custom: {
            category: productCategory || "all",
            items: ["Quà tặng đặc biệt", "Thiệp chúc mừng"],
        },
    };

    return suggestions[eventType] || suggestions.custom;
};

/**
 * Gửi reminders cho events
 */
const sendReminders = async () => {
    try {
        console.log("🔔 Checking for event reminders...");

        // Lấy tất cả events
        const events = await Event.find({});

        const User = await getUserModel();
        let remindersSent = 0;

        for (const event of events) {
            // Check xem có cần gửi reminder không
            if (!event.shouldSendReminder()) {
                continue;
            }

            // Lấy thông tin user
            const user = await User.findById(event.userId);
            if (!user) {
                console.log(`User not found for event ${event._id}`);
                continue;
            }

            const daysUntil = event.getDaysUntil();
            const giftSuggestions = getGiftSuggestions(event.eventType, event.productCategory);

            // Gửi email nếu user bật email notification
            if (event.notificationPreferences.email) {
                try {
                    await sendEventReminder(user, event, daysUntil, giftSuggestions);
                    console.log(`✅ Sent email reminder for event "${event.title}" to ${user.email}`);
                    remindersSent++;
                } catch (error) {
                    console.error(`❌ Failed to send email for event ${event._id}:`, error.message);
                }
            }

            // TODO: Gửi web push notification nếu user bật
            // if (event.notificationPreferences.webPush) {
            //   await sendWebPushNotification(user, event, daysUntil, giftSuggestions);
            // }

            // Update lastReminderSent
            event.lastReminderSent = new Date();
            await event.save();
        }

        console.log(`📧 Sent ${remindersSent} reminders`);
    } catch (error) {
        console.error("❌ Error in sendReminders:", error);
    }
};

/**
 * Khởi động scheduler
 */
export const startReminderScheduler = () => {
    // Chạy mỗi ngày lúc 9:00 sáng
    cron.schedule("0 9 * * *", () => {
        console.log("⏰ Running daily reminder scheduler at 9:00 AM");
        sendReminders();
    });

    console.log("✅ Reminder scheduler started (runs daily at 9:00 AM)");

    // Chạy ngay khi start server (cho testing)
    if (process.env.NODE_ENV === "development") {
        console.log("🧪 Running initial reminder check (development mode)");
        setTimeout(() => sendReminders(), 5000); // Delay 5s để DB connect
    }
};

// Cho phép chạy manual từ command line
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log("🔧 Running reminder scheduler manually...");
    sendReminders().then(() => {
        console.log("✅ Manual reminder check completed");
        process.exit(0);
    });
}

export default { startReminderScheduler, sendReminders };

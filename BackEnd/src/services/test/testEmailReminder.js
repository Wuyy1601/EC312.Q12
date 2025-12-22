// Test script để gửi email reminder ngay lập tức
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Import services
import '../calendar/database.js';
import Event from '../calendar/models/event.model.js';
import User from '../user/models/user.model.js';
import { sendEventReminder } from '../notification/emailService.js';

async function testEmailReminder() {
    try {
        console.log('🧪 Starting email reminder test...\n');

        // 1. Tìm tất cả events sắp tới
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const events = await Event.find({
            date: { $gte: today }
        }).sort({ date: 1 });

        console.log(`📅 Found ${events.length} upcoming events\n`);

        if (events.length === 0) {
            console.log('❌ No events found. Please create an event first!');
            process.exit(0);
        }

        // 2. Kiểm tra từng event
        for (const event of events) {
            const daysUntil = event.getDaysUntil();
            const shouldSend = event.shouldSendReminder();

            console.log(`\n📌 Event: ${event.title}`);
            console.log(`   Date: ${event.date.toLocaleDateString('vi-VN')}`);
            console.log(`   Days until: ${daysUntil}`);
            console.log(`   Reminder days: ${event.reminderDays.join(', ')}`);
            console.log(`   Should send: ${shouldSend ? '✅ YES' : '❌ NO'}`);

            if (shouldSend) {
                // 3. Lấy thông tin user
                const user = await User.findById(event.userId);
                if (!user) {
                    console.log(`   ⚠️  User not found for event ${event.title}`);
                    continue;
                }

                console.log(`   User: ${user.username} (${user.email})`);

                // 4. Gửi email
                console.log(`   📧 Sending email to ${user.email}...`);

                try {
                    await sendEventReminder(user, event, daysUntil);
                    console.log(`   ✅ Email sent successfully!`);

                    // 5. Cập nhật lastReminderSent
                    event.lastReminderSent = new Date();
                    await event.save();
                    console.log(`   ✅ Updated lastReminderSent`);
                } catch (emailError) {
                    console.error(`   ❌ Failed to send email:`, emailError.message);
                }
            }
        }

        console.log('\n✅ Test completed!\n');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Run test
testEmailReminder();

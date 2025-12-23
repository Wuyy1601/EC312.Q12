import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

console.log("📧 Testing email configuration...");
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD ? "✅ Có" : "❌ Không có");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const testEmail = async () => {
  try {
    console.log("\n🚀 Đang gửi email test...");
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Gửi cho chính mình
      subject: "Test Email - EC312 Project",
      html: `
        <h2>Test Email Success!</h2>
        <p>Nếu bạn nhận được email này, email service hoạt động tốt! ✅</p>
        <p>Thời gian: ${new Date().toLocaleString()}</p>
      `,
    });

    console.log("✅ Email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);
    
  } catch (error) {
    console.error("❌ Error sending email:");
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    
    if (error.code === "EAUTH") {
      console.error("\n🔑 Lỗi authentication! Có thể:");
      console.error("1. App Password sai");
      console.error("2. Chưa bật 2-Step Verification");
      console.error("3. App Password đã hết hạn");
    }
  }
  
  process.exit(0);
};

testEmail();

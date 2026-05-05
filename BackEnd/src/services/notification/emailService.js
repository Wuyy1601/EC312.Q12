import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Tạo transporter để gửi email
const isEmailConfigured = !!(process.env.EMAIL_USER && (process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS));

const transporter = isEmailConfigured
  ? nodemailer.createTransport(
      process.env.EMAIL_HOST
        ? {
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT || 2525,
          auth: {
            user: process.env.EMAIL_USER,
            pass: (process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || "").replace(/\s+/g, ""),
          },
        }
        : {
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: (process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || "").replace(/\s+/g, ""),
          },
        }
    )
  : null;

if (!isEmailConfigured) {
  console.log("⚠️ Email chưa cấu hình (EMAIL_USER/EMAIL_PASS trống) — tính năng gửi email sẽ bị tắt.");
}

/**
 * Gửi email xác nhận đơn hàng
 */
export const sendOrderConfirmation = async (order) => {
  if (!transporter) return { success: false, error: "Email chưa cấu hình" };
  const itemsList = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toLocaleString("vi-VN")}đ</td>
        </tr>`
    )
    .join("");

  const mailOptions = {
    from: `"Giftnity Shop" <${process.env.EMAIL_USER}>`,
    to: order.customerInfo.email,
    subject: `Đơn hàng #${order.orderCode} đã được tạo - Giftnity`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #E8B4D9 0%, #8B1538 100%); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { padding: 30px; }
          .order-info { background: #fff5f8; border-radius: 10px; padding: 20px; margin-bottom: 20px; }
          .order-code { font-size: 24px; color: #8B1538; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #8B1538; color: white; padding: 12px; text-align: left; }
          .total { font-size: 20px; color: #8B1538; font-weight: bold; text-align: right; margin-top: 20px; }
          .footer { background: #f8f8f8; padding: 20px; text-align: center; color: #666; }
          .status { display: inline-block; background: #FFA500; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
          .payment-pending { background: #FFA500; }
          .payment-paid { background: #4CAF50; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Giftnity</h1>
            <p style="color: white; margin: 10px 0 0;">Cảm ơn bạn đã đặt hàng!</p>
          </div>
          
          <div class="content">
            <div class="order-info">
              <p>Xin chào <strong>${order.customerInfo.fullName}</strong>,</p>
              <p>Đơn hàng của bạn đã được tạo thành công!</p>
              <p>Mã đơn hàng: <span class="order-code">${order.orderCode}</span></p>
              <p>Trạng thái: <span class="status payment-pending">Chờ thanh toán</span></p>
            </div>
            
            <h3>Chi tiết đơn hàng:</h3>
            <table>
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th style="text-align: center;">SL</th>
                  <th style="text-align: right;">Giá</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
            </table>
            
            ${order.discountAmount > 0 ? `<p>Giảm giá: -${order.discountAmount.toLocaleString("vi-VN")}đ</p>` : ""}
            <p class="total">Tổng cộng: ${order.totalAmount.toLocaleString("vi-VN")}đ</p>
            
            <div class="order-info">
              <h3>Địa chỉ giao hàng:</h3>
              <p><strong>${order.customerInfo.fullName}</strong></p>
              <p>${order.customerInfo.phone}</p>
              <p>${order.customerInfo.address}</p>
            </div>
            
            <div class="order-info" style="background: #fff3e0;">
              <h3>Thanh toán:</h3>
              <p><strong>Phương thức:</strong> ${getPaymentMethodName(order.paymentMethod)}</p>
              ${order.paymentMethod !== "cod"
        ? `
                <p><strong>Nội dung chuyển khoản:</strong></p>
                <p style="background: #8B1538; color: white; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 16px;">
                  ${order.getTransferContent()}
                </p>
                <p style="color: #666; font-size: 12px;">Vui lòng chuyển khoản đúng nội dung để đơn hàng được xác nhận tự động.</p>
              `
        : "<p>Thanh toán khi nhận hàng</p>"
      }
            </div>
          </div>
          
          <div class="footer">
            <p>Nếu có thắc mắc, vui lòng liên hệ: support@giftnity.vn</p>
            <p>© 2025 Giftnity - Quà tặng ý nghĩa</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("📧 Email xác nhận đơn hàng đã gửi:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Lỗi gửi email:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Gửi email thông báo thanh toán thành công
 */
export const sendPaymentSuccess = async (order) => {
  if (!transporter) return { success: false, error: "Email chưa cấu hình" };
  const mailOptions = {
    from: `"Giftnity Shop" <${process.env.EMAIL_USER}>`,
    to: order.customerInfo.email,
    subject: `Thanh toán thành công - Đơn hàng #${order.orderCode} - Giftnity`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { padding: 30px; }
          .success-box { background: #e8f5e9; border: 2px solid #4CAF50; border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 20px; }
          .success-icon { font-size: 60px; }
          .order-code { font-size: 24px; color: #2E7D32; font-weight: bold; }
          .footer { background: #f8f8f8; padding: 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1> Giftnity</h1>
          </div>
          
          <div class="content">
            <div class="success-box">
              <div class="success-icon">✅</div>
              <h2 style="color: #2E7D32; margin: 10px 0;">Thanh toán thành công!</h2>
              <p>Đơn hàng <span class="order-code">#${order.orderCode}</span></p>
              <p style="font-size: 24px; color: #2E7D32; font-weight: bold;">
                ${order.totalAmount.toLocaleString("vi-VN")}đ
              </p>
            </div>
            
            <p>Xin chào <strong>${order.customerInfo.fullName}</strong>,</p>
            <p>Chúng tôi đã nhận được thanh toán của bạn. Đơn hàng đang được xử lý và sẽ sớm được giao đến bạn.</p>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 10px; margin: 20px 0;">
              <p><strong>Mã đơn hàng:</strong> ${order.orderCode}</p>
              <p><strong>Số tiền:</strong> ${order.totalAmount.toLocaleString("vi-VN")}đ</p>
              <p><strong>Thời gian:</strong> ${new Date(order.paidAt).toLocaleString("vi-VN")}</p>
              <p><strong>Giao đến:</strong> ${order.customerInfo.address}</p>
            </div>
            
            <p>Cảm ơn bạn đã mua sắm tại Giftnity!</p>
          </div>
          
          <div class="footer">
            <p>Nếu có thắc mắc, vui lòng liên hệ: support@giftnity.vn</p>
            <p>© 2025 Giftnity - Quà tặng ý nghĩa</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("Email thanh toán thành công đã gửi:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Lỗi gửi email:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Helper: Lấy tên phương thức thanh toán
 */
function getPaymentMethodName(method) {
  const methods = {
    momo: "Ví MoMo",
    visa: "Thẻ Visa/Mastercard",
    vnpay: "VNPAY",
    bank: "Chuyển khoản ngân hàng",
    cod: "Thanh toán khi nhận hàng (COD)",
  };
  return methods[method] || method;
};

export const sendResetPasswordEmail = async (email, username, resetUrl) => {
  if (!isEmailConfigured) throw new Error("Email chưa cấu hình (EMAIL_USER/EMAIL_PASS trống)");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset Password - Giftnity Shop",
    html: `
      <h2>Xin chào ${username},</h2>
      <p>Bạn đã yêu cầu reset password.</p>
      <p>Click vào link bên dưới để đặt lại mật khẩu:</p>
      <a href="${resetUrl}" style="
        display: inline-block;
        padding: 10px 20px;
        background-color: #4CAF50;
        color: white;
        text-decoration: none;
        border-radius: 5px;
      ">Reset Password</a>
      <p>Link này sẽ hết hạn sau 1 giờ.</p>
      <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Gửi email nhắc nhở sự kiện đặc biệt
 */
export const sendEventReminder = async (user, event, daysUntil, giftSuggestions = null) => {
  if (!transporter) return { success: false, error: "Email chưa cấu hình" };
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  const mailOptions = {
    from: `"Giftnity" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `Nhắc nhở: ${event.title} - Còn ${daysUntil} ngày!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #E8B4D9 0%, #8B1538 100%); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { padding: 30px; }
          .event-box { background: #fff5f8; border-left: 4px solid #8B1538; border-radius: 10px; padding: 20px; margin-bottom: 20px; }
          .event-title { font-size: 24px; color: #8B1538; font-weight: bold; margin-bottom: 10px; }
          .days-until { font-size: 36px; color: #8B1538; font-weight: bold; text-align: center; margin: 20px 0; }
          .gift-section { background: #f8f8f8; border-radius: 10px; padding: 20px; margin-top: 20px; }
          .gift-item { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border: 1px solid #ddd; }
          .btn { display: inline-block; background: #8B1538; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 10px 5px; font-weight: bold; }
          .footer { background: #f8f8f8; padding: 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Giftnity</h1>
            <p style="color: white; margin: 10px 0 0;">Nhắc nhở sự kiện đặc biệt</p>
          </div>
          
          <div class="content">
            <div class="event-box">
              <div class="event-title">${event.title}</div>
              <p><strong>Loại sự kiện:</strong> ${getEventTypeName(event.eventType)}</p>
              <p><strong>Ngày:</strong> ${new Date(event.date).toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    })}</p>
              ${event.notes ? `<p><strong>Ghi chú:</strong> ${event.notes}</p>` : ""}
            </div>
            
            <div class="days-until">
              Còn ${daysUntil} ngày! ⏰
            </div>
            
            <p>Xin chào <strong>${user.username}</strong>,</p>
            <p>Đây là lời nhắc nhở về sự kiện đặc biệt của bạn. Đừng quên chuẩn bị quà tặng thật ý nghĩa nhé!</p>
            
            ${giftSuggestions && giftSuggestions.items ? `
            <div class="gift-section">
              <h3 style="color: #8B1538; margin-top: 0;">💝 Gợi ý quà tặng phù hợp</h3>
              ${giftSuggestions.items.map(item => `
                <div class="gift-item">
                  <strong>${item}</strong>
                </div>
              `).join("")}
              
              <div style="text-align: center; margin-top: 20px;">
                <a href="${frontendUrl}/products?category=${giftSuggestions.category}" class="btn">
                  Xem quà tặng
                </a>
                <a href="${frontendUrl}/calendar" class="btn" style="background: #4CAF50;">
                  Xem lịch
                </a>
              </div>
            </div>
            ` : `
            <div style="text-align: center; margin-top: 20px;">
              <a href="${frontendUrl}/products" class="btn">
                Xem quà tặng
              </a>
              <a href="${frontendUrl}/calendar" class="btn" style="background: #4CAF50;">
                Xem lịch
              </a>
            </div>
            `}
          </div>
          
          <div class="footer">
            <p>Bạn nhận được email này vì đã đăng ký nhắc nhở sự kiện trên Giftnity</p>
            <p>© 2025 Giftnity - Quà tặng ý nghĩa</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("Email nhắc nhở sự kiện đã gửi:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Lỗi gửi email nhắc nhở:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Helper: Lấy tên loại sự kiện
 */
function getEventTypeName(type) {
  const types = {
    birthday: "Sinh nhật",
    anniversary: "Kỷ niệm",
    holiday: "Ngày lễ",
    custom: "Sự kiện đặc biệt",
  };
  return types[type] || type;
}

export default {
  sendOrderConfirmation,
  sendPaymentSuccess,
  sendResetPasswordEmail,
  sendEventReminder,
};


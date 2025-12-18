import crypto from "crypto";
import querystring from "qs";

// VNPay Sandbox Config
const VNPAY_CONFIG = {
  vnp_TmnCode: process.env.VNPAY_TMN_CODE || "G06AESZ0",
  vnp_HashSecret:
    process.env.VNPAY_HASH_SECRET || "5QKNOV9AA53VPUEZYNM13SRVPYZGVTAQ",
  vnp_Url:
    process.env.VNPAY_URL ||
    "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  vnp_ReturnUrl:
    process.env.VNPAY_RETURN_URL || "http://localhost:5001/api/orders/vnpay-return",
  vnp_Version: "2.1.0",
  vnp_Command: "pay",
  vnp_CurrCode: "VND",
  vnp_Locale: "vn",
};

/**
 * Sắp xếp object theo key
 */
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[decodeURIComponent(str[key])]).replace(/%20/g, "+");
  }
  return sorted;
}

/**
 * Tạo URL thanh toán VNPay
 */
export const createVnpayPayment = (order, ipAddr = "127.0.0.1") => {
  try {
    const date = new Date();
    const createDate =
      date.getFullYear().toString() +
      String(date.getMonth() + 1).padStart(2, "0") +
      String(date.getDate()).padStart(2, "0") +
      String(date.getHours()).padStart(2, "0") +
      String(date.getMinutes()).padStart(2, "0") +
      String(date.getSeconds()).padStart(2, "0");

    // Tạo TxnRef có chứa orderCode để sau này parse được
    const orderId = order.orderCode + "_" + Date.now().toString();
    const amount = Math.round(order.totalAmount * 100); // VNPay yêu cầu nhân 100

    let vnp_Params = {};
    vnp_Params["vnp_Version"] = VNPAY_CONFIG.vnp_Version;
    vnp_Params["vnp_Command"] = VNPAY_CONFIG.vnp_Command;
    vnp_Params["vnp_TmnCode"] = VNPAY_CONFIG.vnp_TmnCode;
    vnp_Params["vnp_Locale"] = VNPAY_CONFIG.vnp_Locale;
    vnp_Params["vnp_CurrCode"] = VNPAY_CONFIG.vnp_CurrCode;
    vnp_Params["vnp_TxnRef"] = orderId;
    vnp_Params["vnp_OrderInfo"] = "Thanh toan don hang " + order.orderCode;
    vnp_Params["vnp_OrderType"] = "other";
    vnp_Params["vnp_Amount"] = amount;
    vnp_Params["vnp_ReturnUrl"] = VNPAY_CONFIG.vnp_ReturnUrl;
    vnp_Params["vnp_IpAddr"] = ipAddr;
    vnp_Params["vnp_CreateDate"] = createDate;

    // Sắp xếp params
    vnp_Params = sortObject(vnp_Params);

    // Tạo signData
    const signData = querystring.stringify(vnp_Params, { encode: false });
    console.log("🔐 VNPay signData:", signData);

    // Tạo chữ ký
    const hmac = crypto.createHmac("sha512", VNPAY_CONFIG.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    console.log("🔐 VNPay signature:", signed);

    // Thêm hash vào params
    vnp_Params["vnp_SecureHash"] = signed;

    // Tạo URL
    const payUrl =
      VNPAY_CONFIG.vnp_Url +
      "?" +
      querystring.stringify(vnp_Params, { encode: false });

    console.log("🔐 VNPay Payment URL:", payUrl);

    return {
      success: true,
      payUrl: payUrl,
      vnpayOrderId: orderId,
    };
  } catch (error) {
    console.error("❌ VNPay Error:", error.message);
    return {
      success: false,
      message: error.message,
    };
  }
};

/**
 * Xác thực chữ ký từ VNPay callback
 */
export const verifyVnpaySignature = (vnp_Params) => {
  const secureHash = vnp_Params["vnp_SecureHash"];

  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  vnp_Params = sortObject(vnp_Params);
  const signData = querystring.stringify(vnp_Params, { encode: false });

  const hmac = crypto.createHmac("sha512", VNPAY_CONFIG.vnp_HashSecret);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  return secureHash === signed;
};

/**
 * Parse response code từ VNPay
 */
export const getVnpayResponseMessage = (responseCode) => {
  const messages = {
    "00": "Giao dịch thành công",
    "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ",
    "09": "Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking",
    10: "Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
    11: "Đã hết hạn chờ thanh toán",
    12: "Thẻ/Tài khoản bị khóa",
    13: "Nhập sai mật khẩu xác thực (OTP)",
    24: "Khách hàng hủy giao dịch",
    51: "Tài khoản không đủ số dư",
    65: "Tài khoản đã vượt quá hạn mức giao dịch trong ngày",
    75: "Ngân hàng thanh toán đang bảo trì",
    79: "Nhập sai mật khẩu thanh toán quá số lần quy định",
    99: "Lỗi không xác định",
  };
  return messages[responseCode] || "Lỗi không xác định";
};

export default {
  createVnpayPayment,
  verifyVnpaySignature,
  getVnpayResponseMessage,
};

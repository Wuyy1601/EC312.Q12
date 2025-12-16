import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaMinus,
  FaPlus,
  FaTrash,
  FaCcVisa,
  FaQrcode,
  FaMoneyBillWave,
} from "react-icons/fa";
import "./CartPage.css";

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Quà giáng sinh",
      price: 1000,
      quantity: 1,
      image: "https://via.placeholder.com/80/E8B4D9/FFFFFF?text=Gift",
    },
    {
      id: 2,
      name: "Quà giáng sinh",
      price: 1000,
      quantity: 1,
      image: "https://via.placeholder.com/80/D4A5C7/FFFFFF?text=Gift",
    },
    {
      id: 3,
      name: "Quà giáng sinh",
      price: 1000,
      quantity: 1,
      image: "https://via.placeholder.com/80/E8B4D9/FFFFFF?text=Gift",
    },
    {
      id: 4,
      name: "Quà giáng sinh",
      price: 1000,
      quantity: 1,
      image: "https://via.placeholder.com/80/D4A5C7/FFFFFF?text=Gift",
    },
    {
      id: 5,
      name: "Quà giáng sinh",
      price: 1000,
      quantity: 1,
      image: "https://via.placeholder.com/80/E8B4D9/FFFFFF?text=Gift",
    },
  ]);

  const [discountCode, setDiscountCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("momo");

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const updateQuantity = (id, change) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const applyDiscount = () => {
    // Sample discount logic
    if (discountCode.toLowerCase() === "sale10") {
      setDiscount(10);
    } else if (discountCode.toLowerCase() === "sale20") {
      setDiscount(20);
    } else {
      setDiscount(0);
      alert("Mã giảm giá không hợp lệ");
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-items-section">
          <table className="cart-table">
            <thead>
              <tr>
                <th></th>
                <th>Sản phẩm</th>
                <th>Đơn giá</th>
                <th>Số lượng</th>
                <th>Số tiền</th>
                <th>Xóa</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <input
                      type="checkbox"
                      className="item-checkbox"
                      defaultChecked
                    />
                  </td>
                  <td>
                    <div className="product-cell">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="product-thumb"
                      />
                      <span className="product-name">{item.name}</span>
                    </div>
                  </td>
                  <td className="price-cell">{formatPrice(item.price)}</td>
                  <td>
                    <div className="quantity-control">
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <FaMinus />
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <FaPlus />
                      </button>
                    </div>
                  </td>
                  <td className="price-cell">
                    {formatPrice(item.price * item.quantity)}
                  </td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => removeItem(item.id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {cartItems.length === 0 && (
            <div className="empty-cart">
              <p>Giỏ hàng của bạn đang trống</p>
            </div>
          )}
        </div>

        <div className="cart-summary">
          <div className="discount-section">
            <input
              type="text"
              placeholder="Mã giảm giá"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              className="discount-input"
            />
            <button className="apply-btn" onClick={applyDiscount}>
              Áp dụng
            </button>
          </div>

          <div className="summary-box">
            <h3>Tóm tắt đơn hàng</h3>

            <div className="summary-row">
              <span>Số sản phẩm:</span>
              <span>{totalItems}</span>
            </div>

            <div className="summary-row">
              <span>Tạm tính:</span>
              <span>{formatPrice(subtotal)} VNĐ</span>
            </div>

            <div className="summary-row">
              <span>Giảm giá:</span>
              <span className="discount-value">
                -{formatPrice(discountAmount)} VNĐ
              </span>
            </div>

            <div className="summary-row total-row">
              <span>Tổng cộng:</span>
              <span className="total-value">{formatPrice(total)} VNĐ</span>
            </div>

            <div className="payment-methods">
              <p className="payment-title">Phương thức thanh toán:</p>
              <div className="payment-options">
                <label
                  className={`payment-option ${
                    paymentMethod === "momo" ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="momo"
                    checked={paymentMethod === "momo"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-icon momo-icon">
                    <span>MOMO</span>
                  </div>
                </label>

                <label
                  className={`payment-option ${
                    paymentMethod === "visa" ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="visa"
                    checked={paymentMethod === "visa"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-icon visa-icon">
                    <FaCcVisa />
                  </div>
                </label>

                <label
                  className={`payment-option ${
                    paymentMethod === "vnpay" ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="vnpay"
                    checked={paymentMethod === "vnpay"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-icon vnpay-icon">
                    <span>VNPAY</span>
                  </div>
                </label>

                <label
                  className={`payment-option ${
                    paymentMethod === "bank" ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="bank"
                    checked={paymentMethod === "bank"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-icon bank-icon">
                    <FaQrcode />
                    <span>QR Bank</span>
                  </div>
                </label>

                <label
                  className={`payment-option ${
                    paymentMethod === "cod" ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-icon cod-icon">
                    <FaMoneyBillWave />
                    <span>Thanh toán khi nhận hàng</span>
                  </div>
                </label>
              </div>
            </div>

            <button
              className="checkout-btn"
              onClick={() => {
                // Lưu cart data vào localStorage để CheckoutPage sử dụng
                localStorage.setItem("cartItems", JSON.stringify(cartItems));
                localStorage.setItem("paymentMethod", paymentMethod);
                localStorage.setItem("discountCode", discountCode);
                localStorage.setItem(
                  "discountAmount",
                  discountAmount.toString()
                );
                // Chuyển sang trang checkout
                navigate("/checkout");
              }}
              disabled={cartItems.length === 0}
            >
              THANH TOÁN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

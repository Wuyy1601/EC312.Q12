import React, { useState, useEffect } from "react";
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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/500";
    if (imagePath.startsWith("http")) return imagePath;
    const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${API_URL}${path}`;
  };

  // Load cart from local storage
  useEffect(() => {
    const loadCart = () => {
      const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartItems(storedCart);
      // Default select all
      if (storedCart.length > 0) {
        setSelectedItems(new Set(storedCart.map((item) => item.id)));
      }
    };

    loadCart();

    // Listen for storage changes
    window.addEventListener("storage", loadCart);
    return () => window.removeEventListener("storage", loadCart);
  }, []);

  // State để track sản phẩm được chọn (mặc định chọn tất cả)
  const [selectedItems, setSelectedItems] = useState(new Set());

  const [discountCode, setDiscountCode] = useState("");
  const [discount, setDiscount] = useState(0);


  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  // Toggle chọn/bỏ chọn sản phẩm
  const toggleSelectItem = (id) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Chọn/bỏ chọn tất cả
  const toggleSelectAll = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map((item) => item.id)));
    }
  };

  const updateQuantity = (id, change) => {
    setCartItems((items) => {
      const newItems = items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      );
      localStorage.setItem("cart", JSON.stringify(newItems));
      window.dispatchEvent(new Event("storage"));
      return newItems;
    });
  };

  const removeItem = (id) => {
    setCartItems((items) => {
      const newItems = items.filter((item) => item.id !== id);
      localStorage.setItem("cart", JSON.stringify(newItems));
      window.dispatchEvent(new Event("storage"));
      return newItems;
    });
    // Cũng xóa khỏi selectedItems
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
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

  // Chỉ tính những sản phẩm được chọn
  const selectedCartItems = cartItems.filter((item) => selectedItems.has(item.id));
  const subtotal = selectedCartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;
  const totalItems = selectedCartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-items-section">
          <table className="cart-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    className="item-checkbox"
                    checked={selectedItems.size === cartItems.length && cartItems.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
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
                      checked={selectedItems.has(item.id)}
                      onChange={() => toggleSelectItem(item.id)}
                    />
                  </td>
                  <td>
                    <div className="product-cell">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="product-thumb"
                      />
                      <span className="product-name">{item.name}</span>
                      {item.isBundle && item.bundleDescription && (
                        <div className="cart-bundle-desc">
                          <small>Set gồm: {item.bundleDescription}</small>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="price-cell">{formatPrice(item.price)}</td>
                  <td>
                    <div className="quantity-control">
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <i className="fa-solid fa-minus" style={{ fontSize: "10px" }}></i>
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <i className="fa-solid fa-plus" style={{ fontSize: "10px" }}></i>
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
                      <i className="fa-solid fa-trash"></i>
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



            <button
              className="checkout-btn"
              onClick={() => {
                // Chỉ lưu những sản phẩm được chọn vào localStorage
                const itemsToCheckout = cartItems.filter((item) => 
                  selectedItems.has(item.id)
                );
                localStorage.setItem("cartItems", JSON.stringify(itemsToCheckout));

                localStorage.setItem("discountCode", discountCode);
                localStorage.setItem(
                  "discountAmount",
                  discountAmount.toString()
                );
                // Chuyển sang trang checkout
                navigate("/checkout");
              }}
              disabled={selectedItems.size === 0}
            >
              THANH TOÁN ({selectedItems.size} sản phẩm)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

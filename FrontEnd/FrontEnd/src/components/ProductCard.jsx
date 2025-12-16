import React from "react";
import { FaShoppingCart } from "react-icons/fa";
import "./ProductCard.css";

const ProductCard = ({
  product,
  type = "featured",
  showDiscount = false,
  discountPercent = 0,
}) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const isFlashSale = type === "flash-sale";

  return (
    <div
      className={`product-card ${
        isFlashSale ? "flash-sale-card" : "featured-card"
      }`}
    >
      {showDiscount && discountPercent > 0 && (
        <div className="discount-badge">{discountPercent}%</div>
      )}

      <div className="product-image">
        <img src={product.image} alt={product.name} />
      </div>

      <div className="product-info">
        <h3>{product.name}</h3>

        {isFlashSale ? (
          <button className="flash-sale-btn">Săn Sale Chớp Nhoáng!</button>
        ) : (
          <div className="product-footer">
            <p className="product-price">{formatPrice(product.price)}</p>
            <button className="cart-icon-btn">
              <FaShoppingCart />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;

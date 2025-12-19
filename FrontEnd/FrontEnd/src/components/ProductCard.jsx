import React from "react";
import { FaShoppingCart, FaBolt } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./ProductCard.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const ProductCard = ({
  product,
  type = "featured",
  showDiscount = false,
  discountPercent = 0,
  onAddToCart,
}) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/500";
    if (imagePath.startsWith("http")) return imagePath;
    const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${API_URL}${path}`;
  };

  const isFlashSale = type === "flash-sale";
  const productId = product._id || product.id;

  const handleCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <div
      className={`product-card ${
        isFlashSale ? "flash-sale-card" : "featured-card"
      }`}
    >
      <Link to={`/product/${productId}`} className="product-link-wrapper">
      {showDiscount && discountPercent > 0 && (
        <div className="discount-badge">{discountPercent}%</div>
      )}

      <div className="product-image">
        <img src={getImageUrl(product.image)} alt={product.name} />
      </div>

      <div className="product-info">
        <h3>{product.name}</h3>

        {isFlashSale ? (
          <button className="flash-sale-btn" onClick={handleCartClick}>
            <i className="fa-solid fa-bolt" style={{ marginRight: "0.5rem" }}></i> Săn Sale Chớp Nhoáng!
          </button>
        ) : (
          <div className="product-footer">
            <p className="product-price">{formatPrice(product.price)}</p>
            <button className="cart-icon-btn" onClick={handleCartClick}>
              <i className="fa-solid fa-cart-shopping"></i>
            </button>
          </div>
        )}
      </div>
      </Link>
    </div>
  );
};

export default ProductCard;

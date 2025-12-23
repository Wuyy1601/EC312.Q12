import React from "react";
import { Link } from "react-router-dom";
import "./ProductCard.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

import { calculateStock } from "../utils/productUtils";

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
  
  // Calculate Stock
  const stock = calculateStock(product);
  const isOutOfStock = stock <= 0;

  const handleCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock && onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <div
      className={`product-card ${
        isFlashSale ? "flash-sale-card" : "featured-card"
      } ${isOutOfStock ? "out-of-stock" : ""}`}
    >
      <Link to={`/product/${productId}`} className="product-link-wrapper">
      {showDiscount && discountPercent > 0 && (
        <div className="discount-badge">{discountPercent}%</div>
      )}

      <div className="product-image" style={{ position: 'relative' }}>
        <img src={getImageUrl(product.image)} alt={product.name} style={isOutOfStock ? { filter: 'grayscale(100%)' } : {}} />
        {isOutOfStock && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap'
          }}>
            HẾT HÀNG
          </div>
        )}
      </div>

      <div className="product-info">
        <h3>{product.name}</h3>

        {isFlashSale ? (
          <button className="flash-sale-btn" onClick={handleCartClick} disabled={isOutOfStock}>
            <i className="fa-solid fa-bolt" style={{ marginRight: "0.5rem" }}></i> {isOutOfStock ? "Hết Suất" : "Săn Sale Chớp Nhoáng!"}
          </button>
        ) : (
          <div className="product-footer">
            <p className="product-price">{formatPrice(product.price)}</p>
            <button 
              className="cart-icon-btn" 
              onClick={handleCartClick} 
              disabled={isOutOfStock}
              style={isOutOfStock ? { opacity: 0.5, cursor: 'not-allowed', background: '#999' } : {}}
            >
              {isOutOfStock ? <i className="fa-solid fa-ban"></i> : <i className="fa-solid fa-cart-shopping"></i>}
            </button>
          </div>
        )}
      </div>
      </Link>
    </div>
  );
};

export default ProductCard;

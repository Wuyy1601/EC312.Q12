import { Link } from "react-router-dom";
import { calculateStock } from "../utils/productUtils";
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
    if (!imagePath) return "https://placehold.co/500x500/fce4ec/e94560?text=Gift";
    if (imagePath.startsWith("http")) return imagePath;
    const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${API_URL}${path}`;
  };

  const isFlashSale = type === "flash-sale";
  const productId = product._id || product.id;
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

        <div className="product-image">
          <img
            src={getImageUrl(product.image)}
            alt={product.name}
            className={isOutOfStock ? "grayscale" : ""}
            loading="lazy"
          />
          {isOutOfStock && (
            <div className="out-of-stock-overlay">HẾT HÀNG</div>
          )}
        </div>

        <div className="product-info">
          <h3>{product.name}</h3>

          {isFlashSale ? (
            <button
              className="flash-sale-btn"
              onClick={handleCartClick}
              disabled={isOutOfStock}
            >
              <i className="fa-solid fa-bolt" />
              {isOutOfStock ? " Hết Suất" : " Săn Sale Chớp Nhoáng!"}
            </button>
          ) : (
            <div className="product-footer">
              <p className="product-price">{formatPrice(product.price)}</p>
              <button
                className={`cart-icon-btn ${isOutOfStock ? "disabled" : ""}`}
                onClick={handleCartClick}
                disabled={isOutOfStock}
              >
                <i className={`fa-solid ${isOutOfStock ? "fa-ban" : "fa-cart-shopping"}`} />
              </button>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;

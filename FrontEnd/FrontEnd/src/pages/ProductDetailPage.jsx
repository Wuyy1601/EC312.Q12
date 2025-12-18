import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaHeart, FaArrowLeft } from "react-icons/fa";
import ProductReviews from "@components/ProductReviews";
import "./ProductDetailPage.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check logged in user
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));

    // Fetch product detail
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      // Vì API getOneProduct chưa chắc đã public, tạm thời fetch list rồi find nếu API getOne chưa có
      // Nhưng chuẩn là GET /api/products/:id
      // Trước mắt giả lập fetch từ data mẫu nếu chưa có API backend real cho detail
      // Hoặc gọi API:
      const res = await fetch(`${API_URL}/api/products/${id}`);
      const data = await res.json();
      if (data.success) {
        setProduct(data.product);
      } else {
        // Fallback or demo data if API fail/not exist
        // setProduct(demoProduct);
      }
    } catch (error) {
      console.error("Fetch product error:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item) => item.id === product._id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.primaryImage || product.image || "https://via.placeholder.com/150",
        quantity: 1,
      });
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    // Dispatch event to update header cart count
    window.dispatchEvent(new Event("storage"));
    alert("Đã thêm vào giỏ hàng!");
  };

  if (loading) return <div className="loading-page">Đang tải...</div>;
  if (!product) return <div className="error-page">Không tìm thấy sản phẩm <button onClick={() => navigate("/")}>Về trang chủ</button></div>;

  return (
    <div className="product-detail-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Quay lại
        </button>

        <div className="product-main-content">
          {/* Left Column: Images */}
          <div className="product-gallery">
            <div className="main-image-frame">
              <img 
                src={product.primaryImage || product.image} 
                alt={product.name} 
                className="main-image"
              />
              <div className="frame-decoration"></div>
            </div>
          </div>

          {/* Right Column: Info & Paper Note */}
          <div className="product-info-section">
            <h1 className="product-title">{product.name}</h1>
            
            <div className="price-section">
              <span className="current-price">
                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price)}
              </span>
              {product.originalPrice && (
                <span className="original-price">
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.originalPrice)}
                </span>
              )}
            </div>

            <div className="actions">
              <button className="buy-now-btn" onClick={() => { addToCart(); navigate("/cart"); }}>
                MUA NGAY
              </button>
              <button className="add-cart-btn" onClick={addToCart}>
                <FaShoppingCart />
              </button>
              <button className="wishlist-btn">
                <FaHeart />
              </button>
            </div>

            {/* Paper Note Style Description */}
            <div className="paper-note">
              <div className="paper-content">
                <h3>Mô tả sản phẩm</h3>
                <p>{product.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ProductReviews productId={product._id} user={user} />
      </div>
    </div>
  );
};

export default ProductDetailPage;

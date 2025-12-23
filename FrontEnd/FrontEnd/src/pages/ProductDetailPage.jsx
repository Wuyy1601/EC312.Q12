import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProductReviews from "@components/ProductReviews";
import BundleModal from "@components/BundleModal";
import { useCart } from "../context/CartContext";
import { calculateStock } from "../utils/productUtils";
import "./ProductDetailPage.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // Image Carousel State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Subscription State
  const [subscriptionMode, setSubscriptionMode] = useState('once'); // 'once' or 'monthly'

  // ... (existing code)

  const handleBundleAddToCart = (bundleProduct) => {
    addToCart(bundleProduct, 1, {
      subscription: subscriptionMode
    });
    setIsBundleModalOpen(false);
  };

  const handleAddToCartClick = () => {
    if (product.isBundle && product.bundleItems?.length > 0) {
      setIsBundleModalOpen(true);
    } else {
      addToCart(product, 1, {
        message: customMessage,
        image: customImageBase64,
        imageName: customImageName,
        subscription: subscriptionMode
      });
    }
  };

  const handleBuyNowClick = () => {
    if (product.isBundle && product.bundleItems?.length > 0) {
      setIsBundleModalOpen(true);
    } else {
      addToCart(product, 1, {
        message: customMessage,
        image: customImageBase64,
        imageName: customImageName,
        subscription: subscriptionMode
      });
      navigate("/cart");
    }
  };
 
  // ... (render return)



  // Initialize allImages
  // Combine main product images (if any) and bundle item images
  const allImages = React.useMemo(() => {
    if (!product) return [];
    let images = [];
    
    // Add product's own images
    if (product.images && product.images.length > 0) {
      images = [...product.images];
    } else if (product.image) {
      images = [product.image];
    } else if (product.primaryImage) {
      images = [product.primaryImage];
    }

    // Add bundle items' images
    if (product.isBundle && product.bundleItems) {
      product.bundleItems.forEach(item => {
        if (item.product && item.product.image) {
          images.push(item.product.image);
        }
      });
    }
    
    // Remove duplicates and filter valid
    return [...new Set(images)].filter(Boolean);
  }, [product]);

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // Bundle Modal State
  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`);
      const data = await res.json();
      if (data.success) {
        setProduct(data.data);
      }
    } catch (error) {
      console.error("Fetch product error:", error);
      alert("Lỗi khi tải sản phẩm: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/500";
    if (imagePath.startsWith("http")) return imagePath;
    const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${API_URL}${path}`;
  };





  const currentImageUrl = allImages.length > 0 ? getImageUrl(allImages[currentImageIndex]) : "https://via.placeholder.com/500";
  
  const stock = calculateStock(product);
  const isOutOfStock = stock <= 0;

  if (loading) return <div className="loading-page">Đang tải...</div>;
  if (!product) return <div className="error-page">Không tìm thấy sản phẩm <button onClick={() => navigate("/")}>Về trang chủ</button></div>;

  return (
    <div className="product-detail-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <i className="fa-solid fa-arrow-left"></i> Quay lại
        </button>

        <div className="product-main-content">
          {/* Left Column: Images */}
          <div className="product-gallery">
            <div className="main-image-frame">
              {allImages.length > 1 && (
                <button className="gallery-nav-btn prev-btn" onClick={handlePrevImage}>
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
              )}
              
              <img 
                src={currentImageUrl} 
                alt={product.name} 
                className="main-image"
              />
              
              {allImages.length > 1 && (
                <button className="gallery-nav-btn next-btn" onClick={handleNextImage}>
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              )}
              
              <div className="frame-decoration"></div>
            </div>
            {/* Thumbnails (Optional but helpful) */}
            {allImages.length > 1 && (
              <div className="gallery-thumbnails">
                {allImages.map((img, idx) => (
                  <div 
                    key={idx} 
                    className={`thumbnail-item ${idx === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(idx)}
                  >
                    <img src={getImageUrl(img)} alt={`Thumbnail ${idx}`} />
                  </div>
                ))}
              </div>
            )}
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

            <div className="product-meta" style={{ marginBottom: '1rem', fontSize: '1rem' }}>
              <strong>Tình trạng: </strong>
              {isOutOfStock ? (
                <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Hết hàng</span>
              ) : (
                <span style={{ color: '#22c55e', fontWeight: 'bold' }}>Còn hàng ({stock})</span>
              )}
            </div>

            {/* Story Section */}
            {product.story && (
              <div className="product-story" style={{
                background: 'linear-gradient(135deg, #fef3f8 0%, #fff5f7 100%)',
                padding: '1.25rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                borderLeft: '4px solid #ec407a'
              }}>
                <h3 style={{ 
                  fontSize: '1rem', 
                  color: '#ec407a', 
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  📖 Câu chuyện phía sau sản phẩm
                </h3>
                <p style={{ 
                  fontStyle: 'italic', 
                  color: '#666',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  "{product.story}"
                </p>
              </div>
            )}            {/* Subscription Options (Cratejoy style) */}
            <div className="subscription-options" style={{ marginBottom: '1.5rem', padding: '15px', border: '1px solid #e5e7eb', borderRadius: '12px', background: '#f9fafb' }}>
               <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <i className="fa-solid fa-calendar-check" style={{ color: '#ec407a' }}></i> Tùy chọn mua hàng
               </h3>
               
               <label className="sub-option" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', cursor: 'pointer' }}>
                 <input 
                   type="radio" 
                   name="subscription" 
                   checked={subscriptionMode === 'once'} 
                   onChange={() => setSubscriptionMode('once')}
                 />
                 <span style={{ fontWeight: subscriptionMode === 'once' ? '600' : '400' }}>Mua 1 lần</span>
               </label>
               
               <label className="sub-option" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', cursor: 'pointer' }}>
                 <input 
                   type="radio" 
                   name="subscription" 
                   checked={subscriptionMode === 'monthly'} 
                   onChange={() => setSubscriptionMode('monthly')}
                 />
                 <div>
                   <span style={{ fontWeight: subscriptionMode === 'monthly' ? '600' : '400', display: 'block' }}>Đăng ký định kỳ (Mỗi tháng)</span>
                   <span style={{ fontSize: '0.85rem', color: '#ec407a', fontWeight: 'bold' }}>Tiết kiệm 10% + Freeship</span>
                 </div>
               </label>
            </div>



            <div className="actions" style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="add-to-cart-btn" 
                onClick={handleAddToCartClick}
                disabled={isOutOfStock}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: isOutOfStock ? '#e5e7eb' : '#fff',
                  border: `2px solid ${isOutOfStock ? '#9ca3af' : '#d97706'}`,
                  color: isOutOfStock ? '#9ca3af' : '#d97706',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  fontSize: '1rem'
                }}
              >
                <i className="fa-solid fa-cart-plus"></i> Thêm vào giỏ
              </button>
              <button 
                className="buy-now-btn" 
                onClick={handleBuyNowClick}
                disabled={isOutOfStock}
                style={{
                   flex: 1,
                   padding: '12px',
                   background: isOutOfStock ? '#9ca3af' : '#d97706',
                   border: 'none',
                   color: '#fff',
                   borderRadius: '8px',
                   fontWeight: 'bold',
                   cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                   fontSize: '1rem'
                }}
              >
                {subscriptionMode === 'monthly' ? "ĐĂNG KÝ NGAY" : (isOutOfStock ? "HẾT HÀNG" : "MUA NGAY")}
              </button>
            </div>

            {/* Paper Note Style Description */}
            <div className="paper-note">
              <div className="paper-content">
                <h3>Mô tả sản phẩm</h3>
                <p>{product.description}</p>
                {product.isBundle && product.bundleItems?.length > 0 && (
                  <div className="bundle-includes">
                    <strong>Set bao gồm:</strong>
                    <ul>
                      {product.bundleItems.map((item, idx) => (
                        <li key={idx}>
                          {item.quantity}x {item.product?.name || "Sản phẩm"}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ProductReviews productId={product._id} user={user} />

        {/* Bundle Modal */}
        <BundleModal 
          product={product} 
          isOpen={isBundleModalOpen} 
          onClose={() => setIsBundleModalOpen(false)}
          onAddToCart={handleBundleAddToCart}
        />
      </div>
    </div>
  );
};

export default ProductDetailPage;

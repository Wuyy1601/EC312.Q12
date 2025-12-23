import React, { useRef, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import ProductCard from "@components/ProductCard";
import BundleModal from "@components/BundleModal";
import { useCart } from "../context/CartContext";
import "./HomePage.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const HomePage = () => {
  const navigate = useNavigate();
  const newArrivalsRef = useRef(null);
  const featuredRef = useRef(null);
  const { addToCart } = useCart();

  // Countdown timer - counts to end of day (midnight)
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeToMidnight = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0); // Set to next midnight
      
      const diff = midnight - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      return { hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeToMidnight());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeToMidnight());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Banner slider state
  const [bannerProducts, setBannerProducts] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Data state
  const [newArrivals, setNewArrivals] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products`);
        const data = await res.json();
        
        if (data.success) {
          const bundleProducts = data.data.filter(p => p.isBundle);
          
          setBannerProducts(bundleProducts.slice(0, 5)); // Top 5 for banner
          setNewArrivals(bundleProducts.slice(0, 10)); 
          setFeaturedProducts(bundleProducts);
        }
      } catch (error) {
        console.error("Fetch home data error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto slide banner every 4 seconds
  useEffect(() => {
    if (bannerProducts.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % bannerProducts.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [bannerProducts.length]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://placehold.co/1200x400/ff9a9e/ffffff?text=Gift+Box";
    if (imagePath.startsWith("http")) return imagePath;
    const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${API_URL}${path}`;
  };

  const nextBanner = () => {
    setCurrentBannerIndex(prev => (prev + 1) % bannerProducts.length);
  };

  const prevBanner = () => {
    setCurrentBannerIndex(prev => (prev - 1 + bannerProducts.length) % bannerProducts.length);
  };

  const [selectedProductForModal, setSelectedProductForModal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (product) => {
    if (product.isBundle) {
      setSelectedProductForModal(product);
      setIsModalOpen(true);
    } else {
      addToCart(product);
    }
  };

  const scroll = (direction, ref) => {
    const container = ref.current;
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const currentBannerProduct = bannerProducts[currentBannerIndex];

  return (
    <div className="homepage">
      {/* Hero Banner - Product Slider */}
      <section className="hero-banner-section">
        {bannerProducts.length > 0 && currentBannerProduct && (
          <div className="hero-banner">
            <button className="banner-nav-btn prev" onClick={prevBanner}>
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            
            <Link to={`/product/${currentBannerProduct._id}`} className="banner-content">
              <div className="banner-image-wrapper">
                <img 
                  src={getImageUrl(currentBannerProduct.image)} 
                  alt={currentBannerProduct.name}
                  className="banner-main-image"
                />
              </div>
              <div className="banner-info">
                <span className="banner-badge">🎁 Hot Bundle</span>
                <h2 className="banner-title">{currentBannerProduct.name}</h2>
                <p className="banner-desc">{currentBannerProduct.description?.substring(0, 100)}...</p>
                <div className="banner-price">
                  {new Intl.NumberFormat("vi-VN").format(currentBannerProduct.price)} VNĐ
                </div>
                <span className="banner-cta">Xem chi tiết →</span>
              </div>
            </Link>
            
            <button className="banner-nav-btn next" onClick={nextBanner}>
              <i className="fa-solid fa-chevron-right"></i>
            </button>
            
            {/* Dots indicator */}
            <div className="banner-dots">
              {bannerProducts.map((_, idx) => (
                <span 
                  key={idx} 
                  className={`dot ${idx === currentBannerIndex ? 'active' : ''}`}
                  onClick={() => setCurrentBannerIndex(idx)}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Flash Sale Section with Horizontal Scroll */}
      <section className="new-arrivals-section">
        <div className="container">
          <div className="section-header">
            <div className="section-title-group">
              <h2>Flash Sale</h2>
              <div className="countdown-timer">
                <div className="countdown-box">
                  <span className="countdown-value">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </span>
                </div>
                <span className="countdown-separator">:</span>
                <div className="countdown-box">
                  <span className="countdown-value">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </span>
                </div>
                <span className="countdown-separator">:</span>
                <div className="countdown-box">
                  <span className="countdown-value">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>
            <div className="scroll-controls">
              <button
                className="scroll-btn"
                onClick={() => scroll("left", newArrivalsRef)}
              >
                <i className="fa-solid fa-chevron-left" style={{ color: "#333", fontSize: "20px" }}></i>
              </button>
              <button
                className="scroll-btn"
                onClick={() => scroll("right", newArrivalsRef)}
              >
                <i className="fa-solid fa-chevron-right" style={{ color: "#333", fontSize: "20px" }}></i>
              </button>
            </div>
          </div>
          <div className="products-scroll-container" ref={newArrivalsRef}>
            {newArrivals.map((product) => {
              // Calculate actual discount percentage, default to 30% for flash sale
              const discountPercent = product.comparePrice && product.comparePrice > product.price
                ? Math.round((1 - product.price / product.comparePrice) * 100)
                : 30; // Default 30% discount for flash sale items
              return (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  type="flash-sale"
                  showDiscount={true}
                  discountPercent={discountPercent}
                  onAddToCart={handleOpenModal}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products Section with Horizontal Scroll */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2>Sản phẩm nổi bật</h2>
            <div className="scroll-controls">
              <button
                className="scroll-btn"
                onClick={() => scroll("left", featuredRef)}
              >
                <i className="fa-solid fa-chevron-left" style={{ color: "#333", fontSize: "20px" }}></i>
              </button>
              <button
                className="scroll-btn"
                onClick={() => scroll("right", featuredRef)}
              >
                <i className="fa-solid fa-chevron-right" style={{ color: "#333", fontSize: "20px" }}></i>
              </button>
            </div>
          </div>
          <div className="products-scroll-container" ref={featuredRef}>
            {featuredProducts.map((product) => (
              <ProductCard
                key={product._id || product.id}
                product={product}
                type="featured"
                showDiscount={false}
                onAddToCart={handleOpenModal}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Bundle Modal */}
      <BundleModal 
        product={selectedProductForModal} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onAddToCart={addToCart}
      />
    </div>
  );
};

export default HomePage;

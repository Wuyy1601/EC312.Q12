import React, { useRef, useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ProductCard from "@components/ProductCard";
import BundleModal from "@components/BundleModal";
import { useCart } from "../context/CartContext";
import "./HomePage.css";

const HomePage = () => {
  const newArrivalsRef = useRef(null);
  const featuredRef = useRef(null);
  const { addToCart } = useCart();

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              // Reset to 24 hours when countdown ends
              hours = 23;
              minutes = 59;
              seconds = 59;
            }
          }
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);





  // Sample data for banner
  const bannerImages = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=800&q=80",
      alt: "Winter Gift Collection",
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
      alt: "New Arrivals",
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80",
      alt: "Romantic Gifts",
    },
  ];

  // API URL
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

  // Data state
  const [newArrivals, setNewArrivals] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Products
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products, sort by date for new arrivals, and maybe featured flag for featured
        const res = await fetch(`${API_URL}/api/products`);
        const data = await res.json();
        
        if (data.success) {
          // Mock logic: Newest 7 for Flash Sale, others for Featured
          // In real world, use query params limit/sort
          // Filter ONLY bundles as requested
          const bundleProducts = data.data.filter(p => p.isBundle);
          
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





  const [selectedProductForModal, setSelectedProductForModal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (product) => {
    if (product.isBundle) {
      setSelectedProductForModal(product);
      setIsModalOpen(true);
    } else {
      // Direct add to cart
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

  return (
    <div className="homepage">
      {/* Banner Section */}
      <section className="banner-section">
        <div className="banner-container">
          {bannerImages.map((banner) => (
            <div key={banner.id} className="banner-item">
              <img src={banner.image} alt={banner.alt} />
            </div>
          ))}
        </div>
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
            {newArrivals.map((product) => (
              <ProductCard
                key={product._id || product.id}
                product={product}
                type="flash-sale"
                showDiscount={true}
                discountPercent={50}
                onAddToCart={handleOpenModal}
              />
            ))}
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

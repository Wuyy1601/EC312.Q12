import React, { useRef, useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ProductCard from "@components/ProductCard";
import BundleModal from "@components/BundleModal";
import "./HomePage.css";

const HomePage = () => {
  const newArrivalsRef = useRef(null);
  const featuredRef = useRef(null);

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



  // Placeholder categories
  // For now keeping static as requested but moved inside component
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/api/categories`);
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Fallback or empty
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId) => {
    navigate(`/products?category=${categoryId}`);
  };

  // Sample data for banner
  const bannerImages = [
    {
      id: 1,
      image: "https://via.placeholder.com/400x250/E8B4D9/FFFFFF?text=Banner+1",
      alt: "Banner 1",
    },
    {
      id: 2,
      image: "https://via.placeholder.com/400x250/D4A5C7/FFFFFF?text=Banner+2",
      alt: "Banner 2",
    },
    {
      id: 3,
      image: "https://via.placeholder.com/400x250/C896B8/FFFFFF?text=Banner+3",
      alt: "Banner 3",
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

  const addToCart = (productToAdd) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    
    // Check for existing item
    const existingItem = productToAdd.isBundle 
      ? null // Always add new line for bundles with potentially different options
      : cart.find((item) => (item.id === productToAdd._id || item.id === productToAdd.id));
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: productToAdd._id || productToAdd.id,
        name: productToAdd.name,
        price: productToAdd.price,
        image: productToAdd.primaryImage || productToAdd.image || "https://via.placeholder.com/150",
        quantity: 1,
        isBundle: productToAdd.isBundle,
        selectedItems: productToAdd.selectedItems,
        bundleDescription: productToAdd.bundleDescription,
      });
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));
    
    if (isModalOpen) {
      setIsModalOpen(false);
      alert("Đã thêm Bundle vào giỏ hàng!");
    } else {
      alert("Đã thêm sản phẩm vào giỏ hàng!");
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

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <div className="categories-grid">
            {categories.map((category) => (
              <div 
                key={category._id || category.id} 
                className="category-item" 
                onClick={() => handleCategoryClick(category._id)}
                style={{ cursor: "pointer" }}
              >
                <img src={category.image} alt={category.name} />
                <p>{category.name}</p>
              </div>
            ))}
          </div>
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

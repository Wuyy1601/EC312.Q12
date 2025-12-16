import React, { useRef, useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ProductCard from "@components/ProductCard";
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

  // Sample data for categories
  const categories = [
    {
      id: 1,
      name: "Gấu bông",
      image: "https://via.placeholder.com/80/FFB6C1/FFFFFF?text=Gau",
    },
    {
      id: 2,
      name: "Hoa",
      image: "https://via.placeholder.com/80/FFB6C1/FFFFFF?text=Hoa",
    },
    {
      id: 3,
      name: "Quà tặng",
      image: "https://via.placeholder.com/80/FFB6C1/FFFFFF?text=Qua",
    },
    {
      id: 4,
      name: "Chocolate",
      image: "https://via.placeholder.com/80/FFB6C1/FFFFFF?text=Choco",
    },
    {
      id: 5,
      name: "Trang sức",
      image: "https://via.placeholder.com/80/FFB6C1/FFFFFF?text=Trang+suc",
    },
    {
      id: 6,
      name: "Khác",
      image: "https://via.placeholder.com/80/FFB6C1/FFFFFF?text=Khac",
    },
    {
      id: 7,
      name: "Combo",
      image: "https://via.placeholder.com/80/FFB6C1/FFFFFF?text=Combo",
    },
  ];

  // Sample data for new arrivals
  const newArrivals = [
    {
      id: 1,
      name: "Set quà tặng Valentine",
      price: 599000,
      image: "https://via.placeholder.com/250/E8B4D9/FFFFFF?text=Product+1",
    },
    {
      id: 2,
      name: "Set quà tặng Valentine",
      price: 599000,
      image: "https://via.placeholder.com/250/D4A5C7/FFFFFF?text=Product+2",
    },
    {
      id: 3,
      name: "Set quà tặng Valentine",
      price: 599000,
      image: "https://via.placeholder.com/250/E8B4D9/FFFFFF?text=Product+3",
    },
    {
      id: 4,
      name: "Set quà tặng Valentine",
      price: 599000,
      image: "https://via.placeholder.com/250/D4A5C7/FFFFFF?text=Product+4",
    },
    {
      id: 5,
      name: "Set quà tặng Valentine",
      price: 599000,
      image: "https://via.placeholder.com/250/E8B4D9/FFFFFF?text=Product+5",
    },
    {
      id: 6,
      name: "Set quà tặng Valentine",
      price: 599000,
      image: "https://via.placeholder.com/250/D4A5C7/FFFFFF?text=Product+6",
    },
    {
      id: 7,
      name: "Set quà tặng Valentine",
      price: 599000,
      image: "https://via.placeholder.com/250/E8B4D9/FFFFFF?text=Product+7",
    },
  ];

  // Sample data for featured products
  const featuredProducts = [
    {
      id: 1,
      name: "Combo quà Giáng Sinh",
      price: 1200000,
      image: "https://via.placeholder.com/250/E8B4D9/FFFFFF?text=Featured+1",
    },
    {
      id: 2,
      name: "Hoa hồng cao cấp",
      price: 850000,
      image: "https://via.placeholder.com/250/D4A5C7/FFFFFF?text=Featured+2",
    },
    {
      id: 3,
      name: "Set quà Noel",
      price: 950000,
      image: "https://via.placeholder.com/250/E8B4D9/FFFFFF?text=Featured+3",
    },
    {
      id: 4,
      name: "Gấu bông cao cấp",
      price: 750000,
      image: "https://via.placeholder.com/250/D4A5C7/FFFFFF?text=Featured+4",
    },
    {
      id: 5,
      name: "Combo Valentine",
      price: 1100000,
      image: "https://via.placeholder.com/250/E8B4D9/FFFFFF?text=Featured+5",
    },
    {
      id: 6,
      name: "Set quà sinh nhật",
      price: 890000,
      image: "https://via.placeholder.com/250/D4A5C7/FFFFFF?text=Featured+6",
    },
    {
      id: 7,
      name: "Hộp quà đặc biệt",
      price: 1300000,
      image: "https://via.placeholder.com/250/E8B4D9/FFFFFF?text=Featured+7",
    },
    {
      id: 8,
      name: "Bó hoa tulip",
      price: 680000,
      image: "https://via.placeholder.com/250/D4A5C7/FFFFFF?text=Featured+8",
    },
    {
      id: 9,
      name: "Gấu bông khổng lồ",
      price: 1500000,
      image: "https://via.placeholder.com/250/E8B4D9/FFFFFF?text=Featured+9",
    },
    {
      id: 10,
      name: "Set quà công sở",
      price: 920000,
      image: "https://via.placeholder.com/250/D4A5C7/FFFFFF?text=Featured+10",
    },
  ];

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
              <div key={category.id} className="category-item">
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
                <FaChevronLeft />
              </button>
              <button
                className="scroll-btn"
                onClick={() => scroll("right", newArrivalsRef)}
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
          <div className="products-scroll-container" ref={newArrivalsRef}>
            {newArrivals.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                type="flash-sale"
                showDiscount={true}
                discountPercent={50}
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
                <FaChevronLeft />
              </button>
              <button
                className="scroll-btn"
                onClick={() => scroll("right", featuredRef)}
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
          <div className="products-scroll-container" ref={featuredRef}>
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                type="featured"
                showDiscount={false}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

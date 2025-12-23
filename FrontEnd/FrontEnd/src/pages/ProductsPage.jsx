import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ProductCard from "@components/ProductCard";
import BundleModal from "@components/BundleModal";
import { useCart } from "../context/CartContext";
import "./ProductsPage.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const ProductsPage = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    rating: 0,
    search: "",
  });
  const [sort, setSort] = useState("newest");
  const [categories, setCategories] = useState([]);
  
  // Modal State & Logic
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




  const location = useLocation();

  // Initialize filters from URL query on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get("category");
    const searchParam = params.get("q") || params.get("search");

    setFilters(prev => ({
      ...prev,
      category: categoryParam || "",
      search: searchParam || ""
    }));
  }, [location.search]);

  // Fetch Categories for Filter
  useEffect(() => {
    const fetchCategories = async () => {
       try {
         const res = await fetch(`${API_URL}/api/categories`); 
         const data = await res.json();
         if(data.success) setCategories(data.data);
       } catch(e) { console.error(e); }
    };
    fetchCategories();
  }, []);

  // Fetch Products
  useEffect(() => {
    fetchProducts();
  }, [filters, sort]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append("category", filters.category);
      if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
      if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);
      
      const res = await fetch(`${API_URL}/api/products?${queryParams.toString()}`);
      const data = await res.json();
      
      if (data.success) {
        let sortedProducts = data.data.filter(p => p.isBundle); // Filter ONLY bundles
        
        // Client-side Search Filtering
        if (filters.search) {
           const lowerSearch = filters.search.toLowerCase().trim();
           sortedProducts = sortedProducts.filter(p => 
             p.name.toLowerCase().includes(lowerSearch) || 
             (p.description && p.description.toLowerCase().includes(lowerSearch))
           );
        }

        // Client-side Filtering
        // Filter by Rating
        if (filters.rating > 0) {
           sortedProducts = sortedProducts.filter(p => (p.rating || 0) >= filters.rating);
        }

        // Client-side Sorting
        if (sort === "price-asc") sortedProducts.sort((a, b) => a.price - b.price);
        if (sort === "price-desc") sortedProducts.sort((a, b) => b.price - a.price);
        
        setProducts(sortedProducts);
      }
    } catch (error) {
      console.error("Fetch products error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilter = () => {
    fetchProducts();
  };

  const handleClearFilter = () => {
    setFilters({
      category: "",
      minPrice: "",
      maxPrice: "",
      rating: 0,
      search: "",
    });
  };

  return (
    <div className="products-page">
      <div className="container">
        <div className="products-layout">
          {/* Sidebar Filters */}
          <aside className="products-sidebar">
            <div className="filter-header">
              <i className="fa-solid fa-filter"></i> <h3>Bộ lọc tìm kiếm</h3>
            </div>
            
            {/* Category Filter */}
            <div className="filter-group">
              <h4>Danh mục</h4>
              <div className="checkbox-list">
                {categories.length > 0 ? categories.map(cat => (
                  <label key={cat._id} className="checkbox-item">
                    <input 
                      type="checkbox" 
                      checked={filters.category === cat._id}
                      onChange={() => handleFilterChange("category", filters.category === cat._id ? "" : cat._id)}
                    />
                    <span>{cat.name}</span>
                  </label>
                )) : (
                  <p>Đang tải danh mục...</p>
                )}
              </div>
            </div>

            {/* Price Filter */}
            <div className="filter-group">
              <h4>Khoảng giá</h4>
              <div className="price-inputs">
                <input 
                  type="number" 
                  placeholder="Từ" 
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                />
                <span>đến</span>
                <input 
                  type="number" 
                  placeholder="Đến" 
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                />
              </div>
            </div>

            {/* Rating Filter (Mock UI) */}
            <div className="filter-group">
              <h4>Đánh giá</h4>
              <div className="rating-list">
                {[5, 4, 3, 2, 1].map(star => (
                  <label key={star} className="rating-item">
                     <input 
                       type="checkbox" 
                       checked={filters.rating === star}
                       onChange={() => handleFilterChange("rating", filters.rating === star ? 0 : star)}
                     />
                     <div className="stars">
                       {[...Array(5)].map((_, i) => (
                         <i key={i} className={i < star ? "fa-solid fa-star star-gold" : "fa-solid fa-star star-gray"}></i>
                       ))}
                     </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-actions">
              <button className="apply-btn" onClick={handleApplyFilter}>ÁP DỤNG BỘ LỌC</button>
              <button className="clear-btn" onClick={handleClearFilter}>XÓA TẤT CẢ</button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="products-main">
            <div className="products-header">
              <div className="sort-control">
                <span>Sắp xếp:</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="newest">Mới nhất</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                  <option value="best-seller">Bán chạy</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="loading-grid">Đang tải sản phẩm...</div>
            ) : products.length === 0 ? (
              <div className="no-products">Không tìm thấy sản phẩm nào</div>
            ) : (
              <div className="products-grid">
                {products.map(product => (
                  <ProductCard 
                    key={product._id} 
                    product={product} 
                    onAddToCart={handleOpenModal}
                  />
                ))}
              </div>
            )}
            
            {/* Pagination Mock */}
            <div className="pagination">
               <button className="page-btn active">1</button>
               <button className="page-btn">2</button>
               <button className="page-btn">Next</button>
            </div>
          </main>
        </div>
      </div>
      <BundleModal 
        product={selectedProductForModal} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onAddToCart={addToCart}
      />
    </div>
  );
};

export default ProductsPage;

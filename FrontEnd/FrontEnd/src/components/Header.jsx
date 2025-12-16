import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaShoppingCart, FaUser } from "react-icons/fa";
import SearchBar from "./SearchBar";
import "./Header.css";

const Header = () => {
  const location = useLocation();
  const isCartPage = location.pathname === "/cart";

  const handleSearch = (query) => {
    console.log("Search:", query);
    // Handle search functionality
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <img src="/logo.png" alt="Giftnity Logo" className="logo-img" />
          <span className="logo-text">Giftnity</span>
          {isCartPage && <span className="page-title">| Giỏ hàng</span>}
        </Link>

        <SearchBar onSearch={handleSearch} />

        <div className="header-icons">
          <Link to="/cart" className="icon-link">
            <FaShoppingCart className="icon" />
          </Link>
          <Link to="/profile" className="icon-link">
            <FaUser className="icon" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;

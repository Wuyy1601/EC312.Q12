import React, { useState, useEffect } from 'react';
import { FaTimes, FaCheck } from 'react-icons/fa';
import './BundleModal.css';

const BundleModal = ({ product, isOpen, onClose, onAddToCart }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(0);

  useEffect(() => {
    if (product && product.bundleItems) {
      // Default select all items
      const allItemIds = product.bundleItems.map(item => item.product._id);
      setSelectedItems(allItemIds);
      setCurrentPrice(product.price);
    }
  }, [product, isOpen]);

  const handleToggleItem = (itemId, itemPrice, quantity) => {
    // If checking would result in less than 2 items, prevent unchecking
    if (selectedItems.length <= 2 && selectedItems.includes(itemId)) {
      alert("Bundle phải có ít nhất 2 sản phẩm!");
      return;
    }

    let newSelected;
    let newPrice = currentPrice;

    if (selectedItems.includes(itemId)) {
      // Uncheck: Remove item and subtract price
      newSelected = selectedItems.filter(id => id !== itemId);
      newPrice -= (itemPrice * quantity);
    } else {
      // Check: Add item and add price
      newSelected = [...selectedItems, itemId];
      newPrice += (itemPrice * quantity);
    }

    setSelectedItems(newSelected);
    setCurrentPrice(newPrice);
  };

  const handleConfirm = () => {
    // Create custom bundle object needed for cart
    const customBundle = {
      ...product,
      price: currentPrice, // Override price with calculated one
      selectedItems: selectedItems, // Track which IDs are active
      // Create a description of what's inside
      bundleDescription: product.bundleItems
        .filter(item => selectedItems.includes(item.product._id))
        .map(item => `${item.quantity}x ${item.product.name}`)
        .join(", ")
    };
    
    onAddToCart(customBundle);
  };

  if (!isOpen) return null;

  return (
    <div className="bundle-modal-overlay">
      <div className="bundle-modal">
        <button className="close-modal" onClick={onClose}>
          <i className="fa-solid fa-xmark" style={{ fontSize: "20px", color: "#666" }}></i>
        </button>
        
        <div className="bundle-header">
          <h2>Tùy chỉnh Bundle</h2>
          <p>Chọn các sản phẩm bạn muốn có trong set quà này</p>
        </div>

        <div className="bundle-items-list">
          {product.bundleItems.map((item) => {
            const subProduct = item.product;
            const isSelected = selectedItems.includes(subProduct._id);
            
            return (
              <div 
                key={subProduct._id} 
                className={`bundle-item-row ${isSelected ? 'selected' : ''}`}
                onClick={() => handleToggleItem(subProduct._id, subProduct.price, item.quantity)}
              >
                <div className="checkbox-custom">
                  {isSelected && <i className="fa-solid fa-check"></i>}
                </div>
                
                <img src={subProduct.image} alt={subProduct.name} className="item-thumb" />
                
                <div className="item-details">
                  <h4>{subProduct.name}</h4>
                  <p className="item-qty">Số lượng: {item.quantity}</p>
                </div>
                
                <div className="item-price">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subProduct.price * item.quantity)}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="bundle-footer">
          <div className="total-price-section">
            <span>Tổng cộng:</span>
            <span className="final-price">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentPrice)}
            </span>
          </div>
          
          <button className="confirm-bundle-btn" onClick={handleConfirm}>
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default BundleModal;

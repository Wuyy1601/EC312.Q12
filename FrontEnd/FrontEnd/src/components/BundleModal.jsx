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
    // If checking would result in less than 1 item, prevent unchecking
    if (selectedItems.length <= 1 && selectedItems.includes(itemId)) {
      alert("Phải chọn ít nhất 1 sản phẩm!");
      return;
    }

    let newSelected;
    
    if (selectedItems.includes(itemId)) {
      // Uncheck
      newSelected = selectedItems.filter(id => id !== itemId);
    } else {
      // Check
      newSelected = [...selectedItems, itemId];
    }

    // Recalculate Price
    // Logic: If Full Bundle -> Product Price (Discount). Else -> Sum of Components.
    const allIds = product.bundleItems.map(i => i.product._id);
    const isFullBundle = allIds.length === newSelected.length && allIds.every(id => newSelected.includes(id));
    
    let newPrice = 0;
    if (isFullBundle) {
       newPrice = product.price;
    } else {
       // Sum of selected components (Original Price)
       newPrice = product.bundleItems
         .filter(item => newSelected.includes(item.product._id))
         .reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
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
                
                <img 
                  src={
                    subProduct.image 
                      ? (subProduct.image.startsWith('http') ? subProduct.image : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${subProduct.image}`)
                      : "https://placehold.co/100x100?text=No+Image"
                  } 
                  alt={subProduct.name} 
                  className="item-thumb" 
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src="https://placehold.co/100x100?text=No+Image";
                  }}
                />
                
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

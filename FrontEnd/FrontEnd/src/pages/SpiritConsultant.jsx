import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./SpiritConsultant.css";

// Import tinh linh images
import LOVE from "@assets/TinhLinh/LOVE.png";
import JOY from "@assets/TinhLinh/JOY.png";
import CARE from "@assets/TinhLinh/CARE.png";
import GRATITUDE from "@assets/TinhLinh/GRATITUDE.png";
import KINDNESS from "@assets/TinhLinh/KINDNESS.png";
import COURAGE from "@assets/TinhLinh/COURAGE.png";
import PEACE from "@assets/TinhLinh/PEACE.png";
import WISDOM from "@assets/TinhLinh/WISDOM.png";
import MAGIC from "@assets/TinhLinh/MAGIC.png";
import WONDER from "@assets/TinhLinh/WONDER.png";

const spiritImages = {
  love: LOVE,
  joy: JOY,
  care: CARE,
  gratitude: GRATITUDE,
  kindness: KINDNESS,
  courage: COURAGE,
  peace: PEACE,
  wisdom: WISDOM,
  magic: MAGIC,
  wonder: WONDER,
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const SpiritConsultant = () => {
  const navigate = useNavigate();
  const chatEndRef = useRef(null);
  
  // States
  const [phase, setPhase] = useState(1); // 1: Select Spirit, 2: Chat with products
  const [spirits, setSpirits] = useState([]);
  const [selectedSpirit, setSelectedSpirit] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch spirits on mount
  useEffect(() => {
    fetchSpirits();
  }, []);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const fetchSpirits = async () => {
    try {
      const res = await fetch(`${API_URL}/api/spirit/list`);
      const data = await res.json();
      if (data.success) {
        setSpirits(data.data);
      }
    } catch (error) {
      console.error("Fetch spirits error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSpirit = (spirit) => {
    setSelectedSpirit(spirit);
    setMessages([
      {
        role: "spirit",
        content: spirit.greeting,
      },
    ]);
    setPhase(2);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsTyping(true);

    try {
      const res = await fetch(`${API_URL}/api/spirit/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spiritId: selectedSpirit.id,
          message: userMessage,
          chatHistory: messages,
        }),
      });
      const data = await res.json();

      if (data.success) {
        // Add spirit message
        const newMessage = { 
          role: "spirit", 
          content: data.data.message,
          // Include recommended products in message
          products: data.data.recommendedProducts || []
        };
        setMessages((prev) => [...prev, newMessage]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "spirit",
          content: `${selectedSpirit.emoji} Hmm, mình cần nghĩ thêm chút... Cậu có thể kể thêm được không?`,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://placehold.co/300x200/ff9a9e/ffffff?text=Gift+Box";
    if (imagePath.startsWith("http")) return imagePath;
    // Remove leading slash if present to avoid double slashes
    const cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
    return `${API_URL}/${cleanPath}`;
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading && phase === 1) {
    return (
      <div className="spirit-consultant-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="spirit-consultant-page">
      <div className="spirit-container">
        {/* Header */}
        <div className="spirit-header">
          <h1>✨ Tinh Linh Tư Vấn ✨</h1>
          <p>Chọn tinh linh đại diện cho cảm xúc bạn muốn gửi gắm vào món quà</p>
        </div>

        {/* Phase Indicator - Only 2 steps now */}
        <div className="phase-indicator">
          <div className={`phase-dot ${phase >= 1 ? "active" : ""} ${phase > 1 ? "completed" : ""}`}>
            1
          </div>
          <div className={`phase-dot ${phase >= 2 ? "active" : ""}`}>
            2
          </div>
        </div>

        {/* Phase 1: Spirit Selection */}
        {phase === 1 && (
          <div className="spirit-grid">
            {spirits.map((spirit) => (
              <div
                key={spirit.id}
                className={`spirit-card ${selectedSpirit?.id === spirit.id ? "selected" : ""}`}
                style={{ "--spirit-color": spirit.color }}
                onClick={() => handleSelectSpirit(spirit)}
              >
                <div className="spirit-image-wrapper">
                  <img
                    src={spiritImages[spirit.id]}
                    alt={spirit.name}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
                <div className="spirit-info-wrapper">
                  <div className="spirit-emoji">{spirit.emoji}</div>
                  <div className="spirit-name">{spirit.name}</div>
                  <div className="spirit-desc">{spirit.description}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Phase 2: Chat */}
        {phase === 2 && selectedSpirit && (
          <>
            <button className="back-btn" onClick={() => setPhase(1)}>
              <i className="fa-solid fa-arrow-left"></i> Chọn tinh linh khác
            </button>

            <div className="chat-container">
              <div className="chat-box" style={{ "--spirit-color": selectedSpirit.color }}>
                <div className="chat-header">
                  <div className="chat-avatar">
                    <img src={spiritImages[selectedSpirit.id]} alt={selectedSpirit.name} />
                  </div>
                  <div className="chat-spirit-info">
                    <h3>
                      {selectedSpirit.emoji} {selectedSpirit.name}
                    </h3>
                    <p>Tinh linh đang online</p>
                  </div>
                </div>

                <div className="chat-messages">
                  {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.role}`}>
                      <div className="message-content">{msg.content}</div>
                      {/* NEW: Render product cards in chat */}
                      {msg.products && msg.products.length > 0 && (
                        <div className="chat-products">
                          {msg.products.map((product) => (
                            <div 
                              key={product._id} 
                              className="chat-product-card"
                              onClick={() => navigate(`/product/${product._id}`)}
                            >
                              <img 
                                src={getImageUrl(product.image)} 
                                alt={product.name}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://placehold.co/80x80/ff9a9e/fff?text=Gift";
                                }}
                              />
                              <div className="chat-product-info">
                                <span className="chat-product-name">{product.name}</span>
                                <span className="chat-product-price">{formatPrice(product.price)}</span>
                              </div>
                              <span className="chat-product-btn-text">Xem →</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="message spirit">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="chat-input-area">
                  <input
                    type="text"
                    className="chat-input"
                    placeholder="Nhập tin nhắn..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isTyping}
                  />
                  <button
                    className="send-btn"
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                  >
                    <i className="fa-solid fa-paper-plane"></i>
                  </button>
                </div>
              </div>

              <div className="spirit-profile-card">
                <div className="spirit-image-wrapper">
                  <img src={spiritImages[selectedSpirit.id]} alt={selectedSpirit.name} />
                </div>
                <h3>
                  {selectedSpirit.emoji} {selectedSpirit.name}
                </h3>
                <p>{selectedSpirit.description}</p>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default SpiritConsultant;

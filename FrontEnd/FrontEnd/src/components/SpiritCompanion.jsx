import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes, FaPaperPlane, FaShoppingCart } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import BundleModal from "./BundleModal";
import "./SpiritCompanion.css";

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
  love: LOVE, joy: JOY, care: CARE, gratitude: GRATITUDE, kindness: KINDNESS,
  courage: COURAGE, peace: PEACE, wisdom: WISDOM, magic: MAGIC, wonder: WONDER,
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const SpiritCompanion = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const chatEndRef = useRef(null);

  // Widget states
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("spirits"); // spirits | chat | bundles
  
  // Spirit states
  const [spirits, setSpirits] = useState([]);
  const [selectedSpirit, setSelectedSpirit] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatAnalysis, setChatAnalysis] = useState(null); // Store analysis from chat
  
  // Bundle Modal
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    setMessages([{ role: "spirit", content: spirit.greeting }]);
    setActiveTab("chat");
    fetchBundles(spirit.id);
  };

  const fetchBundles = async (spiritId, analysis = null) => {
    try {
      // Build URL with analysis query params if available
      let url = `${API_URL}/api/spirit/${spiritId}/bundles`;
      if (analysis) {
        const params = new URLSearchParams();
        if (analysis.recipient) params.append('recipient', analysis.recipient);
        if (analysis.occasion) params.append('occasion', analysis.occasion);
        if (analysis.preferences?.length > 0) params.append('preferences', analysis.preferences.join(','));
        if (analysis.budget) params.append('budget', analysis.budget);
        if (params.toString()) url += `?${params.toString()}`;
      }
      
      console.log('🎁 Fetching bundles with URL:', url);
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setBundles(data.data.bundles);
        console.log('🎯 Bundles filtered:', data.data.filterApplied);
      }
    } catch (error) {
      console.error("Fetch bundles error:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping || !selectedSpirit) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
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
        setMessages((prev) => [...prev, { role: "spirit", content: data.data.message }]);
        
        // Save analysis and re-fetch bundles with updated filter
        if (data.data.analysis) {
          const newAnalysis = data.data.analysis;
          setChatAnalysis(newAnalysis);
          
          // Re-fetch bundles with new analysis to filter gifts
          if (newAnalysis.recipient || newAnalysis.occasion || newAnalysis.preferences?.length > 0 || newAnalysis.budget) {
            fetchBundles(selectedSpirit.id, newAnalysis);
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "spirit", content: `${selectedSpirit.emoji} Hãy xem những món quà mình gợi ý nhé~` },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAddBundle = (bundle, e) => {
    e.stopPropagation();
    setSelectedBundle(bundle);
    setIsModalOpen(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleWidget = () => {
    setIsOpen(!isOpen);
    if (!isOpen && !selectedSpirit) {
      setActiveTab("spirits");
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className={`spirit-floating-btn ${isOpen ? "active" : ""}`}
        onClick={toggleWidget}
        aria-label="Spirit Companion"
      >
        {selectedSpirit && !isOpen ? (
          <img src={spiritImages[selectedSpirit.id]} alt={selectedSpirit.name} className="spirit-btn-avatar" />
        ) : (
          <span className="spirit-btn-icon">{isOpen ? "✕" : "✨"}</span>
        )}
      </button>

      {/* Overlay */}
      <div 
        className={`spirit-widget-overlay ${isOpen ? "open" : ""}`} 
        onClick={() => setIsOpen(false)}
      />

      {/* Widget Popup */}
      <div className={`spirit-widget ${isOpen ? "open" : ""}`}>
        {/* Header */}
        <div className="spirit-widget-header">
          <div className="spirit-header-avatar">
            {selectedSpirit ? (
              <img src={spiritImages[selectedSpirit.id]} alt={selectedSpirit.name} />
            ) : (
              <span>✨</span>
            )}
          </div>
          <div className="spirit-header-info">
            <h3>{selectedSpirit ? `${selectedSpirit.emoji} ${selectedSpirit.name}` : "✨ Tinh Linh Tư Vấn"}</h3>
            <p>
              <span className="online-dot"></span>
              {selectedSpirit ? "Đang online" : "Chọn tinh linh để bắt đầu"}
            </p>
          </div>
          <button className="spirit-close-btn" onClick={() => setIsOpen(false)}>
            <FaTimes />
          </button>
        </div>

        {/* Tabs */}
        <div className="spirit-tabs">
          <button
            className={`spirit-tab ${activeTab === "spirits" ? "active" : ""}`}
            onClick={() => setActiveTab("spirits")}
          >
            🎭 Tinh Linh
          </button>
          <button
            className={`spirit-tab ${activeTab === "chat" ? "active" : ""}`}
            onClick={() => setActiveTab("chat")}
            disabled={!selectedSpirit}
          >
            💬 Chat
          </button>
          <button
            className={`spirit-tab ${activeTab === "bundles" ? "active" : ""}`}
            onClick={() => setActiveTab("bundles")}
            disabled={!selectedSpirit}
          >
            🎁 Quà
          </button>
        </div>

        {/* Content */}
        <div className="spirit-content">
          {/* Tab: Spirit Selection */}
          {activeTab === "spirits" && (
            loading ? (
              <div className="spirit-loading">
                <div className="spirit-spinner"></div>
              </div>
            ) : (
              <div className="spirit-select-grid">
                {spirits.map((spirit) => (
                  <div
                    key={spirit.id}
                    className={`spirit-select-card ${selectedSpirit?.id === spirit.id ? "selected" : ""}`}
                    onClick={() => handleSelectSpirit(spirit)}
                  >
                    <img src={spiritImages[spirit.id]} alt={spirit.name} className="spirit-select-img" />
                    <div className="spirit-select-emoji">{spirit.emoji}</div>
                    <p className="spirit-select-name">{spirit.name}</p>
                    <p className="spirit-select-desc">{spirit.description}</p>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Tab: Chat */}
          {activeTab === "chat" && (
            selectedSpirit ? (
              <div className="spirit-chat-messages">
                {messages.map((msg, index) => (
                  <div key={index} className={`spirit-message ${msg.role === "user" ? "user" : "bot"}`}>
                    {msg.content}
                  </div>
                ))}
                {isTyping && (
                  <div className="spirit-typing">
                    <span></span><span></span><span></span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            ) : (
              <div className="spirit-empty-state">
                <div className="emoji">🎭</div>
                <p>Chọn một tinh linh để bắt đầu chat</p>
              </div>
            )
          )}

          {/* Tab: Bundles */}
          {activeTab === "bundles" && (
            selectedSpirit ? (
              bundles.length > 0 ? (
                <div className="spirit-bundle-grid">
                  {bundles.map((bundle) => (
                    <div
                      key={bundle._id}
                      className="spirit-bundle-card"
                      onClick={() => navigate(`/product/${bundle._id}`)}
                    >
                      <img
                        src={bundle.image || "https://via.placeholder.com/80?text=Gift"}
                        alt={bundle.name}
                        className="spirit-bundle-img"
                      />
                      <div className="spirit-bundle-info">
                        <h4>{bundle.name}</h4>
                        {bundle.story && (
                          <p className="spirit-bundle-story">"{bundle.story}"</p>
                        )}
                        <div className="spirit-bundle-footer">
                          <span className="spirit-bundle-price">{formatPrice(bundle.price)}</span>
                          <button
                            className="spirit-bundle-add-btn"
                            onClick={(e) => handleAddBundle(bundle, e)}
                          >
                            <FaShoppingCart style={{ marginRight: 6 }} />
                            Thêm
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="spirit-empty-state">
                  <div className="emoji">📦</div>
                  <p>Đang tải quà gợi ý...</p>
                </div>
              )
            ) : (
              <div className="spirit-empty-state">
                <div className="emoji">🎁</div>
                <p>Chọn tinh linh để xem quà gợi ý</p>
              </div>
            )
          )}
        </div>

        {/* Chat Input (only in chat tab) */}
        {activeTab === "chat" && selectedSpirit && (
          <div className="spirit-chat-input-area">
            <input
              type="text"
              className="spirit-chat-input"
              placeholder="Nhập tin nhắn..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isTyping}
            />
            <button
              className="spirit-send-btn"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
            >
              <FaPaperPlane />
            </button>
          </div>
        )}
      </div>

      {/* Bundle Modal */}
      <BundleModal
        product={selectedBundle}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={addToCart}
      />
    </>
  );
};

export default SpiritCompanion;

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPaperPlane, FaShoppingCart, FaGift } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import BundleModal from "@components/BundleModal";
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
  const { addToCart } = useCart();
  const chatEndRef = useRef(null);

  // States
  const [phase, setPhase] = useState(1); // 1: Select Spirit, 2: Chat, 3: Bundles
  const [spirits, setSpirits] = useState([]);
  const [selectedSpirit, setSelectedSpirit] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Bundle Modal
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chatAnalysis, setChatAnalysis] = useState(null); // Store analysis from chat

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
        setMessages((prev) => [
          ...prev,
          { role: "spirit", content: data.data.message },
        ]);
        
        // Save analysis for filtering bundles
        if (data.data.analysis) {
          setChatAnalysis(data.data.analysis);
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "spirit",
          content: `${selectedSpirit.emoji} Mình hiểu rồi! Hãy xem những bundle mình gợi ý nhé~`,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleViewBundles = async () => {
    setLoading(true);
    try {
      // Build URL with analysis params
      let url = `${API_URL}/api/spirit/${selectedSpirit.id}/bundles`;
      if (chatAnalysis) {
        const params = new URLSearchParams();
        if (chatAnalysis.recipient) params.append('recipient', chatAnalysis.recipient);
        if (chatAnalysis.occasion) params.append('occasion', chatAnalysis.occasion);
        if (chatAnalysis.preferences?.length > 0) params.append('preferences', chatAnalysis.preferences.join(','));
        if (chatAnalysis.budget) params.append('budget', chatAnalysis.budget);
        if (params.toString()) url += `?${params.toString()}`;
      }
      
      console.log('🎁 Fetching bundles with URL:', url);
      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setBundles(data.data.bundles);
        setPhase(3);
      }
    } catch (error) {
      console.error("Fetch bundles error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBundle = (bundle) => {
    setSelectedBundle(bundle);
    setIsModalOpen(true);
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

        {/* Phase Indicator */}
        <div className="phase-indicator">
          <div className={`phase-dot ${phase >= 1 ? "active" : ""} ${phase > 1 ? "completed" : ""}`}>
            1
          </div>
          <div className={`phase-dot ${phase >= 2 ? "active" : ""} ${phase > 2 ? "completed" : ""}`}>
            2
          </div>
          <div className={`phase-dot ${phase >= 3 ? "active" : ""}`}>3</div>
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
              <FaArrowLeft /> Chọn tinh linh khác
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
                    <FaPaperPlane />
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
                <button className="view-bundles-btn" onClick={handleViewBundles}>
                  <FaGift style={{ marginRight: "8px" }} />
                  Xem quà gợi ý
                </button>
              </div>
            </div>
          </>
        )}

        {/* Phase 3: Bundle Recommendations */}
        {phase === 3 && (
          <>
            <button className="back-btn" onClick={() => setPhase(2)}>
              <FaArrowLeft /> Quay lại chat
            </button>

            <div className="bundles-section">
              <div className="bundles-header">
                <h2>
                  {selectedSpirit?.emoji} Quà được {selectedSpirit?.name} gợi ý
                </h2>
                <p>Những bundle phù hợp với cảm xúc bạn muốn gửi gắm</p>
              </div>

              {loading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                </div>
              ) : (
                <div className="bundles-grid">
                  {bundles.map((bundle) => (
                    <div key={bundle._id} className="bundle-card" onClick={() => navigate(`/product/${bundle._id}`)}>
                      <img
                        src={getImageUrl(bundle.image)}
                        alt={bundle.name}
                        className="bundle-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = MAGIC;
                        }}
                      />
                      <div className="bundle-info">
                        <h3>{bundle.name}</h3>
                        {bundle.story && (
                          <p className="bundle-story">"{bundle.story}"</p>
                        )}
                        <div className="bundle-price-row">
                          <span className="bundle-price">{formatPrice(bundle.price)}</span>
                          {bundle.originalPrice && (
                            <span className="bundle-original-price">
                              {formatPrice(bundle.originalPrice)}
                            </span>
                          )}
                        </div>
                        <button
                          className="add-bundle-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddBundle(bundle);
                          }}
                        >
                          <FaShoppingCart style={{ marginRight: "8px" }} />
                          Thêm vào giỏ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Bundle Modal */}
      <BundleModal
        product={selectedBundle}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={addToCart}
      />
    </div>
  );
};

export default SpiritConsultant;

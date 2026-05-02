import { FaGift, FaHeart } from "react-icons/fa";
import "./MessageCardPreview.css";

const OCCASION_EMOJI = {
  birthday: "🎂",
  anniversary: "💍",
  christmas: "🎄",
  newyear: "🎆",
  graduation: "🎓",
  other: "🎁",
};

const CARD_DESIGNS = {
  classic: {
    name: "Cổ điển",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    pattern: "none",
  },
  modern: {
    name: "Hiện đại",
    gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    pattern: "none",
  },
  romantic: {
    name: "Lãng mạn",
    gradient: "linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)",
    pattern: "hearts",
  },
  festive: {
    name: "Lễ hội",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    pattern: "confetti",
  },
};

const MessageCardPreview = ({ giftMessage, onDesignChange }) => {
  if (!giftMessage.enabled) return null;

  const design = CARD_DESIGNS[giftMessage.cardDesign || "classic"];
  const occasionEmoji = OCCASION_EMOJI[giftMessage.occasion] || "🎁";

  return (
    <div className="message-card-preview-wrapper">
      <h3>🎴 Xem trước thẻ lời chúc</h3>

      {/* Design Selector */}
      <div className="design-selector">
        <span>Chọn thiết kế:</span>
        <div className="design-options">
          {Object.entries(CARD_DESIGNS).map(([key, value]) => (
            <button
              key={key}
              className={`design-btn ${giftMessage.cardDesign === key ? "active" : ""}`}
              style={{ background: value.gradient }}
              onClick={() => onDesignChange && onDesignChange(key)}
              title={value.name}
            />
          ))}
        </div>
      </div>

      {/* Card Preview */}
      <div className="card-preview" style={{ background: design.gradient }}>
        {/* Pattern overlay */}
        {design.pattern === "hearts" && (
          <div className="pattern-overlay hearts">
            <FaHeart className="floating-heart h1" />
            <FaHeart className="floating-heart h2" />
            <FaHeart className="floating-heart h3" />
          </div>
        )}
        {design.pattern === "confetti" && (
          <div className="pattern-overlay confetti">
            <span className="confetti-piece c1">✨</span>
            <span className="confetti-piece c2">🎉</span>
            <span className="confetti-piece c3">⭐</span>
          </div>
        )}

        {/* Card Content */}
        <div className="card-content">
          {/* Header */}
          <div className="card-header">
            <span className="occasion-emoji">{occasionEmoji}</span>
            <FaGift className="gift-icon" />
          </div>

          {/* Recipient */}
          <div className="recipient-section">
            <span className="label">Gửi tặng</span>
            <h2 className="recipient-name">
              {giftMessage.recipientName || "..."}
            </h2>
          </div>

          {/* Message */}
          <div className="message-section">
            {giftMessage.message ? (
              <p className="message-text">{giftMessage.message}</p>
            ) : (
              <p className="message-placeholder">
                Lời chúc sẽ hiển thị ở đây...
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="card-footer">
            <span>with love 💝</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageCardPreview;

import { useState } from "react";
import { FaMagic, FaSpinner, FaCheck, FaGift } from "react-icons/fa";
import "./GiftMessageForm.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const RELATIONSHIPS = [
  { value: "friend", label: "Bạn bè" },
  { value: "lover", label: "Người yêu" },
  { value: "family", label: "👨‍👩Gia đình" },
  { value: "colleague", label: "Đồng nghiệp" },
  { value: "other", label: "Khác" },
];

const OCCASIONS = [
  { value: "birthday", label: "Sinh nhật" },
  { value: "anniversary", label: "Kỷ niệm" },
  { value: "christmas", label: "Giáng sinh" },
  { value: "newyear", label: "Năm mới" },
  { value: "graduation", label: "Tốt nghiệp" },
  { value: "other", label: "Khác" },
];

const GiftMessageForm = ({ giftMessage, setGiftMessage, onPreviewUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [greetingOptions, setGreetingOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [error, setError] = useState("");

  // Toggle bật/tắt thẻ lời chúc
  const handleToggle = () => {
    const newEnabled = !giftMessage.enabled;
    setGiftMessage({
      ...giftMessage,
      enabled: newEnabled,
    });
    if (!newEnabled) {
      setGreetingOptions([]);
      setSelectedOption(null);
    }
  };

  // Cập nhật field
  const handleChange = (field, value) => {
    const updated = { ...giftMessage, [field]: value };
    setGiftMessage(updated);
    if (onPreviewUpdate) onPreviewUpdate(updated);
  };

  // Gọi API tạo lời chúc AI
  const handleGenerateGreetings = async () => {
    if (!giftMessage.recipientName || !giftMessage.relationship || !giftMessage.occasion) {
      setError("Vui lòng điền đầy đủ thông tin trước khi tạo lời chúc");
      return;
    }

    setLoading(true);
    setError("");
    setGreetingOptions([]);

    try {
      const response = await fetch(`${API_URL}/api/orders/generate-greetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: giftMessage.recipientName,
          relationship: giftMessage.relationship,
          occasion: giftMessage.occasion,
        }),
      });

      const data = await response.json();

      if (data.success && data.greetings?.length >= 2) {
        setGreetingOptions(data.greetings);
        setSelectedOption(null);
      } else {
        setError(data.message || "Không thể tạo lời chúc");
      }
    } catch (err) {
      setError("Lỗi kết nối server");
      console.error("Generate greetings error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Chọn một lời chúc từ options
  const handleSelectGreeting = (index) => {
    setSelectedOption(index);
    handleChange("message", greetingOptions[index]);
  };

  return (
    <div className="gift-message-form">
      {/* Toggle Section */}
      <div className="gift-toggle" onClick={handleToggle}>
        <div className={`toggle-switch ${giftMessage.enabled ? "active" : ""}`}>
          <div className="toggle-knob"></div>
        </div>
        <span className="toggle-label">
          <FaGift className="gift-icon" />
          Thêm thẻ lời chúc tặng quà
        </span>
      </div>

      {/* Form Section - Hiện khi enabled */}
      {giftMessage.enabled && (
        <div className="gift-form-content">
          {/* Tên người nhận */}
          <div className="form-group">
            <label>Tên người nhận *</label>
            <input
              type="text"
              placeholder="VD: Minh, Bố, Anh Tuấn..."
              value={giftMessage.recipientName}
              onChange={(e) => handleChange("recipientName", e.target.value)}
            />
          </div>

          {/* Mối quan hệ */}
          <div className="form-row">
            <div className="form-group">
              <label>Mối quan hệ *</label>
              <select
                value={giftMessage.relationship}
                onChange={(e) => handleChange("relationship", e.target.value)}
              >
                <option value="">-- Chọn --</option>
                {RELATIONSHIPS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Dịp tặng quà */}
            <div className="form-group">
              <label>Dịp tặng quà *</label>
              <select
                value={giftMessage.occasion}
                onChange={(e) => handleChange("occasion", e.target.value)}
              >
                <option value="">-- Chọn --</option>
                {OCCASIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Nút tạo lời chúc AI */}
          <button
            type="button"
            className="generate-btn"
            onClick={handleGenerateGreetings}
            disabled={loading || !giftMessage.recipientName || !giftMessage.relationship || !giftMessage.occasion}
          >
            {loading ? (
              <>
                <FaSpinner className="spinner" /> Đang tạo...
              </>
            ) : (
              <>
                <FaMagic /> Tạo lời chúc AI
              </>
            )}
          </button>

          {/* Error message */}
          {error && <div className="error-msg">{error}</div>}

          {/* Greeting Options */}
          {greetingOptions.length > 0 && (
            <div className="greeting-options">
              <label>Chọn lời chúc:</label>
              {greetingOptions.map((greeting, index) => (
                <div
                  key={index}
                  className={`greeting-option ${selectedOption === index ? "selected" : ""}`}
                  onClick={() => handleSelectGreeting(index)}
                >
                  <div className="option-indicator">
                    {selectedOption === index ? <FaCheck /> : index + 1}
                  </div>
                  <p>{greeting}</p>
                </div>
              ))}
            </div>
          )}

          {/* Custom message textarea */}
          <div className="form-group message-group">
            <label>Lời chúc {greetingOptions.length > 0 ? "(có thể chỉnh sửa)" : ""}</label>
            <textarea
              placeholder="Nhập hoặc chỉnh sửa lời chúc của bạn..."
              value={giftMessage.message}
              onChange={(e) => handleChange("message", e.target.value)}
              rows={4}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftMessageForm;

import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaSearch, FaStar, FaSmile, FaMeh, FaFrown, FaExclamationTriangle, FaBrain, FaSync } from "react-icons/fa";
import "./AdminReviews.css";

const API_URL = "http://localhost:5001";

const SENTIMENT_CONFIG = {
  positive: { icon: FaSmile, color: "#22c55e", label: "Tích cực", bg: "#dcfce7" },
  neutral: { icon: FaMeh, color: "#f59e0b", label: "Trung lập", bg: "#fef3c7" },
  negative: { icon: FaFrown, color: "#ef4444", label: "Tiêu cực", bg: "#fee2e2" },
};

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [sentimentStats, setSentimentStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all, positive, neutral, negative, needs-attention
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/api/admin/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setReviews(data.data || []);
      setSentimentStats(data.sentimentStats || {});
    } catch (error) {
      console.error("Fetch reviews error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeOne = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/api/admin/reviews/${id}/analyze`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setReviews(reviews.map((r) => (r._id === id ? data.data : r)));
      }
    } catch (error) {
      console.error("Analyze error:", error);
    }
  };

  const handleBatchAnalyze = async () => {
    setAnalyzing(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/api/admin/reviews/batch-analyze`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchReviews();
      }
    } catch (error) {
      console.error("Batch analyze error:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa đánh giá này?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      await fetch(`${API_URL}/api/admin/reviews/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(reviews.filter((r) => r._id !== id));
    } catch (error) {
      console.error("Delete review error:", error);
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        setReviews(reviews.map((r) => (r._id === id ? data.data : r)));
        setEditingReview(null);
      }
    } catch (error) {
      console.error("Update review error:", error);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar key={i} style={{ color: i < rating ? "#ffc107" : "#e0e0e0" }} />
    ));
  };

  const renderSentimentBadge = (review) => {
    if (!review.sentiment) {
      return (
        <button className="analyze-btn" onClick={() => handleAnalyzeOne(review._id)}>
          <FaBrain /> Phân tích
        </button>
      );
    }

    const config = SENTIMENT_CONFIG[review.sentiment];
    const IconComponent = config?.icon || FaMeh;

    return (
      <div className="sentiment-badge" style={{ background: config?.bg, color: config?.color }}>
        <IconComponent />
        <span>{config?.label}</span>
        {review.needsAttention && (
          <FaExclamationTriangle className="attention-icon" title="Cần chú ý!" />
        )}
      </div>
    );
  };

  const filteredReviews = reviews.filter((r) => {
    const matchSearch =
      r.userInfo?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      r.comment?.toLowerCase().includes(search.toLowerCase()) ||
      r.product?.name?.toLowerCase().includes(search.toLowerCase());

    if (filter === "all") return matchSearch;
    if (filter === "needs-attention") return matchSearch && r.needsAttention;
    if (filter === "unanalyzed") return matchSearch && !r.sentiment;
    return matchSearch && r.sentiment === filter;
  });

  if (loading) return <div className="admin-loading">Đang tải...</div>;

  return (
    <div className="admin-reviews">
      <h1>⭐ Quản lý đánh giá & Phân tích cảm xúc</h1>

      {/* Sentiment Stats Cards */}
      <div className="sentiment-stats">
        <div className="stat-card positive" onClick={() => setFilter("positive")}>
          <FaSmile />
          <div className="stat-info">
            <span className="stat-value">{sentimentStats.positive || 0}</span>
            <span className="stat-label">Tích cực</span>
          </div>
        </div>
        <div className="stat-card neutral" onClick={() => setFilter("neutral")}>
          <FaMeh />
          <div className="stat-info">
            <span className="stat-value">{sentimentStats.neutral || 0}</span>
            <span className="stat-label">Trung lập</span>
          </div>
        </div>
        <div className="stat-card negative" onClick={() => setFilter("negative")}>
          <FaFrown />
          <div className="stat-info">
            <span className="stat-value">{sentimentStats.negative || 0}</span>
            <span className="stat-label">Tiêu cực</span>
          </div>
        </div>
        <div className="stat-card attention" onClick={() => setFilter("needs-attention")}>
          <FaExclamationTriangle />
          <div className="stat-info">
            <span className="stat-value">{sentimentStats.needsAttention || 0}</span>
            <span className="stat-label">Cần chú ý</span>
          </div>
        </div>
        <div className="stat-card unanalyzed" onClick={() => setFilter("unanalyzed")}>
          <FaBrain />
          <div className="stat-info">
            <span className="stat-value">{sentimentStats.unanalyzed || 0}</span>
            <span className="stat-label">Chưa phân tích</span>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Tìm kiếm đánh giá..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
          <option value="all">Tất cả</option>
          <option value="positive">😊 Tích cực</option>
          <option value="neutral">😐 Trung lập</option>
          <option value="negative">😞 Tiêu cực</option>
          <option value="needs-attention">⚠️ Cần chú ý</option>
          <option value="unanalyzed">🧠 Chưa phân tích</option>
        </select>
        <button 
          className="batch-analyze-btn" 
          onClick={handleBatchAnalyze}
          disabled={analyzing}
        >
          {analyzing ? <FaSync className="spin" /> : <FaBrain />}
          {analyzing ? "Đang phân tích..." : "Phân tích hàng loạt"}
        </button>
      </div>

      <table className="reviews-table">
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th>Người đánh giá</th>
            <th>Số sao</th>
            <th>Nội dung</th>
            <th>Cảm xúc</th>
            <th>Phân tích AI</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredReviews.map((review) => (
            <tr key={review._id} className={review.needsAttention ? "needs-attention-row" : ""}>
              <td>
                <div className="product-cell">
                  {review.product?.image && (
                    <img
                      src={`${API_URL}${review.product.image}`}
                      alt=""
                      className="product-thumb"
                    />
                  )}
                  <span>{review.product?.name || "Sản phẩm đã xóa"}</span>
                </div>
              </td>
              <td>{review.userInfo?.fullName || "Ẩn danh"}</td>
              <td className="stars">{renderStars(review.rating)}</td>
              <td className="comment-cell">
                <div className="comment-text">{review.comment}</div>
              </td>
              <td>{renderSentimentBadge(review)}</td>
              <td className="analysis-cell">
                {review.sentimentAnalysis ? (
                  <span className="analysis-text">{review.sentimentAnalysis}</span>
                ) : (
                  <span className="no-analysis">-</span>
                )}
              </td>
              <td className="actions">
                <button className="edit-btn" onClick={() => setEditingReview(review)}>
                  <FaEdit />
                </button>
                <button className="delete-btn" onClick={() => handleDelete(review._id)}>
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredReviews.length === 0 && (
        <div className="no-results">Không có đánh giá nào phù hợp</div>
      )}

      {/* Edit Modal */}
      {editingReview && (
        <div className="modal-overlay" onClick={() => setEditingReview(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Chỉnh sửa đánh giá</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleUpdate(editingReview._id, {
                  rating: Number(formData.get("rating")),
                  comment: formData.get("comment"),
                  needsAttention: formData.get("needsAttention") === "true",
                });
              }}
            >
              <div className="form-group">
                <label>Sản phẩm</label>
                <input value={editingReview.product?.name || "N/A"} disabled />
              </div>
              <div className="form-group">
                <label>Người đánh giá</label>
                <input value={editingReview.userInfo?.fullName || "N/A"} disabled />
              </div>
              <div className="form-group">
                <label>Số sao</label>
                <select name="rating" defaultValue={editingReview.rating}>
                  <option value="1">1 sao</option>
                  <option value="2">2 sao</option>
                  <option value="3">3 sao</option>
                  <option value="4">4 sao</option>
                  <option value="5">5 sao</option>
                </select>
              </div>
              <div className="form-group">
                <label>Nội dung</label>
                <textarea name="comment" defaultValue={editingReview.comment} rows={4} />
              </div>
              <div className="form-group">
                <label>Cần chú ý (CS cần can thiệp)</label>
                <select name="needsAttention" defaultValue={editingReview.needsAttention}>
                  <option value="false">Không</option>
                  <option value="true">Có</option>
                </select>
              </div>
              {editingReview.sentimentAnalysis && (
                <div className="form-group">
                  <label>Phân tích AI</label>
                  <input value={editingReview.sentimentAnalysis} disabled />
                </div>
              )}
              <div className="modal-actions">
                <button type="button" onClick={() => setEditingReview(null)}>Hủy</button>
                <button type="submit" className="save-btn">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;

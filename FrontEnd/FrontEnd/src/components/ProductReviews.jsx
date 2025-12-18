import React, { useState, useEffect } from 'react';
import { FaStar, FaUserCircle } from 'react-icons/fa';
import './ProductReviews.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const ProductReviews = ({ productId, user }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ totalReviews: 0, avgRating: 0 });
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hover, setHover] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/reviews/product/${productId}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.data);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Fetch reviews error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    if (!user) {
      alert("Vui lòng đăng nhập để đánh giá sản phẩm");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          rating,
          comment,
          userInfo: {
            fullName: user.username || user.email,
            avatar: user.avatar
          }
        })
      });

      const data = await res.json();
      
      if (data.success) {
        // Refresh reviews
        fetchReviews();
        setComment("");
        setRating(5);
        alert("Cảm ơn bạn đã đánh giá!");
      } else {
        alert(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Submit review error:", error);
      alert("Lỗi kết nối");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  return (
    <div className="product-reviews-container">
      <h3>Đánh giá khách hàng</h3>
      
      {/* Summary */}
      <div className="reviews-summary">
        <div className="average-rating">
          <span className="rating-number">{stats.avgRating}</span>
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <FaStar 
                key={i} 
                className={i < Math.round(stats.avgRating) ? "star-filled" : "star-empty"} 
              />
            ))}
          </div>
          <span className="total-count">({stats.totalReviews} đánh giá)</span>
        </div>
      </div>

      {/* Review Form */}
      {user ? (
        <form className="review-form" onSubmit={handleSubmit}>
          <h4>Viết đánh giá của bạn</h4>
          
          <div className="rating-input">
            <span className="label">Đánh giá chung:</span>
            <div className="stars-input">
              {[...Array(5)].map((_, i) => {
                const ratingValue = i + 1;
                return (
                  <label key={i}>
                    <input 
                      type="radio" 
                      name="rating" 
                      value={ratingValue} 
                      onClick={() => setRating(ratingValue)}
                    />
                    <FaStar 
                      className="star-icon" 
                      color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"} 
                      size={24}
                      onMouseEnter={() => setHover(ratingValue)}
                      onMouseLeave={() => setHover(null)}
                    />
                  </label>
                );
              })}
            </div>
          </div>

          <div className="comment-input">
            <span className="label">Nhận xét:</span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
              rows="4"
              required
            ></textarea>
          </div>

          <button type="submit" className="submit-review-btn" disabled={submitting}>
            {submitting ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </form>
      ) : (
        <div className="login-prompt">
          <p>Vui lòng <a href="/login">đăng nhập</a> để viết đánh giá.</p>
        </div>
      )}

      {/* Reviews List */}
      <div className="reviews-list">
        {loading ? (
          <div className="loading">Đang tải đánh giá...</div>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review._id} className="review-item">
              <div className="review-header">
                <div className="user-info">
                  {review.userInfo?.avatar ? (
                    <img src={review.userInfo.avatar} alt="Avatar" className="user-avatar" />
                  ) : (
                    <FaUserCircle className="default-avatar" />
                  )}
                  <div>
                    <span className="username">{review.userInfo?.fullName || "Khách hàng"}</span>
                    <div className="review-stars">
                      {[...Array(5)].map((_, i) => (
                        <FaStar 
                          key={i} 
                          className={i < review.rating ? "star-filled small" : "star-empty small"} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="review-date">{formatDate(review.createdAt)}</span>
              </div>
              <div className="review-content">
                <p>{review.comment}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="no-reviews">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!</p>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;

import React, { useState, useRef } from "react";
import { FaSearch, FaCamera, FaTimes, FaSpinner } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./SearchBar.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const SearchBar = ({ placeholder = "Tìm kiếm sản phẩm...", onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showVisualSearch, setShowVisualSearch] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleCameraClick = () => {
    setShowVisualSearch(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!previewImage) return;
    
    setAnalyzing(true);
    try {
      const res = await fetch(`${API_URL}/api/gemini/visual-search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: previewImage }),
      });
      const data = await res.json();
      
      if (data.success) {
        setAnalysisResult(data.data);
      } else {
        alert("Không thể phân tích hình ảnh. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Visual search error:", error);
      alert("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSearchFromAnalysis = (query) => {
    setShowVisualSearch(false);
    setPreviewImage(null);
    setAnalysisResult(null);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const closeVisualSearch = () => {
    setShowVisualSearch(false);
    setPreviewImage(null);
    setAnalysisResult(null);
  };

  return (
    <>
      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <button 
          type="button" 
          className="camera-button" 
          onClick={handleCameraClick}
          title="Tìm kiếm bằng hình ảnh"
        >
          <FaCamera />
        </button>
        <button type="submit" className="search-button">
          <FaSearch />
        </button>
      </form>

      {/* Visual Search Modal */}
      {showVisualSearch && (
        <div className="visual-search-overlay" onClick={closeVisualSearch}>
          <div className="visual-search-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeVisualSearch}>
              <FaTimes />
            </button>
            
            <h2>📷 Tìm kiếm bằng hình ảnh</h2>
            <p className="modal-subtitle">
              Tải ảnh sản phẩm bạn muốn tìm, AI sẽ phân tích và tìm sản phẩm tương tự
            </p>

            {!previewImage ? (
              <div 
                className="upload-zone"
                onClick={() => fileInputRef.current?.click()}
              >
                <FaCamera className="upload-icon" />
                <span>Click để chọn ảnh hoặc kéo thả vào đây</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  hidden
                />
              </div>
            ) : (
              <div className="preview-section">
                <div className="image-preview">
                  <img src={previewImage} alt="Preview" />
                  <button 
                    className="remove-image" 
                    onClick={() => { setPreviewImage(null); setAnalysisResult(null); }}
                  >
                    <FaTimes />
                  </button>
                </div>

                {!analysisResult && (
                  <button 
                    className="analyze-button"
                    onClick={handleAnalyzeImage}
                    disabled={analyzing}
                  >
                    {analyzing ? (
                      <>
                        <FaSpinner className="spin" /> Đang phân tích...
                      </>
                    ) : (
                      <>🔍 Phân tích hình ảnh</>
                    )}
                  </button>
                )}

                {analysisResult && (
                  <div className="analysis-result">
                    <h3>🎯 Kết quả phân tích</h3>
                    
                    <div className="result-item">
                      <span className="label">Loại sản phẩm:</span>
                      <span className="value">{analysisResult.productType}</span>
                    </div>
                    
                    <div className="result-item">
                      <span className="label">Mô tả:</span>
                      <span className="value">{analysisResult.description}</span>
                    </div>
                    
                    <div className="result-item">
                      <span className="label">Phong cách:</span>
                      <span className="value">{analysisResult.style}</span>
                    </div>
                    
                    <div className="result-item">
                      <span className="label">Dịp phù hợp:</span>
                      <span className="value">{analysisResult.occasion}</span>
                    </div>

                    <div className="keywords">
                      <span className="label">Từ khóa:</span>
                      <div className="keyword-tags">
                        {analysisResult.keywords?.map((kw, i) => (
                          <span 
                            key={i} 
                            className="keyword-tag"
                            onClick={() => handleSearchFromAnalysis(kw)}
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button 
                      className="search-similar-btn"
                      onClick={() => handleSearchFromAnalysis(analysisResult.searchQuery)}
                    >
                      🔍 Tìm sản phẩm tương tự
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SearchBar;

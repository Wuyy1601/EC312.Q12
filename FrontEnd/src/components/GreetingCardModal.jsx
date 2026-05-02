import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import "./GreetingCardModal.css";
import { FaMagic, FaDownload, FaTimes, FaHeart, FaImage, FaUpload, FaPen } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const GreetingCardModal = ({ isOpen, onClose, onSave }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    recipient: "",
    relationship: "Bạn bè",
    occasion: "Sinh nhật",
    customPrompt: "",
    aiMessage: "",
    manualMessage: "", 
  });
  
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const cardRef = useRef(null);

  // Fetch Templates from API
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch(`${API_URL}/api/templates`);
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setTemplates(data.data);
          // Set first template as default if not already selected
          if (!selectedTemplate) setSelectedTemplate(data.data[0].imageUrl);
        } else {
             // Fallback
             const fallbacks = [
                { _id: 't1', imageUrl: "https://i.pinimg.com/736x/26/51/7e/26517e47a9d06e2361d7c439c29cc46e.jpg" },
                { _id: 't2', imageUrl: "https://i.pinimg.com/736x/8f/c3/82/8fc382024925763026040854c86ac589.jpg" }
             ];
             setTemplates(fallbacks);
             if (!selectedTemplate) setSelectedTemplate(fallbacks[0].imageUrl);
        }
      } catch (err) {
        console.error("Failed to load templates", err);
      } finally {
        setLoadingTemplates(false);
      }
    };
    if(isOpen) fetchTemplates();
  }, [isOpen]);

  const handleGenerate = async () => {
    setLoadingAI(true);
    try {
      const res = await fetch(`${API_URL}/api/gemini/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: formData.recipient,
          relationship: formData.relationship,
          occasion: formData.occasion,
          prompt: formData.customPrompt,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFormData((prev) => ({ ...prev, aiMessage: data.text, manualMessage: "" })); 
      } else {
        alert("Lỗi AI: " + data.message);
      }
    } catch (error) {
      console.error("Generate error:", error);
      alert("Không thể tạo lời chúc lúc này.");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSelectedTemplate(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async () => {
     if(!cardRef.current) return;
     try {
       const canvas = await html2canvas(cardRef.current, {
         useCORS: true,
         allowTaint: true,
         backgroundColor: null,
         scale: 2, // High quality
         logging: false
       });
       const dataUrl = canvas.toDataURL("image/png");
       
       const link = document.createElement("a");
       link.href = dataUrl;
       link.download = `giftnity-card-${Date.now()}.png`;
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
     } catch (err) {
       console.error("Download error:", err);
       alert("Không thể tải ảnh. Đảm bảo ảnh mẫu không bị chặn bởi CORS.");
     }
  };

  const handleConfirm = () => {
    const finalMessage = formData.manualMessage || formData.aiMessage;
    
    onSave({
      message: finalMessage,
      design: selectedTemplate,
    });
    onClose();
  };

  const finalMessageDisplay = formData.manualMessage || formData.aiMessage;

  return (
    <div className="card-modal-overlay">
      <div className="card-modal-content">
         <div className="modal-header">
            <h2>Thiết kế Thiệp Chúc Mừng (+20.000đ)</h2>
            <button className="close-btn" onClick={onClose}><FaTimes /></button>
         </div>

         <div className="card-modal-body">
            {/* LEFT PANEL */}
            <div className="left-panel">
               
               {/* 1. Message Source */}
               <div className="section-title"><FaPen /> Nội Dung Lời Chúc</div>
               <div className="ai-tools-box">
                  <label style={{fontSize: '0.9rem', marginBottom: '5px', display: 'block', fontWeight: 'bold'}}>1. Tự viết lời chúc:</label>
                  <textarea 
                      className="tool-input" 
                      placeholder="Nhập lời chúc của bạn..."
                      rows="3"
                      value={formData.manualMessage}
                      onChange={(e) => setFormData({...formData, manualMessage: e.target.value})}
                  ></textarea>
                  
                  <div style={{margin: '15px 0', textAlign: 'center', color: '#ff4081', fontWeight: 'bold'}}>--- HOẶC ---</div>
                  
                  <label style={{fontSize: '0.9rem', marginBottom: '5px', display: 'block', fontWeight: 'bold'}}>2. Nhờ AI viết hộ:</label>
                  <input className="tool-input" placeholder="Tên người nhận (VD: Lan)" 
                      value={formData.recipient} onChange={(e)=>setFormData({...formData, recipient: e.target.value})}
                  />
                  <select className="tool-input" value={formData.occasion} onChange={(e)=>setFormData({...formData, occasion: e.target.value})}>
                      <option>Sinh nhật</option>
                      <option>Cảm ơn</option>
                      <option>Kỷ niệm</option>
                      <option>Chúc thi tốt</option>
                  </select>
                  <button className="magic-btn" onClick={handleGenerate} disabled={loadingAI || !formData.recipient}>
                      {loadingAI ? "Đang viết..." : <><FaMagic /> Tạo Lời Chúc AI</>}
                  </button>
               </div>

               {/* 2. Template Selection */}
               <div className="section-title" style={{marginTop: '20px'}}><FaImage /> Chọn Mẫu Thiệp</div>
               <div className="template-grid">
                  <label className="upload-btn">
                     <FaUpload size={20} />
                     <span>Tải ảnh lên</span>
                     <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                  </label>
                  {loadingTemplates ? <p>Đang tải mẫu...</p> : templates.map(t => (
                     <div 
                        key={t._id} 
                        className={`template-item ${selectedTemplate === t.imageUrl ? 'active' : ''}`}
                        onClick={() => setSelectedTemplate(t.imageUrl)}
                     >
                        <img src={t.imageUrl} alt={t.name} />
                     </div>
                  ))}
               </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="right-panel">
               <div className="canvas-container">
                  <div className="card-preview" ref={cardRef} style={{ backgroundImage: `url(${selectedTemplate})` }}>
                     <div className="text-overlay">
                        {finalMessageDisplay || "Nội dung lời chúc sẽ hiển thị ở đây..."}
                     </div>
                  </div>
               </div>

               <div className="modal-actions">
                  <button className="action-btn btn-download" onClick={handleDownload} title="Tải ảnh về máy">
                     <FaDownload /> Tải Xuống
                  </button>
                  <button className="action-btn btn-save" onClick={handleConfirm}>
                     <FaHeart /> Hoàn tất (20.000đ)
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default GreetingCardModal;

import React, { useState, useEffect } from "react";
import { FaTrash, FaPlus, FaImage, FaCloudUploadAlt, FaLink } from "react-icons/fa";
import "./AdminDashboard.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const AdminTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [uploadMode, setUploadMode] = useState("file"); // "file" or "url"
  const [name, setName] = useState("");
  const [category, setCategory] = useState("General");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${API_URL}/api/templates`);
      const data = await res.json();
      if (data.success) {
        setTemplates(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleAddTemplate = async () => {
    if (!name) {
      alert("Vui lòng nhập tên mẫu");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);

    if (uploadMode === "file") {
      if (!imageFile) {
        alert("Vui chọn file ảnh");
        return;
      }
      formData.append("image", imageFile);
    } else {
      if (!imageUrl) {
        alert("Vui lòng nhập URL ảnh");
        return;
      }
      formData.append("imageUrl", imageUrl);
    }

    try {
      const res = await fetch(`${API_URL}/api/templates`, {
        method: "POST",
        body: formData, // Auto Content-Type for FormData
      });
      const data = await res.json();
      if (data.success) {
        setTemplates([data.data, ...templates]);
        // Reset Form
        setName("");
        setImageFile(null);
        setImageUrl("");
        document.getElementById("fileInput").value = ""; // Clear file input
        alert("Thêm mẫu thành công");
      } else {
        alert("Lỗi: " + data.message);
      }
    } catch (err) {
      alert("Lỗi kết nối: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa mẫu này?")) return;
    try {
      const res = await fetch(`${API_URL}/api/templates/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        setTemplates(templates.filter(t => t._id !== id));
      }
    } catch (err) {
      alert("Lỗi xóa mẫu");
    }
  };

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h2>Quản lý Mẫu Thiệp</h2>
      </div>

      <div className="admin-card">
        <h3>Thêm mẫu mới</h3>
        
        <div className="form-group-admin">
          <label>Tên mẫu:</label>
          <input 
            type="text" 
            placeholder="VD: Sinh nhật Cute" 
            value={name}
            onChange={e => setName(e.target.value)}
            className="admin-input"
          />
        </div>

        <div className="form-group-admin">
          <label>Danh mục:</label>
           <select 
             value={category}
             onChange={e => setCategory(e.target.value)}
             className="admin-input"
          >
            <option value="General">Chung</option>
            <option value="Birthday">Sinh nhật</option>
            <option value="Love">Tình yêu</option>
            <option value="ThankYou">Cảm ơn</option>
          </select>
        </div>

        <div className="upload-tabs" style={{margin: '15px 0'}}>
           <button 
             className={`tab-btn ${uploadMode === 'file' ? 'active' : ''}`} 
             onClick={() => setUploadMode('file')}
             style={{marginRight: 10, padding: '5px 10px', cursor: 'pointer', background: uploadMode === 'file' ? '#e91e63' : '#eee', color: uploadMode === 'file' ? 'white' : 'black', border: 'none', borderRadius: 4}}
           >
             <FaCloudUploadAlt /> Tải ảnh từ máy
           </button>
           <button 
             className={`tab-btn ${uploadMode === 'url' ? 'active' : ''}`} 
             onClick={() => setUploadMode('url')}
             style={{padding: '5px 10px', cursor: 'pointer', background: uploadMode === 'url' ? '#e91e63' : '#eee', color: uploadMode === 'url' ? 'white' : 'black', border: 'none', borderRadius: 4}}
           >
             <FaLink /> Dùng Link Online
           </button>
        </div>

        <div className="form-group-admin">
          {uploadMode === 'file' ? (
             <input 
               id="fileInput"
               type="file" 
               accept="image/*"
               onChange={e => setImageFile(e.target.files[0])}
               className="admin-input"
             />
          ) : (
             <input 
               type="text" 
               placeholder="https://example.com/image.jpg" 
               value={imageUrl}
               onChange={e => setImageUrl(e.target.value)}
               className="admin-input"
             />
          )}
        </div>

        <button className="admin-btn add-btn" onClick={handleAddTemplate} style={{marginTop: 15}}>
             <FaPlus /> Thêm Mẫu
        </button>
      </div>

      <div className="template-list-grid" style={{
         display: 'grid', 
         gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
         gap: '20px',
         marginTop: '30px'
      }}>
        {loading ? <p>Đang tải...</p> : templates.map(t => (
          <div key={t._id} className="template-card-admin" style={{
             border: '1px solid #ddd',
             borderRadius: '8px',
             padding: '10px',
             textAlign: 'center',
             background: 'white',
             boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}>
             <div style={{height: '180px', overflow: 'hidden', marginBottom: '10px', borderRadius: '4px'}}>
               <img src={t.imageUrl} alt={t.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
             </div>
             <strong style={{display: 'block', marginBottom: '5px'}}>{t.name}</strong>
             <span className="badge" style={{background: '#fce4ec', color: '#ec407a', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8rem'}}>{t.category}</span>
             
             <button 
               onClick={() => handleDelete(t._id)}
               style={{
                 background: '#f44336', 
                 color: 'white', 
                 border: 'none', 
                 padding: '6px 12px', 
                 borderRadius: '4px',
                 marginTop: '15px',
                 cursor: 'pointer',
                 width: '100%',
                 display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
               }}
             >
               <FaTrash /> Xóa
             </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminTemplates;

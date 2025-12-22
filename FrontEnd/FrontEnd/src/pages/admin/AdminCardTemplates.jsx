import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaStar, FaRegStar, FaImage } from 'react-icons/fa';
import './AdminProducts.css'; // Reuse existing admin styles

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const CATEGORIES = [
  { id: 'love', name: 'Tình yêu', emoji: '❤️' },
  { id: 'birthday', name: 'Sinh nhật', emoji: '🎂' },
  { id: 'holiday', name: 'Lễ hội', emoji: '🎉' },
  { id: 'thanks', name: 'Cảm ơn', emoji: '🙏' },
  { id: 'congrats', name: 'Chúc mừng', emoji: '🎊' },
  { id: 'wedding', name: 'Đám cưới', emoji: '💒' },
  { id: 'newyear', name: 'Năm mới', emoji: '🎆' },
  { id: 'other', name: 'Khác', emoji: '✨' }
];

const AdminCardTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'other',
    coverColor: '#ffcdc9',
    defaultMessage: '',
    isFeatured: false
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const url = filterCategory 
        ? `${API_URL}/api/card-templates?category=${filterCategory}`
        : `${API_URL}/api/card-templates`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [filterCategory]);

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      category: 'other',
      coverColor: '#ffcdc9',
      defaultMessage: '',
      isFeatured: false
    });
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const handleOpenEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      category: template.category,
      coverColor: template.coverColor || '#ffcdc9',
      defaultMessage: template.defaultMessage || '',
      isFeatured: template.isFeatured
    });
    setImageFile(null);
    setImagePreview(template.coverImage?.startsWith('http') 
      ? template.coverImage 
      : `${API_URL}${template.coverImage}`);
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('coverColor', formData.coverColor);
    formDataToSend.append('defaultMessage', formData.defaultMessage);
    formDataToSend.append('isFeatured', formData.isFeatured);
    
    if (imageFile) {
      formDataToSend.append('coverImage', imageFile);
    }

    try {
      const url = editingTemplate 
        ? `${API_URL}/api/card-templates/${editingTemplate._id}`
        : `${API_URL}/api/card-templates`;
      
      const res = await fetch(url, {
        method: editingTemplate ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });
      
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchTemplates();
        alert(editingTemplate ? 'Đã cập nhật template!' : 'Đã tạo template mới!');
      } else {
        alert(data.message || 'Lỗi!');
      }
    } catch (err) {
      console.error('Error saving template:', err);
      alert('Lỗi lưu template!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa template này?')) return;
    
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/card-templates/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchTemplates();
        alert('Đã xóa!');
      }
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const toggleFeatured = async (template) => {
    const token = localStorage.getItem('adminToken');
    try {
      await fetch(`${API_URL}/api/card-templates/${template._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isFeatured: !template.isFeatured })
      });
      fetchTemplates();
    } catch (err) {
      console.error('Error toggling featured:', err);
    }
  };

  const getCategoryName = (id) => {
    const cat = CATEGORIES.find(c => c.id === id);
    return cat ? `${cat.emoji} ${cat.name}` : id;
  };

  return (
    <div className="admin-products">
      <div className="admin-header">
        <h1>🎴 Quản lý Template Thiệp</h1>
        <button className="add-btn" onClick={handleOpenCreate}>
          <FaPlus /> Thêm Template
        </button>
      </div>

      {/* Filter */}
      <div className="filter-bar" style={{ marginBottom: '1rem' }}>
        <select 
          value={filterCategory} 
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{ padding: '8px 15px', borderRadius: '8px', border: '1px solid #ddd' }}
        >
          <option value="">Tất cả danh mục</option>
          {CATEGORIES.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
          ))}
        </select>
      </div>

      {/* Template Grid */}
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="products-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
          {templates.map(template => (
            <div key={template._id} className="product-card" style={{ position: 'relative' }}>
              {template.isFeatured && (
                <span style={{ 
                  position: 'absolute', 
                  top: '10px', 
                  right: '10px', 
                  background: '#ffc107', 
                  color: '#333', 
                  padding: '2px 8px', 
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}>
                  ⭐ Nổi bật
                </span>
              )}
              
              <div className="product-image" style={{ height: '180px', overflow: 'hidden' }}>
                <img 
                  src={template.coverImage?.startsWith('http') ? template.coverImage : `${API_URL}${template.coverImage}`}
                  alt={template.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = `https://placehold.co/300x300/${template.coverColor?.replace('#','')}/ffffff?text=Template`;
                  }}
                />
              </div>
              
              <div className="product-info" style={{ padding: '1rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{template.name}</h3>
                <p style={{ fontSize: '0.85rem', color: '#666' }}>{getCategoryName(template.category)}</p>
                <p style={{ fontSize: '0.8rem', color: '#999' }}>Đã dùng: {template.usageCount || 0} lần</p>
              </div>
              
              <div className="product-actions" style={{ padding: '0.5rem 1rem 1rem', display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => toggleFeatured(template)} title="Nổi bật" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>
                  {template.isFeatured ? <FaStar color="#ffc107" /> : <FaRegStar color="#999" />}
                </button>
                <button onClick={() => handleOpenEdit(template)} className="edit-btn" style={{ flex: 1 }}>
                  <FaEdit /> Sửa
                </button>
                <button onClick={() => handleDelete(template._id)} className="delete-btn" style={{ flex: 1 }}>
                  <FaTrash /> Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '500px' }}>
            <h2>{editingTemplate ? 'Sửa Template' : 'Thêm Template Mới'}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên Template *</label>
                <input 
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="VD: Hoa hồng lãng mạn"
                />
              </div>

              <div className="form-group">
                <label>Danh mục *</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Ảnh bìa (1024x1024) *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    padding: '10px 20px',
                    background: '#f0f0f0',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}>
                    <FaImage /> Chọn ảnh
                    <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                  </label>
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Màu bìa (dự phòng)</label>
                <input 
                  type="color"
                  value={formData.coverColor}
                  onChange={(e) => setFormData({...formData, coverColor: e.target.value})}
                  style={{ width: '60px', height: '40px', padding: 0, border: 'none' }}
                />
              </div>

              <div className="form-group">
                <label>Lời chúc mặc định</label>
                <textarea 
                  value={formData.defaultMessage}
                  onChange={(e) => setFormData({...formData, defaultMessage: e.target.value})}
                  placeholder="VD: Chúc bạn một ngày thật vui vẻ!"
                  rows={3}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                  id="featured-check"
                />
                <label htmlFor="featured-check" style={{ marginBottom: 0 }}>⭐ Template nổi bật</label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn-primary">
                  {editingTemplate ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCardTemplates;

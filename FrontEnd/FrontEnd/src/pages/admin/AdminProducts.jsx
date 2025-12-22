import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaSearch, FaPlus, FaCloudUploadAlt, FaGift, FaTimes } from "react-icons/fa";
import "./AdminProducts.css";

const API_URL = "http://localhost:5001";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [singleProducts, setSingleProducts] = useState([]); // Products for bundle selection
  const [categories, setCategories] = useState([]); // Categories list
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  // Bundle state
  const [isBundle, setIsBundle] = useState(false);
  const [bundleItems, setBundleItems] = useState([]);

  // Category state
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  
  // Spirit state
  const [selectedSpirit, setSelectedSpirit] = useState("");
  const spirits = [
    { id: 'love', name: 'Tình Yêu' },
    { id: 'joy', name: 'Niềm Vui' },
    { id: 'care', name: 'Quan Tâm' },
    { id: 'gratitude', name: 'Biết Ơn' },
    { id: 'kindness', name: 'Tử Tế' },
    { id: 'courage', name: 'Dũng Cảm' },
    { id: 'peace', name: 'Bình Yên' },
    { id: 'wisdom', name: 'Trí Tuệ' },
    { id: 'magic', name: 'Phép Màu' },
    { id: 'wonder', name: 'Kỳ Diệu' }
  ];

  useEffect(() => {
    fetchProducts();
    fetchSingleProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products`);
      const data = await res.json();
      setProducts(data.data || []);
    } catch (error) {
      console.error("Fetch products error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSingleProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products/singles`);
      const data = await res.json();
      setSingleProducts(data.data || []);
    } catch (error) {
      console.error("Fetch single products error:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/api/categories`);
      const data = await res.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error("Fetch categories error:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    try {
      await fetch(`${API_URL}/api/products/${id}`, { method: "DELETE" });
      setProducts(products.filter((p) => p._id !== id));
    } catch (error) {
      console.error("Delete product error:", error);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const addBundleItem = () => {
    setBundleItems([...bundleItems, { product: "", quantity: 1 }]);
  };

  const removeBundleItem = (index) => {
    setBundleItems(bundleItems.filter((_, i) => i !== index));
  };

  const updateBundleItem = (index, field, value) => {
    const updated = [...bundleItems];
    updated[index][field] = field === "quantity" ? Number(value) : value;
    setBundleItems(updated);
  };

  const calculateOriginalPrice = () => {
    return bundleItems.reduce((sum, item) => {
      const product = singleProducts.find((p) => p._id === item.product);
      return sum + (product?.price || 0) * item.quantity;
    }, 0);
  };

  // Create new category
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      const res = await fetch(`${API_URL}/api/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      const data = await res.json();
      
      if (data.success) {
        setCategories([...categories, data.data]);
        setSelectedCategory(data.data._id);
        setIsCreatingCategory(false);
        setNewCategoryName("");
      } else {
        alert(data.message || "Không thể tạo danh mục");
      }
    } catch (error) {
      console.error("Create category error:", error);
      alert("Lỗi khi tạo danh mục");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const form = e.target;

    const formData = new FormData();
    formData.append("name", form.name.value);
    formData.append("price", form.price.value);
    formData.append("description", form.description.value);
    formData.append("story", form.story?.value || "");
    formData.append("stock", form.stock?.value || 0);
    formData.append("isBundle", isBundle);
    
    // Category - send both ID and name
    if (selectedCategory) {
      formData.append("category", selectedCategory);
      const cat = categories.find(c => c._id === selectedCategory);
      formData.append("categoryName", cat?.name || "");
    }

    if (isBundle) {
      // Append spirit type if bundle
      if (selectedSpirit) {
        formData.append("spiritType", selectedSpirit);
      }
      if (bundleItems.length > 0) {
        formData.append("bundleItems", JSON.stringify(bundleItems.filter((item) => item.product)));
      }
    }

    selectedFiles.forEach((file) => formData.append("images", file));

    try {
      const url = editingProduct ? `${API_URL}/api/products/${editingProduct._id}` : `${API_URL}/api/products`;
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, { method, body: formData });
      const data = await res.json();

      if (data.success) {
        fetchProducts();
        fetchSingleProducts();
        handleCloseModal();
      }
    } catch (error) {
      console.error("Save product error:", error);
    }
  };

  const handleCloseModal = () => {
    setEditingProduct(null);
    setIsCreating(false);
    setSelectedFiles([]);
    setPreviewUrls([]);
    setIsBundle(false);
    setBundleItems([]);
    setSelectedCategory("");
    setIsCreatingCategory(false);
    setNewCategoryName("");
    setSelectedSpirit("");
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setIsBundle(product.isBundle || false);
    setBundleItems(product.bundleItems?.map((item) => ({ product: item.product?._id || item.product, quantity: item.quantity })) || []);
    setPreviewUrls(product.images?.map((img) => `${API_URL}${img}`) || []);
    // Set category - handle both ObjectId and string
    setSelectedCategory(product.category?._id || product.category || "");
    setSelectedSpirit(product.spiritType || "");
  };

  const handleOpenCreate = () => {
    setIsCreating(true);
    setIsBundle(false);
    setBundleItems([]);
    setSelectedCategory("");
    setSelectedSpirit("");
  };

  const formatPrice = (price) => new Intl.NumberFormat("vi-VN").format(price) + "đ";

  const getImageUrl = (product) => {
    if (product.images?.length > 0) return `${API_URL}${product.images[0]}`;
    if (product.image) return product.image.startsWith("http") ? product.image : `${API_URL}${product.image}`;
    return "/placeholder.png";
  };

  const getCategoryName = (product) => {
    if (product.category?.name) return product.category.name;
    if (product.categoryName) return product.categoryName;
    return "Chưa phân loại";
  };

  const filteredProducts = products.filter((p) => p.name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="admin-loading">Đang tải...</div>;

  return (
    <div className="admin-products">
      <h1>📦 Quản lý sản phẩm</h1>

      <div className="toolbar">
        <div className="search-box">
          <FaSearch />
          <input type="text" placeholder="Tìm kiếm sản phẩm..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button className="add-btn" onClick={handleOpenCreate}>
          <FaPlus /> Thêm sản phẩm
        </button>
      </div>

      <div className="products-grid">
        {filteredProducts.map((product) => (
          <div key={product._id} className={`product-card ${product.isBundle ? "bundle" : ""}`}>
            {product.isBundle && <span className="bundle-badge"><FaGift /> Hộp quà</span>}
            <img src={getImageUrl(product)} alt={product.name} />
            {product.images?.length > 1 && <span className="image-count">+{product.images.length - 1}</span>}
            <div className="product-info">
              <h3>{product.name}</h3>
              <div className="stock-info" style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>
                <strong>Kho:</strong> {product.isBundle ? (
                  <span title="Tính dựa trên sản phẩm con">{(() => {
                    if (!product.bundleItems || product.bundleItems.length === 0) return 0;
                    const stocks = product.bundleItems.map(item => {
                      // Prioritize populated stock
                      if (item.product && typeof item.product === 'object' && item.product.stock !== undefined) {
                        return Math.floor(item.product.stock / item.quantity);
                      }
                      const subId = item.product?._id || item.product;
                      const sub = singleProducts.find(p => p._id === subId) || products.find(p => p._id === subId);
                      return sub ? Math.floor((sub.stock || 0) / item.quantity) : 0;
                    });
                    return Math.min(...stocks);
                  })()} (Combo)</span>
                ) : (
                  <span>{product.stock || 0}</span>
                )}
              </div>
              <p className="price">{formatPrice(product.price)}</p>
              {product.isBundle && product.savings > 0 && (
                <p className="savings">Tiết kiệm {formatPrice(product.savings)}</p>
              )}
              <p className="category">{getCategoryName(product)}</p>
            </div>
            <div className="product-actions">
              <button onClick={() => handleOpenEdit(product)}><FaEdit /></button>
              <button onClick={() => handleDelete(product._id)}><FaTrash /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {(editingProduct || isCreating) && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Tên sản phẩm</label>
                <input name="name" defaultValue={editingProduct?.name || ""} required />
              </div>

              {/* Bundle Toggle */}
              <div className="form-group bundle-toggle">
                <label className="checkbox-label">
                  <input type="checkbox" checked={isBundle} onChange={(e) => setIsBundle(e.target.checked)} />
                  <FaGift /> Đây là hộp quà (Bundle)
                </label>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Giá bán (VND)</label>
                  <input name="price" type="number" defaultValue={editingProduct?.price || ""} required />
                  {isBundle && bundleItems.length > 0 && (
                    <small className="price-hint">
                      Giá gốc: {formatPrice(calculateOriginalPrice())}
                    </small>
                  )}
                </div>
                <div className="form-group">
                  <label>Số lượng</label>
                  {isBundle ? (
                     <input type="text" value="Tự động tính theo SP con" disabled style={{ background: '#f5f5f5', color: '#666' }} />
                  ) : (
                     <input name="stock" type="number" defaultValue={editingProduct?.stock || 0} />
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea name="description" defaultValue={editingProduct?.description || ""} />
              </div>

              <div className="form-group">
                <label>📖 Câu chuyện phía sau sản phẩm</label>
                <textarea 
                  name="story" 
                  defaultValue={editingProduct?.story || ""} 
                  placeholder="Kể một câu chuyện cảm động về sản phẩm này để thu hút khách hàng..."
                  style={{ minHeight: '80px' }}
                />
              </div>              {/* Category Selection */}
              <div className="form-group">
                <label>Danh mục</label>
                {!isCreatingCategory ? (
                  <div className="category-select-wrapper">
                    <select 
                      value={selectedCategory} 
                      onChange={(e) => {
                        if (e.target.value === "_create_new_") {
                          setIsCreatingCategory(true);
                        } else {
                          setSelectedCategory(e.target.value);
                        }
                      }}
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                      <option value="_create_new_">➕ Tạo danh mục mới...</option>
                    </select>
                  </div>
                ) : (
                  <div className="new-category-input">
                    <input 
                      type="text"
                      placeholder="Nhập tên danh mục mới..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      autoFocus
                    />
                    <button type="button" className="create-cat-btn" onClick={handleCreateCategory}>
                      Tạo
                    </button>
                    <button type="button" className="cancel-cat-btn" onClick={() => {
                      setIsCreatingCategory(false);
                      setNewCategoryName("");
                    }}>
                      Hủy
                    </button>
                  </div>
                )}
              </div>

              {/* Bundle Items */}
              {isBundle && (
                <div className="bundle-section">
                  <h3>🎁 Cấu hình Hộp Quà</h3>
                  
                  {/* Spirit Selection */}
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label>✨ Tinh Linh Đại Diện (Chọn 1 để AI gợi ý)</label>
                    <select 
                      value={selectedSpirit}
                      onChange={(e) => setSelectedSpirit(e.target.value)}
                      style={{ border: '2px solid #ec407a', background: '#fff5f8' }}
                    >
                      <option value="">-- Chọn Tinh Linh --</option>
                      {spirits.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.id})
                        </option>
                      ))}
                    </select>
                    <small style={{ display: 'block', marginTop: '5px', color: '#ec407a' }}>
                      * Chọn tinh linh để bundle này xuất hiện khi khách hàng chat với tinh linh đó
                    </small>
                  </div>

                  <h4>Sản phẩm trong hộp</h4>
                  {bundleItems.map((item, index) => (
                    <div key={index} className="bundle-item">
                      <select
                        value={item.product}
                        onChange={(e) => updateBundleItem(index, "product", e.target.value)}
                      >
                        <option value="">-- Chọn sản phẩm --</option>
                        {singleProducts.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name} - {formatPrice(p.price)}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateBundleItem(index, "quantity", e.target.value)}
                        placeholder="SL"
                      />
                      <button type="button" className="remove-item" onClick={() => removeBundleItem(index)}>
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                  <button type="button" className="add-item-btn" onClick={addBundleItem}>
                    + Thêm sản phẩm
                  </button>
                </div>
              )}

              {/* Image Upload */}
              <div className="form-group">
                <label>Hình ảnh (tối đa 5 ảnh)</label>
                <div className="upload-area">
                  <input type="file" accept="image/*" multiple onChange={handleFileChange} id="image-upload" className="file-input" />
                  <label htmlFor="image-upload" className="upload-label">
                    <FaCloudUploadAlt />
                    <span>Chọn ảnh từ máy tính</span>
                  </label>
                </div>
                {previewUrls.length > 0 && (
                  <div className="image-previews">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="preview-item">
                        <img src={url} alt={`Preview ${index + 1}`} />
                        {index === 0 && <span className="main-badge">Chính</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal}>Hủy</button>
                <button type="submit" className="save-btn">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;

import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaSearch, FaPlus, FaCloudUploadAlt } from "react-icons/fa";
import "./AdminProducts.css";

const API_URL = "http://localhost:5001";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  useEffect(() => {
    fetchProducts();
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

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

    try {
      await fetch(`${API_URL}/api/products/${id}`, {
        method: "DELETE",
      });
      setProducts(products.filter((p) => p._id !== id));
    } catch (error) {
      console.error("Delete product error:", error);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);

    // Tạo preview URLs
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const form = e.target;

    const formData = new FormData();
    formData.append("name", form.name.value);
    formData.append("price", form.price.value);
    formData.append("description", form.description.value);
    formData.append("category", form.category.value);
    formData.append("stock", form.stock?.value || 0);

    // Thêm các file ảnh
    selectedFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const url = editingProduct
        ? `${API_URL}/api/products/${editingProduct._id}`
        : `${API_URL}/api/products`;
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        if (editingProduct) {
          setProducts(products.map((p) => (p._id === editingProduct._id ? data.data : p)));
        } else {
          setProducts([data.data, ...products]);
        }
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
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setPreviewUrls(product.images?.map((img) => `${API_URL}${img}`) || []);
  };

  const formatPrice = (price) => new Intl.NumberFormat("vi-VN").format(price) + "đ";

  const getImageUrl = (product) => {
    if (product.images?.length > 0) {
      return `${API_URL}${product.images[0]}`;
    }
    if (product.image) {
      return product.image.startsWith("http") ? product.image : `${API_URL}${product.image}`;
    }
    return "/placeholder.png";
  };

  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="admin-loading">Đang tải...</div>;

  return (
    <div className="admin-products">
      <h1>📦 Quản lý sản phẩm</h1>

      <div className="toolbar">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="add-btn" onClick={() => setIsCreating(true)}>
          <FaPlus /> Thêm sản phẩm
        </button>
      </div>

      <div className="products-grid">
        {filteredProducts.map((product) => (
          <div key={product._id} className="product-card">
            <img src={getImageUrl(product)} alt={product.name} />
            {product.images?.length > 1 && (
              <span className="image-count">+{product.images.length - 1}</span>
            )}
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="price">{formatPrice(product.price)}</p>
              <p className="category">{product.category}</p>
            </div>
            <div className="product-actions">
              <button onClick={() => handleOpenEdit(product)}>
                <FaEdit />
              </button>
              <button onClick={() => handleDelete(product._id)}>
                <FaTrash />
              </button>
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
              <div className="form-row">
                <div className="form-group">
                  <label>Giá (VND)</label>
                  <input name="price" type="number" defaultValue={editingProduct?.price || ""} required />
                </div>
                <div className="form-group">
                  <label>Số lượng</label>
                  <input name="stock" type="number" defaultValue={editingProduct?.stock || 0} />
                </div>
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea name="description" defaultValue={editingProduct?.description || ""} />
              </div>
              <div className="form-group">
                <label>Danh mục</label>
                <input name="category" defaultValue={editingProduct?.category || ""} />
              </div>

              {/* Image Upload */}
              <div className="form-group">
                <label>Hình ảnh (tối đa 5 ảnh)</label>
                <div className="upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    id="image-upload"
                    className="file-input"
                  />
                  <label htmlFor="image-upload" className="upload-label">
                    <FaCloudUploadAlt />
                    <span>Chọn ảnh từ máy tính</span>
                    <small>JPEG, PNG, GIF, WebP (max 5MB mỗi ảnh)</small>
                  </label>
                </div>

                {/* Preview */}
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

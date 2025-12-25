import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaSearch, FaPlus } from "react-icons/fa";
import "./AdminUsers.css"; // Reuse same styling

const API_URL = "http://localhost:5001";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/api/admin/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error("Fetch categories error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa danh mục này?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      await fetch(`${API_URL}/api/admin/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(categories.filter((c) => c._id !== id));
    } catch (error) {
      console.error("Delete category error:", error);
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/api/admin/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        setCategories(categories.map((c) => (c._id === id ? data.data : c)));
        setEditingCategory(null);
      }
    } catch (error) {
      console.error("Update category error:", error);
    }
  };

  const handleCreate = async (categoryData) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/api/admin/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(categoryData),
      });
      const data = await res.json();
      if (data.success) {
        fetchCategories();
        setIsCreating(false);
      } else {
        alert(data.message || "Lỗi tạo danh mục");
      }
    } catch (error) {
      console.error("Create category error:", error);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="admin-loading">Đang tải...</div>;

  return (
    <div className="admin-users">
      <h1>📂 Quản lý danh mục</h1>

      <div className="toolbar">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="add-btn" onClick={() => setIsCreating(true)}>
          <FaPlus /> Thêm danh mục
        </button>
      </div>

      <table className="users-table">
        <thead>
          <tr>
            <th>Tên danh mục</th>
            <th>Slug</th>
            <th>Mô tả</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredCategories.map((category) => (
            <tr key={category._id}>
              <td>{category.name}</td>
              <td><code>{category.slug}</code></td>
              <td>{category.description || "-"}</td>
              <td>
                <span className={`role-badge ${category.isActive ? 'admin' : 'user'}`}>
                  {category.isActive ? "Hoạt động" : "Ẩn"}
                </span>
              </td>
              <td>{new Date(category.createdAt).toLocaleDateString("vi-VN")}</td>
              <td className="actions">
                <button className="edit-btn" onClick={() => setEditingCategory(category)}>
                  <FaEdit />
                </button>
                <button className="delete-btn" onClick={() => handleDelete(category._id)}>
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Modal */}
      {editingCategory && (
        <div className="modal-overlay" onClick={() => setEditingCategory(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Chỉnh sửa danh mục</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleUpdate(editingCategory._id, {
                  name: formData.get("name"),
                  description: formData.get("description"),
                  isActive: formData.get("isActive") === "true",
                });
              }}
            >
              <div className="form-group">
                <label>Tên danh mục</label>
                <input name="name" defaultValue={editingCategory.name} required />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea name="description" defaultValue={editingCategory.description} />
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <select name="isActive" defaultValue={editingCategory.isActive}>
                  <option value="true">Hoạt động</option>
                  <option value="false">Ẩn</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setEditingCategory(null)}>Hủy</button>
                <button type="submit" className="save-btn">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreating && (
        <div className="modal-overlay" onClick={() => setIsCreating(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Tạo danh mục mới</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleCreate({
                  name: formData.get("name"),
                  description: formData.get("description"),
                });
              }}
            >
              <div className="form-group">
                <label>Tên danh mục</label>
                <input name="name" required />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea name="description" />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setIsCreating(false)}>Hủy</button>
                <button type="submit" className="save-btn">Tạo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;

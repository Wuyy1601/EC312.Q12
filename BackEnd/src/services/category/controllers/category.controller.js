import Category from "../models/category.model.js";

// GET /api/categories - Lấy tất cả danh mục
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error("Lỗi lấy danh mục:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi lấy danh mục" });
  }
};

// GET /api/categories/:id - Lấy 1 danh mục theo ID
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Không tìm thấy danh mục" });
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    console.error("Lỗi lấy danh mục:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// POST /api/categories - Tạo danh mục mới (Admin only)
export const createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Tên danh mục là bắt buộc" });
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ success: false, message: "Tên danh mục đã tồn tại" });
    }

    const category = await Category.create({ name, description, image });

    res.status(201).json({
      success: true,
      message: "Tạo danh mục thành công",
      data: category,
    });
  } catch (error) {
    console.error("Lỗi tạo danh mục:", error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Tên danh mục đã tồn tại" });
    }
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// PUT /api/categories/:id - Cập nhật danh mục (Admin only)
export const updateCategory = async (req, res) => {
  try {
    const { name, description, image, isActive } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Không tìm thấy danh mục" });
    }

    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({ success: false, message: "Tên danh mục đã tồn tại" });
      }
      category.name = name;
    }

    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    res.status(200).json({
      success: true,
      message: "Cập nhật danh mục thành công",
      data: category,
    });
  } catch (error) {
    console.error("Lỗi cập nhật danh mục:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// DELETE /api/categories/:id - Xóa danh mục (Admin only)
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Không tìm thấy danh mục" });
    }

    // Soft delete
    category.isActive = false;
    await category.save();

    res.status(200).json({ success: true, message: "Xóa danh mục thành công" });
  } catch (error) {
    console.error("Lỗi xóa danh mục:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

export default { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };

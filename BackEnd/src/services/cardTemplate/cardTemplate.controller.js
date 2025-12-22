import CardTemplate from './cardTemplate.model.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all templates (with optional category filter)
export const getAllTemplates = async (req, res) => {
  try {
    const { category, featured } = req.query;
    
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (featured === 'true') filter.isFeatured = true;
    
    const templates = await CardTemplate.find(filter)
      .sort({ isFeatured: -1, usageCount: -1, createdAt: -1 });
    
    res.json({ success: true, templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Get single template
export const getTemplateById = async (req, res) => {
  try {
    const template = await CardTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template không tồn tại' });
    }
    res.json({ success: true, template });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Create template (Admin only)
export const createTemplate = async (req, res) => {
  try {
    const { name, category, coverColor, defaultMessage, isFeatured } = req.body;
    
    // Handle image upload
    let coverImage = '';
    if (req.file) {
      coverImage = `/uploads/card-templates/${req.file.filename}`;
    } else if (req.body.coverImage) {
      coverImage = req.body.coverImage;
    } else {
      return res.status(400).json({ success: false, message: 'Cần upload ảnh bìa' });
    }
    
    const template = new CardTemplate({
      name,
      category: category || 'other',
      coverImage,
      coverColor: coverColor || '#ffcdc9',
      defaultMessage: defaultMessage || '',
      isFeatured: isFeatured === 'true' || isFeatured === true
    });
    
    await template.save();
    res.status(201).json({ success: true, template });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ success: false, message: 'Lỗi tạo template: ' + error.message });
  }
};

// Update template (Admin only)
export const updateTemplate = async (req, res) => {
  try {
    const { name, category, coverColor, defaultMessage, isFeatured, isActive } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (category) updateData.category = category;
    if (coverColor) updateData.coverColor = coverColor;
    if (defaultMessage !== undefined) updateData.defaultMessage = defaultMessage;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured === 'true' || isFeatured === true;
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;
    
    // Handle new image upload
    if (req.file) {
      updateData.coverImage = `/uploads/card-templates/${req.file.filename}`;
      
      // Delete old image
      const oldTemplate = await CardTemplate.findById(req.params.id);
      if (oldTemplate && oldTemplate.coverImage && !oldTemplate.coverImage.startsWith('http')) {
        const oldPath = path.join(__dirname, '../../public', oldTemplate.coverImage);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }
    
    const template = await CardTemplate.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template không tồn tại' });
    }
    
    res.json({ success: true, template });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ success: false, message: 'Lỗi cập nhật template' });
  }
};

// Delete template (Admin only)
export const deleteTemplate = async (req, res) => {
  try {
    const template = await CardTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template không tồn tại' });
    }
    
    // Delete image file
    if (template.coverImage && !template.coverImage.startsWith('http')) {
      const imagePath = path.join(__dirname, '../../public', template.coverImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await CardTemplate.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xóa template' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ success: false, message: 'Lỗi xóa template' });
  }
};

// Increment usage count (called when user selects a template)
export const incrementUsage = async (req, res) => {
  try {
    await CardTemplate.findByIdAndUpdate(req.params.id, { $inc: { usageCount: 1 } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// Get categories list
export const getCategories = async (req, res) => {
  const categories = [
    { id: 'love', name: 'Tình yêu', emoji: '❤️' },
    { id: 'birthday', name: 'Sinh nhật', emoji: '🎂' },
    { id: 'holiday', name: 'Lễ hội', emoji: '🎉' },
    { id: 'thanks', name: 'Cảm ơn', emoji: '🙏' },
    { id: 'congrats', name: 'Chúc mừng', emoji: '🎊' },
    { id: 'wedding', name: 'Đám cưới', emoji: '💒' },
    { id: 'newyear', name: 'Năm mới', emoji: '🎆' },
    { id: 'other', name: 'Khác', emoji: '✨' }
  ];
  res.json({ success: true, categories });
};

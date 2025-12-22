import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import * as controller from './cardTemplate.controller.js';
import { authMiddleware, adminMiddleware } from '../user/controllers/user.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/card-templates');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'card-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ hỗ trợ ảnh JPEG, PNG, WebP'));
    }
  }
});

// Public routes
router.get('/', controller.getAllTemplates);
router.get('/categories', controller.getCategories);
router.get('/:id', controller.getTemplateById);
router.post('/:id/use', controller.incrementUsage);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, upload.single('coverImage'), controller.createTemplate);
router.put('/:id', authMiddleware, adminMiddleware, upload.single('coverImage'), controller.updateTemplate);
router.delete('/:id', authMiddleware, adminMiddleware, controller.deleteTemplate);

export default router;

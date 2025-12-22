import mongoose from 'mongoose';
import connection from '../product/database.js';

const cardTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    category: {
      type: String,
      enum: ['love', 'birthday', 'holiday', 'thanks', 'congrats', 'wedding', 'newyear', 'other'],
      default: 'other'
    },
    coverImage: {
      type: String, // URL to uploaded image (1024x1024)
      required: true
    },
    coverColor: {
      type: String, // Fallback hex color
      default: '#ffcdc9'
    },
    defaultMessage: {
      type: String,
      default: '',
      maxlength: 500
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    usageCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Index for faster queries
cardTemplateSchema.index({ category: 1, isActive: 1 });
cardTemplateSchema.index({ isFeatured: 1, isActive: 1 });

// Use the product database connection instead of default mongoose
const CardTemplate = connection.model('CardTemplate', cardTemplateSchema);

export default CardTemplate;

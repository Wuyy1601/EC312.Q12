import mongoose from "mongoose";
import connection from "../database.js";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Store minimal user info directly to avoid complex population if needed
    userInfo: {
      fullName: String,
      avatar: String
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    // Sentiment Analysis fields
    sentiment: {
      type: String,
      enum: ["positive", "neutral", "negative", null],
      default: null,
    },
    sentimentScore: {
      type: Number, // -1 to 1 scale
      default: null,
    },
    sentimentAnalysis: {
      type: String, // AI explanation
      default: null,
    },
    needsAttention: {
      type: Boolean, // Flag for negative reviews that need CS attention
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent multiple reviews from same user for same product if needed. 
// But sometimes user wants to review again? Let's keep it simple for now and allow multiple.
// reviewSchema.index({ user: 1, product: 1 }, { unique: true });

const Review = connection.models.Review || connection.model("Review", reviewSchema);

export default Review;

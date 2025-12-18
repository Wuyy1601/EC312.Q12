import Review from "../models/review.model.js";

// Create a review
export const createReview = async (req, res) => {
  try {
    const { productId, rating, comment, userInfo } = req.body;
    // req.user is populated by auth middleware
    const userId = req.user.id; 

    if (!productId || !rating || !comment) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin đánh giá" });
    }

    const review = new Review({
      user: userId,
      userInfo: userInfo || { fullName: req.user.username }, // Fallback to username if no info provided
      product: productId,
      rating,
      comment,
    });

    await review.save();

    res.status(201).json({
      success: true,
      message: "Đánh giá thành công",
      data: review,
    });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Get reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId })
      .sort({ createdAt: -1 }); // Newest first

    // Calculate stats
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 
      ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: reviews,
      stats: {
        totalReviews,
        avgRating: parseFloat(avgRating)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

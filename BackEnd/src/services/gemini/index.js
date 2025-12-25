import { GoogleGenerativeAI } from "@google/generative-ai";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Initialize Gemini
const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyC2s9di5wEBOiECHsHIebb7SY0nS0a6KQU";
const genAI = new GoogleGenerativeAI(API_KEY);

export const generateGreeting = async (req, res) => {
  try {
    const { prompt, occasion, recipient, relationship } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: true,
        text: `Chúc ${recipient} một ${occasion} thật vui vẻ và hạnh phúc! (Đây là tin nhắn mẫu do chưa có API Key)`,
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const fullPrompt = `Hãy viết một lời chúc ngắn gọn, dễ thương, cảm động gửi tới ${recipient} (${relationship}) nhân dịp ${occasion}. 
    Yêu cầu:
    - Tiếng Việt
    - Ngắn dưới 50 từ
    - Tone giọng: dễ thương, ấm áp
    - Có biểu tượng cảm xúc
    - Nội dung cụ thể: ${prompt || "Chúc những điều tốt đẹp nhất"}
    `;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    res.json({ success: true, text });
  } catch (error) {
    console.error("Gemini Error:", error);
    const fallbackMessages = [
      `Chúc ${req.body.recipient} một dịp ${req.body.occasion} thật vui vẻ, hạnh phúc và tràn đầy ý nghĩa!`,
      `Gửi ngàn lời chúc tốt đẹp nhất đến ${req.body.recipient} nhân ngày ${req.body.occasion}. Mong bạn luôn vui vẻ!`,
      `Chúc ${req.body.recipient} ${req.body.occasion} ấm áp và nhiều niềm vui bên những người thân yêu.`
    ];
    const randomMsg = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
    
    res.status(200).json({
         success: true,
         text: randomMsg
    });
  }
};

// Sentiment Analysis for Reviews
export const analyzeSentiment = async (req, res) => {
  try {
    const { comment, rating } = req.body;

    if (!comment) {
      return res.status(400).json({ success: false, message: "Thiếu nội dung đánh giá" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Phân tích cảm xúc (sentiment analysis) cho đánh giá sản phẩm sau:

Đánh giá: "${comment}"
Số sao: ${rating || "không rõ"}/5

Hãy trả về JSON với format chính xác sau (không thêm markdown):
{
  "sentiment": "positive" hoặc "neutral" hoặc "negative",
  "score": số từ -1 (rất tiêu cực) đến 1 (rất tích cực),
  "summary": "tóm tắt ngắn gọn cảm xúc trong 10 từ",
  "needsAttention": true/false (true nếu khách hàng đang thất vọng hoặc cần hỗ trợ),
  "keywords": ["từ khóa cảm xúc 1", "từ khóa 2"]
}

Lưu ý:
- Nếu rating thấp (1-2 sao) hoặc có từ ngữ tiêu cực mạnh -> needsAttention: true
- Phân tích dựa trên ngữ cảnh tiếng Việt`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up response (remove markdown if any)
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    const analysis = JSON.parse(text);

    res.json({ 
      success: true, 
      data: {
        sentiment: analysis.sentiment,
        score: analysis.score,
        summary: analysis.summary,
        needsAttention: analysis.needsAttention,
        keywords: analysis.keywords
      }
    });
  } catch (error) {
    console.error("Sentiment Analysis Error:", error);
    
    // Fallback: simple analysis based on rating
    const rating = req.body.rating || 3;
    let sentiment = "neutral";
    let score = 0;
    let needsAttention = false;
    
    if (rating >= 4) {
      sentiment = "positive";
      score = 0.5 + (rating - 4) * 0.25;
    } else if (rating <= 2) {
      sentiment = "negative";
      score = -0.5 - (2 - rating) * 0.25;
      needsAttention = true;
    }

    res.json({
      success: true,
      data: {
        sentiment,
        score,
        summary: "Phân tích dựa trên số sao",
        needsAttention,
        keywords: []
      }
    });
  }
};

// Batch analyze multiple reviews
export const batchAnalyzeSentiment = async (req, res) => {
  try {
    const { reviews } = req.body;

    if (!reviews || !Array.isArray(reviews)) {
      return res.status(400).json({ success: false, message: "Cần mảng reviews" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const reviewsText = reviews.map((r, i) => `${i+1}. "${r.comment}" (${r.rating}/5 sao)`).join("\n");

    const prompt = `Phân tích cảm xúc cho các đánh giá sản phẩm sau:

${reviewsText}

Trả về JSON array với format (không thêm markdown):
[
  {"index": 0, "sentiment": "positive/neutral/negative", "score": -1 đến 1, "needsAttention": true/false},
  ...
]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    const analyses = JSON.parse(text);

    res.json({ success: true, data: analyses });
  } catch (error) {
    console.error("Batch Sentiment Error:", error);
    res.status(500).json({ success: false, message: "Lỗi phân tích", error: error.message });
  }
};

router.post("/generate", generateGreeting);
router.post("/sentiment", analyzeSentiment);
router.post("/sentiment/batch", batchAnalyzeSentiment);

// Visual Search - Analyze image and extract product keywords
export const visualSearch = async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, message: "Thiếu hình ảnh" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const prompt = `Phân tích hình ảnh này và xác định sản phẩm/vật phẩm chính trong ảnh.

Trả về JSON với format (không thêm markdown):
{
  "productType": "loại sản phẩm chính (ví dụ: túi xách, hộp quà, nến thơm, gấu bông...)",
  "keywords": ["từ khóa 1", "từ khóa 2", "từ khóa 3"],
  "colors": ["màu sắc 1", "màu sắc 2"],
  "style": "phong cách (ví dụ: vintage, hiện đại, dễ thương, sang trọng...)",
  "occasion": "dịp phù hợp (sinh nhật, valentine, tết, cảm ơn...)",
  "description": "mô tả ngắn gọn sản phẩm trong 20 từ",
  "searchQuery": "chuỗi tìm kiếm tốt nhất để tìm sản phẩm tương tự"
}

Lưu ý:
- Tập trung vào sản phẩm quà tặng, hộp quà, phụ kiện
- Sử dụng từ khóa tiếng Việt
- searchQuery nên ngắn gọn, dễ match với tên sản phẩm`;

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: "image/jpeg"
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    let text = response.text();
    
    // Clean up response
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    const analysis = JSON.parse(text);

    res.json({ 
      success: true, 
      data: analysis
    });
  } catch (error) {
    console.error("Visual Search Error:", error);
    
    // Check for rate limit error
    if (error.status === 429 || error.message?.includes("429")) {
      return res.status(429).json({ 
        success: false, 
        message: "Đã vượt quá giới hạn API. Vui lòng đợi 1 phút và thử lại.", 
        error: "RATE_LIMIT" 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Không thể phân tích hình ảnh. Vui lòng thử lại.", 
      error: error.message 
    });
  }
};

router.post("/visual-search", visualSearch);

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use("/api/gemini", router);

export default app;


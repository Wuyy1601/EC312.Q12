import { GoogleGenerativeAI } from "@google/generative-ai";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Initialize Gemini
const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDaT2kdraNYJuraoUCEzVffMEApMcCGnek";
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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

router.post("/generate", generateGreeting);

const app = express();
app.use(express.json());
app.use("/api/gemini", router);

export default app;

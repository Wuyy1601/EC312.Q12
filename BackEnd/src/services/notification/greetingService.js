import { GoogleGenerativeAI } from "@google/generative-ai";

// Khởi tạo Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Các mẫu lời chúc mặc định (fallback khi API lỗi)
const DEFAULT_GREETINGS = {
  birthday: [
    "Chúc bạn một ngày sinh nhật thật vui vẻ và đáng nhớ! Mong mọi điều tốt đẹp nhất sẽ đến với bạn trong năm mới tuổi này. 🎂",
    "Sinh nhật vui vẻ! Cầu chúc bạn luôn tràn đầy hạnh phúc, sức khỏe và thành công. Mãi yêu thương! 🎉",
    "Happy Birthday! Chúc bạn một tuổi mới thật nhiều niềm vui và may mắn! 🎈"
  ],
  anniversary: [
    "Chúc mừng kỷ niệm! Cảm ơn vì những khoảnh khắc tuyệt vời bên nhau. Mong tình yêu của chúng ta mãi bền vững! 💕",
    "Một năm nữa trôi qua, tình yêu của chúng ta ngày càng sâu đậm. Yêu em/anh nhiều! ❤️"
  ],
  christmas: [
    "Giáng sinh an lành! Chúc bạn và gia đình một mùa Noel ấm áp, tràn ngập tiếng cười! 🎄",
    "Merry Christmas! Mong những điều kỳ diệu sẽ đến với bạn trong mùa lễ này! 🎅"
  ],
  newyear: [
    "Chúc mừng năm mới! Chúc bạn một năm tràn đầy sức khỏe, hạnh phúc và thành công! 🎆",
    "Happy New Year! Mong năm mới mang đến cho bạn thật nhiều niềm vui và may mắn! 🎊"
  ],
  graduation: [
    "Chúc mừng tốt nghiệp! Bạn đã làm được rồi! Mong sự nghiệp của bạn sẽ rực rỡ như hôm nay! 🎓",
    "Xin chúc mừng! Đây là bước khởi đầu cho những thành công lớn hơn. Tự hào về bạn! 👏"
  ],
  other: [
    "Gửi đến bạn những lời chúc tốt đẹp nhất! Mong bạn luôn vui vẻ và hạnh phúc! 💝",
    "Chúc bạn thật nhiều niềm vui và may mắn! Luôn yêu thương! 🌟"
  ]
};

// Bản đồ quan hệ sang tiếng Việt để prompt AI
const RELATIONSHIP_MAP = {
  friend: "bạn bè",
  lover: "người yêu",
  family: "gia đình",
  colleague: "đồng nghiệp",
  other: "người quen"
};

// Bản đồ dịp sang tiếng Việt
const OCCASION_MAP = {
  birthday: "sinh nhật",
  anniversary: "kỷ niệm",
  christmas: "Giáng sinh",
  newyear: "năm mới",
  graduation: "tốt nghiệp",
  other: "tặng quà"
};

/**
 * Tạo lời chúc bằng Gemini AI
 * @param {string} recipientName - Tên người nhận
 * @param {string} relationship - Mối quan hệ (friend, lover, family, colleague, other)
 * @param {string} occasion - Dịp tặng quà (birthday, anniversary, christmas, newyear, graduation, other)
 * @returns {Promise<{success: boolean, greetings: string[], error?: string}>}
 */
export const generateGreetings = async (recipientName, relationship, occasion) => {
  try {
    // Validate input
    if (!recipientName || !relationship || !occasion) {
      throw new Error("Thiếu thông tin: tên người nhận, mối quan hệ hoặc dịp tặng quà");
    }

    // Kiểm tra API key
    if (!process.env.GEMINI_API_KEY) {
      console.warn("⚠️ GEMINI_API_KEY không được cấu hình, sử dụng lời chúc mặc định");
      return {
        success: true,
        greetings: getFallbackGreetings(occasion),
        source: "default"
      };
    }

    // Tạo prompt cho Gemini
    const relationshipVi = RELATIONSHIP_MAP[relationship] || relationship;
    const occasionVi = OCCASION_MAP[occasion] || occasion;
    
    const prompt = `Bạn là chuyên gia viết lời chúc tặng quà. Hãy viết 3 lời chúc khác nhau cho tình huống sau:

- Tên người nhận: ${recipientName}
- Mối quan hệ: ${relationshipVi}
- Dịp: ${occasionVi}

Yêu cầu:
1. Mỗi lời chúc từ 2-4 câu, chân thành và ý nghĩa
2. Phù hợp với mối quan hệ và dịp
3. Có thể thêm 1-2 emoji phù hợp
4. Ngôn ngữ: Tiếng Việt, tự nhiên, không quá formal
5. Không lặp lại ý tưởng giữa các lời chúc

Trả về CHÍNH XÁC theo format JSON sau (không thêm text khác):
{"greetings": ["lời chúc 1", "lời chúc 2", "lời chúc 3"]}`;

    console.log("🤖 Gọi Gemini API để tạo lời chúc...");
    
    // Gọi Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("📥 Gemini response:", text);

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*"greetings"[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Không thể parse response từ AI");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    if (!Array.isArray(parsed.greetings) || parsed.greetings.length < 2) {
      throw new Error("AI trả về không đủ lời chúc");
    }

    return {
      success: true,
      greetings: parsed.greetings,
      source: "gemini"
    };

  } catch (error) {
    console.error("❌ Lỗi tạo lời chúc:", error.message);
    
    // Fallback về lời chúc mặc định
    return {
      success: true,
      greetings: getFallbackGreetings(occasion),
      source: "default",
      warning: `Sử dụng lời chúc mặc định do: ${error.message}`
    };
  }
};

/**
 * Lấy lời chúc mặc định theo dịp
 */
function getFallbackGreetings(occasion) {
  const greetings = DEFAULT_GREETINGS[occasion] || DEFAULT_GREETINGS.other;
  // Trả về ít nhất 2 lời chúc
  return greetings.slice(0, Math.max(2, greetings.length));
}

export default {
  generateGreetings
};

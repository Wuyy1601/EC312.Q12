// Spirit Controller - Chat with AI Spirit using LangChain
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import spiritsData from "./spiritData.js";
import Product from "../product/models/product.model.js";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDaT2kdraNYJuraoUCEzVffMEApMcCGnek";

// Initialize LangChain ChatGoogleGenerativeAI
const createChatModel = () => {
  return new ChatGoogleGenerativeAI({
    modelName: "gemini-1.5-flash",
    apiKey: API_KEY,
    temperature: 0.8,
    maxOutputTokens: 600,
  });
};

// Get all spirits
export const getSpirits = async (req, res) => {
  try {
    const spirits = spiritsData.map(s => ({
      id: s.id,
      name: s.name,
      emoji: s.emoji,
      color: s.color,
      description: s.description,
      greeting: s.greeting
    }));
    
    res.json({ success: true, data: spirits });
  } catch (error) {
    console.error("Get spirits error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Analyze what info we have from chat history
const analyzeConversation = (chatHistory, currentMessage) => {
  const allMessages = [...chatHistory.map(m => m.content), currentMessage].join(' ').toLowerCase();
  
  // People patterns
  const recipientPatterns = {
    lover: /(bạn gái|người yêu|crush|vợ|chồng|ny|ng yêu|partner|lover)/i,
    family: /(mẹ|bố|ba|má|cha|ông|bà|bà ngoại|bà nội|ông ngoại|ông nội|anh|chị|em|con)/i,
    friend: /(bạn thân|bạn bè|friend|homie|bestie|chiến hữu)/i,
    colleague: /(đồng nghiệp|sếp|boss|nhân viên|đối tác)/i,
    teacher: /(thầy|cô|giáo viên|teacher|mentor)/i,
  };

  // Occasion patterns
  const occasionPatterns = {
    birthday: /(sinh nhật|birthday|bday|ngày sinh)/i,
    valentine: /(valentine|14\/2|lễ tình nhân)/i,
    anniversary: /(kỷ niệm|anniversary|năm yêu nhau)/i,
    womensday: /(8\/3|phụ nữ|women|20\/10)/i,
    christmas: /(giáng sinh|noel|christmas|25\/12)/i,
    newyear: /(năm mới|tết|new year)/i,
    graduation: /(tốt nghiệp|graduation|ra trường)/i,
    thanks: /(cảm ơn|thank|tri ân)/i,
    apology: /(xin lỗi|sorry|làm hòa|giận)/i,
    surprise: /(bất ngờ|surprise|không dịp gì)/i,
  };

  // Preference patterns
  const preferencePatterns = {
    flowers: /(hoa|flower|bó hoa|hoa hồng|hoa hướng dương)/i,
    chocolate: /(chocolate|sô cô la|socola|kẹo)/i,
    skincare: /(skincare|mỹ phẩm|kem|serum|dưỡng da|chăm sóc da)/i,
    perfume: /(nước hoa|perfume|cologne|thơm)/i,
    jewelry: /(trang sức|dây chuyền|vòng|nhẫn|jewelry)/i,
    teddy: /(gấu bông|teddy|thú bông|búp bê)/i,
    book: /(sách|book|đọc|truyện)/i,
    tech: /(công nghệ|tech|điện tử|game|gaming)/i,
    fashion: /(quần áo|thời trang|túi|ví|giày|fashion)/i,
    wellness: /(spa|massage|thư giãn|relax|wellness)/i,
  };

  // Budget patterns
  const budgetPatterns = {
    low: /(rẻ|tiết kiệm|dưới 200|100k|200k|ít tiền)/i,
    medium: /(tầm trung|300k|400k|500k|vừa phải)/i,
    high: /(cao cấp|đắt|triệu|xịn|premium|luxury)/i,
  };

  // Analyze
  const result = {
    recipient: null,
    occasion: null,
    preferences: [],
    budget: null,
    messageCount: chatHistory.filter(m => m.role === 'user').length + 1,
  };

  // Find recipient
  for (const [key, pattern] of Object.entries(recipientPatterns)) {
    if (pattern.test(allMessages)) {
      result.recipient = key;
      break;
    }
  }

  // Find occasion  
  for (const [key, pattern] of Object.entries(occasionPatterns)) {
    if (pattern.test(allMessages)) {
      result.occasion = key;
      break;
    }
  }

  // Find preferences (can have multiple)
  for (const [key, pattern] of Object.entries(preferencePatterns)) {
    if (pattern.test(allMessages)) {
      result.preferences.push(key);
    }
  }

  // Find budget
  for (const [key, pattern] of Object.entries(budgetPatterns)) {
    if (pattern.test(allMessages)) {
      result.budget = key;
      break;
    }
  }

  return result;
};

// Build system prompt based on conversation state - GUIDED FLOW
const buildSystemPrompt = (spirit, analysis) => {
  const { recipient, occasion, preferences, budget, messageCount } = analysis;
  
  // Determine current step in the guided flow
  // Step 1: Ask who they're buying for
  // Step 2: Ask about the occasion/reason
  // Step 3: Ask about preferences/hobbies
  // Step 4: Give emotional recommendations with stories
  
  let currentStep = 1;
  if (recipient) currentStep = 2;
  if (recipient && occasion) currentStep = 3;
  if (recipient && occasion && preferences.length > 0) currentStep = 4;
  if (recipient && (occasion || preferences.length > 0) && messageCount >= 3) currentStep = 4;
  
  const hasEnoughInfo = currentStep >= 4;
  
  // Base personality
  let systemPrompt = `Bạn là ${spirit.name} ${spirit.emoji} - một tinh linh tư vấn quà tặng AI thông minh và thấu hiểu cảm xúc.

## Tính cách của bạn:
${spirit.personality}

## QUAN TRỌNG - Phong cách dẫn dắt:
- Bạn là người DẪN DẮT cuộc trò chuyện, không chỉ trả lời
- Mỗi câu trả lời phải ĐỒNG CẢM với khách trước, rồi mới hỏi tiếp
- Hãy tạo cảm giác như đang tâm sự với bạn thân
- Xưng "mình" và gọi khách là "cậu"
- Dùng emoji ${spirit.emoji} thường xuyên
- Mỗi tin nhắn 2-3 câu thôi, ngắn gọn nhưng ấm áp

## Thông tin đã thu thập:
`;

  // Add known info
  const recipientNames = {
    lover: "người yêu/nửa kia", family: "gia đình", friend: "bạn bè",
    colleague: "đồng nghiệp/sếp", teacher: "thầy cô"
  };
  const occasionNames = {
    birthday: "sinh nhật", valentine: "Valentine", anniversary: "kỷ niệm",
    womensday: "ngày phụ nữ", christmas: "Giáng sinh", newyear: "Năm mới/Tết",
    graduation: "tốt nghiệp", thanks: "cảm ơn", apology: "xin lỗi/làm hòa",
    surprise: "bất ngờ"
  };
  const prefNames = {
    flowers: "hoa", chocolate: "chocolate", skincare: "skincare/mỹ phẩm",
    perfume: "nước hoa", jewelry: "trang sức", teddy: "gấu bông",
    book: "sách", tech: "công nghệ/game", fashion: "thời trang", wellness: "spa/wellness"
  };

  systemPrompt += recipient ? `✅ Người nhận: ${recipientNames[recipient]}\n` : `❌ Người nhận: chưa biết\n`;
  systemPrompt += occasion ? `✅ Dịp: ${occasionNames[occasion]}\n` : `❌ Dịp/Lý do: chưa biết\n`;
  systemPrompt += preferences.length > 0 ? `✅ Sở thích: ${preferences.map(p => prefNames[p]).join(", ")}\n` : `❌ Sở thích: chưa biết\n`;
  if (budget) systemPrompt += `✅ Ngân sách: ${budget === 'low' ? 'tiết kiệm' : budget === 'medium' ? 'tầm trung' : 'cao cấp'}\n`;

  // Add step-specific instructions
  systemPrompt += `\n## BƯỚC HIỆN TẠI: ${currentStep}/4\n\n`;
  
  switch(currentStep) {
    case 1:
      systemPrompt += `🎯 NHIỆM VỤ: Hỏi về NGƯỜI NHẬN quà

Gợi ý cách hỏi tự nhiên:
- "Ôi hay quá! ${spirit.emoji} Cho mình hỏi - cậu muốn tặng quà cho ai vậy? Người yêu, gia đình, bạn bè hay...?"
- "Dễ thương ghê! Vậy người đặc biệt đó là ai trong cuộc đời cậu nè?"

⚠️ KHÔNG hỏi thêm gì khác, chỉ tập trung vào câu hỏi này.`;
      break;
      
    case 2:
      systemPrompt += `� NHIỆM VỤ: Hỏi về DỊP hoặc LÝ DO tặng quà

Gợi ý cách hỏi tự nhiên (dựa vào người nhận đã biết):
- Nếu là người yêu: "Aww ${recipientNames[recipient]} thì dễ thương rồi! ${spirit.emoji} Có dịp gì đặc biệt không cậu? Sinh nhật, kỷ niệm, hay chỉ muốn surprise thôi~?"
- Nếu là gia đình: "${spirit.emoji} Tuyệt vời! Là dịp gì đặc biệt vậy cậu? Sinh nhật, lễ tết, hay đơn giản là muốn thể hiện tình cảm?"

⚠️ Phản hồi CẢM XÚC trước (khen, đồng cảm), rồi mới hỏi.`;
      break;
      
    case 3:
      systemPrompt += `🎯 NHIỆM VỤ: Khám phá SỞ THÍCH của người nhận

Gợi ý cách hỏi tự nhiên:
- "Hiểu rồi! ${spirit.emoji} Vậy ${recipientNames[recipient] || 'người ấy'} thường thích gì nhỉ? Ví dụ như hoa, skincare, đồ handmade, hay thứ gì đặc biệt?"
- "Hay quá! Cho mình biết thêm về sở thích của họ đi - họ thích phong cách nào: ngọt ngào, năng động, hay thanh lịch?"

⚠️ Phản hồi ĐỒNG CẢM với dịp/lý do trước, rồi mới hỏi về sở thích.`;
      break;
      
    case 4:
      systemPrompt += `🎯 NHIỆM VỤ: Đưa ra GỢI Ý QUÀ với CÂU CHUYỆN CẢM XÚC

Bạn PHẢI:
1. Tóm tắt nhanh: "Mình hiểu rồi! Tặng cho [người nhận] nhân dịp [dịp], người thích [sở thích]..."
2. Kể một CÂU CHUYỆN NGẮN về món quà phù hợp (2-3 câu), ví dụ:
   - "Mình từng giúp một bạn tặng set hoa kèm socola cho người yêu nhân Valentine. Cô bạn ấy kể lại là khi mở ra, đối phương đã khóc vì bất ngờ và hạnh phúc ${spirit.emoji}"
   - "Có một câu chuyện mình rất thích: một cậu tặng bundle chăm sóc da cho mẹ, ban đầu mẹ cằn nhằn 'tiền để dành đi'. Nhưng tối đó mẹ thử và gọi điện nói 'lâu lắm rồi mẹ không được chăm sóc bản thân như vậy'..."
3. Gợi ý 2-3 loại quà CỤ THỂ phù hợp
4. Mời xem tab 🎁 Quà: "Cậu qua tab 🎁 Quà bên cạnh để xem các bundle chi tiết nhé! Mình đã lọc sẵn những món phù hợp nhất rồi~"

⚠️ CÂU CHUYỆN phải chân thực, cảm động, liên quan đến hoàn cảnh của khách.`;
      break;
  }

  return { systemPrompt, hasEnoughInfo, currentStep };
};

// Chat with a spirit using LangChain
export const chatWithSpirit = async (req, res) => {
  try {
    const { spiritId, message, chatHistory = [] } = req.body;
    
    // Find spirit
    const spirit = spiritsData.find(s => s.id === spiritId);
    if (!spirit) {
      return res.status(404).json({ success: false, message: "Không tìm thấy tinh linh" });
    }

    // Analyze conversation to know what info we have
    const analysis = analyzeConversation(chatHistory, message);
    const { systemPrompt, hasEnoughInfo, currentStep } = buildSystemPrompt(spirit, analysis);

    console.log("📊 Analysis:", analysis);
    console.log("🎯 Current Step:", currentStep, "Ready to recommend:", hasEnoughInfo);

    try {
      // Create LangChain model
      const model = createChatModel();

      // Build messages array for LangChain
      const messages = [
        new SystemMessage(systemPrompt),
      ];

      // Add chat history (last 10 messages)
      chatHistory.slice(-10).forEach(msg => {
        if (msg.role === 'user') {
          messages.push(new HumanMessage(msg.content));
        } else {
          // Clean spirit emoji prefix if exists
          const content = msg.content.replace(/^[❤️💕🌈🎉💗🙏💚🔥🕊️📚✨🌙🌸💮]+\s*/i, '');
          messages.push(new AIMessage(content));
        }
      });

      // Add current message
      messages.push(new HumanMessage(message));

      // Invoke the model
      const response = await model.invoke(messages);
      let text = response.content;
      
      // Clean up response
      text = text.replace(new RegExp(`^${spirit.name}:?\\s*`, 'i'), '').trim();
      text = text.replace(/^[❤️💕🌈🎉💗🙏💚🔥🕊️📚✨🌙🌸💮]+\s*:?\s*/i, '').trim();

      // Add emoji prefix if not present
      if (!text.startsWith(spirit.emoji)) {
        text = `${spirit.emoji} ${text}`;
      }

      res.json({ 
        success: true, 
        data: {
          message: text,
          spiritId: spirit.id,
          spiritName: spirit.name,
          spiritEmoji: spirit.emoji,
          readyToRecommend: hasEnoughInfo,
          currentStep: currentStep,
          analysis: analysis
        }
      });
    } catch (aiError) {
      console.error("LangChain/Gemini API error:", aiError.message);
      
      // Smart fallback based on analysis
      let fallbackResponse;
      
      if (hasEnoughInfo) {
        fallbackResponse = `${spirit.emoji} Mình đã hiểu rồi! Dựa vào những gì cậu chia sẻ, mình nghĩ có vài bundle quà rất phù hợp đấy! Cậu xem tab 🎁 Quà bên cạnh để chọn bundle ưng ý nhé~`;
      } else if (!analysis.recipient) {
        fallbackResponse = `${spirit.emoji} Hay quá! Cho mình hỏi - cậu muốn tặng quà cho ai vậy? Người yêu, gia đình hay bạn bè?`;
      } else if (!analysis.occasion && analysis.preferences.length === 0) {
        const recipientNames = {
          lover: "người ấy", family: "họ", friend: "bạn ấy",
          colleague: "họ", teacher: "thầy/cô"
        };
        fallbackResponse = `${spirit.emoji} Tuyệt vời! Vậy ${recipientNames[analysis.recipient] || "họ"} thích gì nhỉ? Hoa, chocolate, skincare hay thứ gì khác?`;
      } else {
        fallbackResponse = `${spirit.emoji} Mình hiểu rồi! Để gợi ý quà phù hợp nhất, cho mình biết thêm: đây là dịp gì vậy?`;
      }
      
      res.json({
        success: true,
        data: {
          message: fallbackResponse,
          spiritId: spirit.id,
          spiritName: spirit.name,
          spiritEmoji: spirit.emoji,
          readyToRecommend: hasEnoughInfo,
          analysis: analysis
        }
      });
    }
  } catch (error) {
    console.error("Chat with spirit error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Smart keyword mapping for gift filtering based on chat analysis
const RECIPIENT_KEYWORDS = {
  lover: ["romantic", "couple", "love", "valentine", "tình yêu", "lãng mạn", "hẹn hò", "anniversary"],
  family: ["family", "gia đình", "mẹ", "bố", "cha", "mẹ"],
  friend: ["bestie", "friend", "bạn bè", "party", "fun", "vui"],
  colleague: ["professional", "thanh lịch", "công sở", "sếp"],
  teacher: ["teacher", "gratitude", "cảm ơn", "tri ân", "thầy cô"]
};

const OCCASION_KEYWORDS = {
  birthday: ["birthday", "sinh nhật", "party", "celebration"],
  valentine: ["valentine", "romantic", "love", "couple", "tình yêu"],
  anniversary: ["anniversary", "kỷ niệm", "romantic", "love"],
  womensday: ["women", "phụ nữ", "8/3", "20/10", "care", "beauty"],
  christmas: ["christmas", "giáng sinh", "noel", "holiday"],
  newyear: ["new year", "tết", "năm mới", "holiday"],
  graduation: ["graduation", "tốt nghiệp", "congrats", "success"],
  thanks: ["thank", "cảm ơn", "gratitude", "tri ân"],
  apology: ["sorry", "xin lỗi", "làm hòa", "care"],
  surprise: ["surprise", "bất ngờ", "magic", "special"]
};

const PREFERENCE_KEYWORDS = {
  flowers: ["hoa", "flower", "rose", "bó hoa"],
  chocolate: ["chocolate", "socola", "kẹo", "ngọt"],
  skincare: ["skincare", "mỹ phẩm", "dưỡng da", "serum", "kem", "beauty"],
  perfume: ["nước hoa", "perfume", "thơm", "fragrance"],
  jewelry: ["trang sức", "jewelry", "vòng", "nhẫn", "dây chuyền"],
  teddy: ["gấu bông", "teddy", "thú bông", "cute"],
  book: ["sách", "book", "wisdom", "đọc"],
  tech: ["tech", "công nghệ", "game", "gadget"],
  fashion: ["thời trang", "fashion", "túi", "ví", "giày"],
  wellness: ["spa", "wellness", "relax", "thư giãn", "massage"]
};

const BUDGET_RANGES = {
  low: { min: 0, max: 300000 },
  medium: { min: 200000, max: 700000 },
  high: { min: 500000, max: 99999999 }
};

// Story templates for different scenarios
const BUNDLE_STORIES = {
  // By preference type
  flowers: [
    "Có bạn từng tặng bó hoa này cho mẹ nhân ngày 20/10. Mẹ bạn ấy cầm bó hoa, mắt rưng rưng nói 'Lớn rồi mà vẫn nhớ mẹ' 💕",
    "Một cô gái từng nhận được bundle hoa này từ người yêu. Cô ấy kể, mỗi lần nhìn thấy hoa, lại nhớ cảm giác được yêu thương~",
    "Bạn biết không, hoa tươi có thể làm cả một ngày tồi tệ trở nên tươi sáng. Đó là điều mình thấy ở những người nhận món quà này 🌸"
  ],
  skincare: [
    "Mình từng giúp một bạn trai tặng set skincare cho người yêu. Ban đầu lo cô ấy không thích, kết quả là cô ấy dùng suốt và da đẹp hẳn lên! Giờ cứ ai hỏi là cô ấy khoe 'của anh tặng' 💕",
    "Một khách từng nói với mình: 'Mẹ em cả đời chăm lo cho cả nhà, chưa bao giờ mua gì cho bản thân'. Set dưỡng da này như lời nhắn: Mẹ cũng xứng đáng được chăm sóc 🥹",
    "Skincare là cách nói 'mình muốn bạn xinh đẹp và tự tin' mà không cần nói ra. Đó là message ẩn sau món quà này~"
  ],
  chocolate: [
    "Socola + hoa = combo classic không bao giờ sai! Một bạn từng tặng combo này cho crush, và câu trả lời là... 'Em cũng thích anh' 😍",
    "Có câu chuyện dễ thương lắm: một bạn tặng socola cho bà ngoại vì bà thích ăn ngọt. Bà chia cho cả xóm rồi khoe 'cháu tôi gửi từ thành phố về đấy!' 💝",
    "Ngọt ngào như tình yêu vậy đó! Món quà này đã kết nối biết bao trái tim rồi~"
  ],
  teddy: [
    "Bạn biết gấu bông có điều kỳ diệu gì không? Nó có thể ôm thay bạn khi bạn không ở bên. Một cô gái từng kể cô ôm gấu mỗi đêm vì nhớ người yêu đi xa 🧸",
    "Có bạn tặng gấu bông kèm thiệp viết 'Khi nào buồn thì ôm em ấy nhé'. Người nhận giữ cả gấu lẫn thiệp đến tận bây giờ~",
    "Không cần lý do đặc biệt để tặng gấu bông. Chỉ cần nói 'mình nhớ bạn' là đủ rồi 💕"
  ],
  wellness: [
    "Self-care là yêu thương bản thân. Một người mẹ từng khóc khi nhận set spa này vì 'lâu lắm rồi không ai nghĩ đến việc mẹ cần được nghỉ ngơi' 🥹",
    "Có bạn tặng set thư giãn cho đồng nghiệp stress quá. Sau đó người ta nói 'Cảm ơn, lâu rồi mới ngủ ngon vậy'. Đôi khi caring đơn giản vậy thôi~",
    "Wellness không chỉ là sản phẩm, mà là message: 'Mình muốn bạn yêu thương bản thân hơn' 💆‍♀️"
  ],
  // By occasion
  birthday: [
    "Sinh nhật là ngày đặc biệt - ngày duy nhất trong năm thuộc về riêng họ. Bundle này sẽ làm ngày đó thêm đáng nhớ! 🎂",
    "Một bạn từng order bundle này cho BFF. Tối sinh nhật, cả hai ngồi unbox và khóc vì hạnh phúc. Best birthday ever mà! 🎉",
    "Mình tin rằng quà sinh nhật không cần đắt tiền, chỉ cần cho thấy bạn HIỂU người ấy. Đó là điều quý nhất~"
  ],
  valentine: [
    "Valentine là nói 'yêu' bằng quà tặng. Có cặp từng chia tay vì Valentine không nhớ tặng gì... Nhưng cũng có cặp quay lại vì một món quà simple nhưng đầy ý nghĩa 💕",
    "Mình từng thấy một bạn trai lo lắng tặng gì cho người yêu. Cuối cùng bundle này giúp bạn ấy, và tin nhắn sau đó là: 'Em thích lắm!' + 100 trái tim 😍",
    "Tình yêu đôi khi cần được thể hiện. Đây là cách bạn nói 'em quan trọng với anh' mà không cần nhiều lời~"
  ],
  thanks: [
    "Cảm ơn không cần lý do lớn lao. Một bạn tặng bundle này cho mẹ chỉ để nói 'Con yêu mẹ'. Mẹ bạn ấy cất giữ cả cái card cho đến giờ 🥹",
    "Tri ân thầy cô bằng món quà thực sự ý nghĩa. Nhiều thầy cô nói với mình: 'Không cần đắt tiền, chỉ cần biết các em vẫn nhớ là vui rồi'~",
    "Đôi khi một lời cảm ơn đi kèm món quà nhỏ có thể thay đổi cả một ngày của ai đó 💝"
  ],
  // Generic fallback
  generic: [
    "Mỗi món quà đều kể một câu chuyện. Và câu chuyện của bundle này sẽ được viết bởi cậu và người nhận~",
    "Không có món quà hoàn hảo, chỉ có tấm lòng hoàn hảo. Mình tin người nhận sẽ cảm nhận được tình cảm của cậu 💕",
    "Quà tặng là cách nói 'mình nghĩ về bạn' mà không cần mở lời. Đó là lý do nó đặc biệt~"
  ]
};

// Generate story for a bundle based on context
const generateBundleStory = (bundle, recipient, occasion, preferences) => {
  const bundleText = `${bundle.name} ${bundle.description || ''}`.toLowerCase();
  
  // Try to match by preference
  for (const pref of (preferences || '').split(',')) {
    if (BUNDLE_STORIES[pref]) {
      const stories = BUNDLE_STORIES[pref];
      return stories[Math.floor(Math.random() * stories.length)];
    }
  }
  
  // Try to match by bundle content
  if (bundleText.includes('hoa') || bundleText.includes('flower')) {
    const stories = BUNDLE_STORIES.flowers;
    return stories[Math.floor(Math.random() * stories.length)];
  }
  if (bundleText.includes('skincare') || bundleText.includes('dưỡng') || bundleText.includes('kem')) {
    const stories = BUNDLE_STORIES.skincare;
    return stories[Math.floor(Math.random() * stories.length)];
  }
  if (bundleText.includes('socola') || bundleText.includes('chocolate')) {
    const stories = BUNDLE_STORIES.chocolate;
    return stories[Math.floor(Math.random() * stories.length)];
  }
  if (bundleText.includes('gấu') || bundleText.includes('teddy') || bundleText.includes('thú bông')) {
    const stories = BUNDLE_STORIES.teddy;
    return stories[Math.floor(Math.random() * stories.length)];
  }
  if (bundleText.includes('spa') || bundleText.includes('thư giãn') || bundleText.includes('relax')) {
    const stories = BUNDLE_STORIES.wellness;
    return stories[Math.floor(Math.random() * stories.length)];
  }
  
  // Try to match by occasion
  if (occasion && BUNDLE_STORIES[occasion]) {
    const stories = BUNDLE_STORIES[occasion];
    return stories[Math.floor(Math.random() * stories.length)];
  }
  
  // Fallback to generic
  const genericStories = BUNDLE_STORIES.generic;
  return genericStories[Math.floor(Math.random() * genericStories.length)];
};

// Get bundles recommended by a spirit - WITH SMART FILTERING
export const getSpiritBundles = async (req, res) => {
  try {
    const { spiritId } = req.params;
    // Get analysis from query params (sent by frontend after chat)
    const { recipient, occasion, preferences, budget } = req.query;
    
    const spirit = spiritsData.find(s => s.id === spiritId);
    if (!spirit) {
      return res.status(404).json({ success: false, message: "Không tìm thấy tinh linh" });
    }

    console.log("🎁 Filtering bundles with:", { recipient, occasion, preferences, budget });

    // Build query based on budget
    let query = { 
      isBundle: true,
      isActive: true
    };

    // Add price filter if budget specified
    if (budget && BUDGET_RANGES[budget]) {
      query.price = {
        $gte: BUDGET_RANGES[budget].min,
        $lte: BUDGET_RANGES[budget].max
      };
    }

    // Priority 1: Find bundles explicitly assigned to this spirit
    const explicitBundles = await Product.find({
      isBundle: true,
      isActive: true,
      spiritType: spiritId
    });

    // Priority 2: Find bundles by keywords (as fallback/supplement)
    // Exclude ones we already found
    const explicitIds = explicitBundles.map(b => b._id);
    
    const keywordQuery = { ...query };
    keywordQuery._id = { $nin: explicitIds }; // Exclude found
    
    const keywordBundles = await Product.find(keywordQuery).limit(20);
    
    // Combine lists
    let bundles = [...explicitBundles, ...keywordBundles];

    if (bundles.length === 0) {
      // Emergency fallback if absolutely nothing found
      const fallbackQuery = { isBundle: true, isActive: true };
      if (explicitIds.length > 0) fallbackQuery._id = { $nin: explicitIds };
      
      const fallbackBundles = await Product.find(fallbackQuery).limit(10);
      bundles = [...explicitBundles, ...fallbackBundles];
    }

    if (bundles.length === 0) {
      // Fallback: try without price filter
      delete query.price;
      const fallbackBundles = await Product.find(query).limit(10);
      return res.json({
        success: true,
        data: {
          spirit: { id: spirit.id, name: spirit.name, emoji: spirit.emoji, color: spirit.color },
          bundles: fallbackBundles.slice(0, 6),
          filterApplied: false
        }
      });
    }

    // Score bundles based on analysis
    const scoredBundles = bundles.map(bundle => {
      let score = 0;
      
      // HUGE BONUS for explicit spirit match
      if (bundle.spiritType === spiritId) {
        score += 500; // Almost guarantees top spots
      }

      const bundleText = `${bundle.name} ${bundle.description || ''} ${(bundle.tags || []).join(' ')}`.toLowerCase();
      
      // Score by spirit keywords (base score)
      if (spirit.bundleKeywords) {
        spirit.bundleKeywords.forEach(keyword => {
          if (bundleText.includes(keyword.toLowerCase())) {
            score += 5;
          }
        });
      }

      // Score by RECIPIENT match (+20 points for strong match)
      if (recipient && RECIPIENT_KEYWORDS[recipient]) {
        RECIPIENT_KEYWORDS[recipient].forEach(keyword => {
          if (bundleText.includes(keyword.toLowerCase())) {
            score += 20;
          }
        });
      }

      // Score by OCCASION match (+25 points - highest priority)
      if (occasion && OCCASION_KEYWORDS[occasion]) {
        OCCASION_KEYWORDS[occasion].forEach(keyword => {
          if (bundleText.includes(keyword.toLowerCase())) {
            score += 25;
          }
        });
      }

      // Score by PREFERENCES match (+15 points each)
      if (preferences) {
        const prefList = preferences.split(',');
        prefList.forEach(pref => {
          if (PREFERENCE_KEYWORDS[pref]) {
            PREFERENCE_KEYWORDS[pref].forEach(keyword => {
              if (bundleText.includes(keyword.toLowerCase())) {
                score += 15;
              }
            });
          }
        });
      }

      // Small randomness for variety (max 3 points)
      score += Math.random() * 3;
      
      return { bundle, score };
    });

    // Sort by score descending
    scoredBundles.sort((a, b) => b.score - a.score);
    
    // Return top 6 bundles with stories
    const recommendedBundles = scoredBundles.slice(0, 6).map(item => {
      const bundleObj = item.bundle.toObject ? item.bundle.toObject() : item.bundle;
      return {
        ...bundleObj,
        story: generateBundleStory(item.bundle, recipient, occasion, preferences)
      };
    });

    console.log("🎯 Top bundle scores:", scoredBundles.slice(0, 6).map(s => ({ name: s.bundle.name, score: s.score.toFixed(1) })));

    res.json({
      success: true,
      data: {
        spirit: {
          id: spirit.id,
          name: spirit.name,
          emoji: spirit.emoji,
          color: spirit.color
        },
        bundles: recommendedBundles,
        filterApplied: !!(recipient || occasion || preferences || budget),
        analysis: { recipient, occasion, preferences, budget }
      }
    });
  } catch (error) {
    console.error("Get spirit bundles error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

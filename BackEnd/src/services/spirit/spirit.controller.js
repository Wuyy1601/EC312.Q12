// Spirit Controller - Chat with AI Spirit using LangChain
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import spiritsData from "./spiritData.js";
import trainingExamples from "./trainingExamples.js";
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
  // Step 3: Ask about preferences/hobbies (REQUIRED before recommending)
  // Step 4: Give recommendations with products
  
  let currentStep = 1;
  if (recipient) currentStep = 2; // Got recipient, ask occasion
  if (recipient && occasion) currentStep = 3; // Got occasion, ask preferences
  
  // ONLY go to step 4 when:
  // 1. We have recipient + occasion + preferences AND
  // 2. At least 4 messages exchanged (to ensure we actually asked about preferences)
  if (recipient && occasion && preferences.length > 0 && messageCount >= 4) {
    currentStep = 4;
  }
  // Fallback: after 7+ messages, give recommendations even if missing some info
  if (messageCount >= 7 && recipient) currentStep = 4;
  
  const hasEnoughInfo = currentStep >= 4;
  
  // Get random training examples for this spirit
  const spiritExamples = trainingExamples[spirit.id] || [];
  const randomExamples = spiritExamples.sort(() => Math.random() - 0.5).slice(0, 3);
  
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

## VÍ DỤ CÁCH TRẢ LỜI (học theo phong cách này):
${randomExamples.map((ex, i) => `${i+1}. Khách: "${ex.user}" → Bạn: "${ex.spirit}"`).join('\n')}

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
      systemPrompt += `🎯 NHIỆM VỤ BẮT BUỘC: HỎI VỀ SỞ THÍCH của người nhận

⛔ TUYỆT ĐỐI KHÔNG được gợi ý sản phẩm ở bước này!
⛔ CHƯA đủ thông tin để gợi ý!

Bạn PHẢI hỏi về sở thích TRƯỚC KHI gợi ý bất cứ thứ gì:
- "Hiểu rồi! ${spirit.emoji} Vậy ${recipientNames[recipient] || 'người ấy'} thường thích gì nhỉ? Hoa, skincare, nến thơm, hay thứ gì khác?"
- "Hay quá! ${spirit.emoji} Cho mình biết thêm - họ thích phong cách nào: ngọt ngào, đơn giản, hay sang trọng?"

⚠️ CHỈ được hỏi về SỞ THÍCH. Phản hồi đồng cảm với dịp trước, rồi HỎI.`;
      break;
      
    case 4:
      systemPrompt += `🎯 NHIỆM VỤ: Đưa ra GỢI Ý QUÀ CỤ THỂ

Bạn PHẢI làm theo thứ tự:
1. Tóm tắt: "Mình hiểu rồi! ${spirit.emoji} Tặng cho [người nhận], người thích [sở thích]..."
2. Kể CÂU CHUYỆN NGẮN (2 câu) về ai đó tặng quà tương tự và cảm xúc người nhận
3. Nếu có sản phẩm gợi ý ở dưới, hãy đề cập TÊN CỤ THỂ và GIÁ của từng sản phẩm
4. Hỏi: "Cậu thích món nào không?"

⚠️ QUAN TRỌNG:
- Phải đề cập TÊN SẢN PHẨM cụ thể nếu có trong danh sách
- Kể chuyện phải LIÊN QUAN đến hoàn cảnh khách
- Nếu không có sản phẩm gợi ý, hãy hỏi thêm về sở thích để gợi ý chính xác hơn`;
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

    // ONLY fetch products when we have ALL info (step 4)
    let recommendedProducts = [];
    if (hasEnoughInfo) {
      try {
        // ONLY get bundles that belong to THIS spirit
        const allProducts = await Product.find({ 
          isActive: true,
          isBundle: true,
          spiritType: spiritId  // Only bundles assigned to this spirit
        }).limit(20);
        
        console.log(`🎁 Found ${allProducts.length} bundles for spirit ${spiritId}`);
        
        // Expanded keywords for better matching
        const preferenceKeywords = {
          flowers: ['hoa', 'flower', 'rose', 'bó hoa', 'hoa hồng'],
          chocolate: ['chocolate', 'socola', 'kẹo', 'candy'],
          skincare: ['skincare', 'mỹ phẩm', 'dưỡng', 'serum', 'kem', 'mặt nạ'],
          perfume: ['nước hoa', 'perfume', 'thơm'],
          jewelry: ['trang sức', 'vòng', 'nhẫn', 'dây chuyền'],
          teddy: ['gấu bông', 'teddy', 'thú nhồi', 'gấu'],
          book: ['sách', 'book', 'truyện'],
          tech: ['tech', 'công nghệ', 'game', 'gaming'],
          fashion: ['thời trang', 'túi', 'ví', 'khăn'],
          wellness: ['spa', 'wellness', 'relax', 'thư giãn', 'yên', 'peace'],
          candle: ['nến', 'nến thơm', 'candle', 'thông', 'tinh dầu'],
          tea: ['trà', 'tea', 'cà phê', 'coffee'],
          handmade: ['handmade', 'thủ công', 'tự làm'],
          art: ['art', 'tranh', 'vẽ', 'painting']
        };
        
        // Score products based on preferences
        const scoredProducts = allProducts.map(product => {
          let score = 0;
          const productText = `${product.name} ${product.description || ''} ${(product.tags || []).join(' ')}`.toLowerCase();
          
          // Match preferences from user
          if (analysis.preferences.length > 0) {
            analysis.preferences.forEach(pref => {
              // Check direct keyword match first
              if (productText.includes(pref.toLowerCase())) {
                score += 50; // High bonus for direct match
              }
              // Check mapped keywords
              if (preferenceKeywords[pref]) {
                preferenceKeywords[pref].forEach(kw => {
                  if (productText.includes(kw.toLowerCase())) score += 30;
                });
              }
              // Also check all categories for partial match
              Object.values(preferenceKeywords).flat().forEach(kw => {
                if (pref.toLowerCase().includes(kw) || kw.includes(pref.toLowerCase())) {
                  if (productText.includes(kw)) score += 20;
                }
              });
            });
          }
          
          // Match occasion keywords
          const occasionKeywords = {
            birthday: ['sinh nhật', 'birthday'],
            valentine: ['valentine', 'tình yêu', 'love'],
            anniversary: ['kỷ niệm', 'anniversary'],
            womensday: ['phụ nữ', '8/3', '20/10'],
            thanks: ['cảm ơn', 'thank']
          };
          if (analysis.occasion && occasionKeywords[analysis.occasion]) {
            occasionKeywords[analysis.occasion].forEach(kw => {
              if (productText.includes(kw)) score += 15;
            });
          }
          
          return { product, score };
        });
        
        // Sort by score
        scoredProducts.sort((a, b) => b.score - a.score);
        
        // Get products with score > 0 (matched preferences)
        const matchedProducts = scoredProducts.filter(s => s.score > 0);
        
        // If we have matched products, use them. Otherwise show all spirit bundles
        const productsToShow = matchedProducts.length > 0 
          ? matchedProducts.slice(0, 3) 
          : scoredProducts.slice(0, 3);
        
        recommendedProducts = productsToShow.map(s => ({
          _id: s.product._id,
          name: s.product.name,
          price: s.product.price,
          image: s.product.image,
          description: s.product.description?.substring(0, 100),
          isBundle: s.product.isBundle,
          bundleItems: s.product.bundleItems, // Include for modal
          score: s.score
        }));
        
        console.log("🎁 Recommended products:", recommendedProducts.map(p => `${p.name} (score: ${p.score})`));
      } catch (dbError) {
        console.error("Error fetching products:", dbError);
      }
    }

    // Build enhanced system prompt with product info if available
    let enhancedPrompt = systemPrompt;
    if (recommendedProducts.length > 0 && hasEnoughInfo) {
      enhancedPrompt += `

## SẢN PHẨM GỢI Ý (LẤY TỪ DATABASE):
${recommendedProducts.map((p, i) => `${i+1}. "${p.name}" - ${p.price?.toLocaleString()}đ ${p.isBundle ? '(Bundle)' : ''}`).join('\n')}

⚠️ BẮT BUỘC: Khi gợi ý quà, hãy đề cập TÊN CỤ THỂ của sản phẩm ở trên. Ví dụ:
"Mình gợi ý cho cậu **${recommendedProducts[0]?.name}** - ${recommendedProducts[0]?.price?.toLocaleString()}đ..."`;
    }

    try {
      // Create LangChain model
      const model = createChatModel();

      // Build messages array for LangChain
      const messages = [
        new SystemMessage(enhancedPrompt),
      ];

      // Add chat history (last 10 messages)
      chatHistory.slice(-10).forEach(msg => {
        if (!msg || !msg.content) return; // Skip invalid messages
        
        if (msg.role === 'user') {
          messages.push(new HumanMessage(msg.content));
        } else {
          const content = (msg.content || "").replace(/^[❤️💕🌈🎉💗🙏💚🔥🕊️📚✨🌙🌸💮]+\s*/i, '');
          if (content) {
            messages.push(new AIMessage(content));
          }
        }
      });

      // Add current message
      messages.push(new HumanMessage(message));

      // Invoke the model
      const response = await model.invoke(messages);
      let text = response?.content || "";
      
      // Handle if content is not a string
      if (typeof text !== 'string') {
        text = String(text);
      }
      
      // Clean up response
      if (text) {
        text = text.replace(new RegExp(`^${spirit.name}:?\\s*`, 'i'), '').trim();
        text = text.replace(/^[❤️💕🌈🎉💗🙏💚🔥🕊️📚✨🌙🌸💮]+\s*:?\s*/i, '').trim();
      }

      // Add emoji prefix if not present
      if (!text || !text.startsWith(spirit.emoji)) {
        text = `${spirit.emoji} ${text || "Mình đang suy nghĩ..."}`;
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
          analysis: analysis,
          // NEW: Include recommended products directly in response
          recommendedProducts: hasEnoughInfo ? recommendedProducts : []
        }
      });
    } catch (aiError) {
      console.error("LangChain/Gemini API error:", aiError.message);
      
      // Smart fallback based on current step
      let fallbackResponse;
      
      if (hasEnoughInfo && recommendedProducts.length > 0) {
        fallbackResponse = `${spirit.emoji} Mình hiểu rồi! Dựa vào những gì cậu chia sẻ, mình gợi ý:\n\n` +
          recommendedProducts.map((p, i) => `${i+1}. **${p.name}** - ${p.price?.toLocaleString()}đ`).join('\n') +
          `\n\nCậu thấy món nào phù hợp không?`;
      } else if (currentStep === 1 || !analysis.recipient) {
        // Step 1: Ask for recipient
        fallbackResponse = `${spirit.emoji} Hay quá! Cho mình hỏi - cậu muốn tặng quà cho ai vậy? Người yêu, gia đình hay bạn bè?`;
      } else if (currentStep === 2 || !analysis.occasion) {
        // Step 2: Ask for occasion
        const recipientNames = {
          lover: "người ấy", family: "gia đình", friend: "bạn ấy",
          colleague: "đồng nghiệp", teacher: "thầy/cô"
        };
        fallbackResponse = `${spirit.emoji} Tuyệt! Tặng cho ${recipientNames[analysis.recipient] || "họ"} nhân dịp gì vậy? Sinh nhật, lễ tết, hay không dịp gì đặc biệt?`;
      } else if (currentStep === 3) {
        // Step 3: Ask for preferences - ALWAYS ask even if detected earlier
        fallbackResponse = `${spirit.emoji} Hay đó! Vậy họ thường thích gì nhỉ? Hoa, nến thơm, skincare, hay thứ gì khác?`;
      } else {
        fallbackResponse = `${spirit.emoji} Mình đang nghĩ... Cho mình thêm chút thời gian nhé~`;
      }
      
      res.json({
        success: true,
        data: {
          message: fallbackResponse,
          spiritId: spirit.id,
          spiritName: spirit.name,
          spiritEmoji: spirit.emoji,
          readyToRecommend: hasEnoughInfo,
          analysis: analysis,
          recommendedProducts: hasEnoughInfo ? recommendedProducts : []
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

// Note: Stories now come from the database `story` field on each product/bundle

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
    
    // Return top 6 bundles (stories come from database)
    const recommendedBundles = scoredBundles.slice(0, 6).map(item => {
      const bundleObj = item.bundle.toObject ? item.bundle.toObject() : item.bundle;
      return bundleObj;
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

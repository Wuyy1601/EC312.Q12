// Training Script - Test all spirits with various scenarios
// Run: node src/services/spirit/trainSpirits.js

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import spiritsData from "./spiritData.js";
import trainingExamples from "./trainingExamples.js";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

const createChatModel = () => {
  return new ChatGoogleGenerativeAI({
    modelName: "gemini-1.5-flash",
    apiKey: API_KEY,
    temperature: 0.8,
    maxOutputTokens: 600,
  });
};

// Test scenarios - 100 different customer questions
const testScenarios = [
  // Love/Romance
  "Mình muốn tặng quà cho bạn gái",
  "Valentine này tặng gì cho ny?",
  "Kỷ niệm 2 năm yêu nhau nên tặng gì?",
  "Làm hòa với người yêu sau khi cãi nhau",
  "Tặng quà cầu hôn",
  "Crush thích hoa và chocolate",
  "Người yêu thích mỹ phẩm",
  "Vợ sắp sinh con đầu lòng",
  "Tặng quà cho chồng nhân ngày 20/10",
  "Muốn surprise người yêu",
  
  // Family
  "Tặng quà sinh nhật mẹ",
  "Bố thích đồ công nghệ",
  "Tết này tặng gì cho ông bà?",
  "Mẹ bị ốm, muốn tặng gì đó",
  "Sinh nhật em gái 16 tuổi",
  "Cảm ơn bố mẹ nuôi dưỡng",
  "Bà ngoại 80 tuổi",
  "Anh trai sắp cưới",
  "Chị gái vừa sinh bé",
  "Con đi du học xa",
  
  // Friends
  "Sinh nhật bạn thân năm nay",
  "Bạn thích chơi game",
  "Bestie thích skincare",
  "Tặng quà chia tay bạn đi nước ngoài",
  "Bạn vừa chia tay người yêu",
  "Homie thích đá bóng",
  "Bạn văn phòng thích minimalist",
  "Nhóm bạn 5 người, mỗi người 300k",
  "Bạn thân tốt nghiệp",
  "Bạn mới quen crush",
  
  // Colleagues/Professional
  "Tặng quà sếp nhân dịp sinh nhật",
  "Đồng nghiệp nghỉ việc",
  "Team 10 người cần quà tết",
  "Sếp nữ thích spa",
  "Nhân viên mới vào công ty",
  "Đối tác quan trọng",
  "Mentor đã giúp đỡ nhiều",
  "Thăng chức cần cảm ơn team",
  "Khách hàng VIP",
  "Giáo viên dạy con",
  
  // Teachers/Gratitude
  "Ngày 20/11 tặng cô giáo",
  "Cảm ơn thầy đã dạy dỗ",
  "Cô giáo mầm non của con",
  "Giảng viên đại học hướng dẫn luận văn",
  "Thầy dạy piano",
  "Cô dạy tiếng Anh",
  "Thầy sắp về hưu",
  "Tri ân thầy cô cũ",
  "Cô chủ nhiệm cấp 3",
  "Thầy fitness trainer",
  
  // Special Occasions
  "Đám cưới bạn thân",
  "Baby shower cho đồng nghiệp",
  "Housewarming party",
  "Khai trương cửa hàng bạn",
  "Tốt nghiệp đại học",
  "Thăng chức mừng bạn",
  "Giáng sinh cho cả nhà",
  "Năm mới tặng gia đình",
  "8/3 tặng các chị em",
  "Trung thu cho trẻ con",
  
  // Wellness/Care
  "Bạn đang stress công việc",
  "Mẹ cần thư giãn nghỉ ngơi",
  "Người thân phục hồi sau phẫu thuật",
  "Bạn bị insomnia khó ngủ",
  "Đồng nghiệp burnout",
  "Người thân có vấn đề sức khỏe",
  "Set detox cho bạn thích healthy",
  "Spa package cho vợ",
  "Wellness box cho người già",
  "Self-care cho single mom",
  
  // Creative/Artistic
  "Bạn là artist vẽ tranh",
  "Designer thích đồ aesthetic",
  "Photographer chuyên nghiệp",
  "Writer sắp ra sách",
  "Musician chơi guitar",
  "Crafter làm đồ handmade",
  "YouTuber làm content",
  "Cosplayer chuyên nghiệp",
  "Dancer thích vintage",
  "Architect yêu minimalism",
  
  // Unique/Special Requests  
  "Quà cho người khó tính",
  "Limited edition cho collector",
  "Mystery box surprise",
  "Quà unique chưa từng thấy",
  "Experience gift không phải đồ vật",
  "Quà cho người có hết mọi thứ",
  "Handmade personalized",
  "Luxury cho người giàu",
  "Budget hạn chế chỉ 200k",
  "Quà giao tận nơi trong ngày"
];

// Run training
const runTraining = async () => {
  console.log("🚀 Starting Spirit Training with 100 Scenarios...\n");
  
  const model = createChatModel();
  const results = [];
  
  for (let i = 0; i < testScenarios.length; i++) {
    const scenario = testScenarios[i];
    
    // Pick a random spirit for each scenario
    const spirit = spiritsData[Math.floor(Math.random() * spiritsData.length)];
    const examples = (trainingExamples[spirit.id] || []).slice(0, 3);
    
    const systemPrompt = `Bạn là ${spirit.name} ${spirit.emoji} - tinh linh tư vấn quà tặng.
${spirit.personality}

Xưng "mình", gọi khách là "cậu". Dùng emoji ${spirit.emoji}. Trả lời 2-3 câu ngắn gọn.

Ví dụ:
${examples.map(ex => `Khách: "${ex.user}" → "${ex.spirit}"`).join('\n')}`;

    try {
      const response = await model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(scenario)
      ]);
      
      const result = {
        scenario: scenario,
        spirit: spirit.name,
        response: response.content
      };
      
      results.push(result);
      console.log(`[${i+1}/100] ${spirit.emoji} ${spirit.name}`);
      console.log(`  📝 User: ${scenario}`);
      console.log(`  🤖 Response: ${response.content.substring(0, 100)}...`);
      console.log("");
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`[${i+1}/100] ❌ Error: ${error.message}`);
      results.push({ scenario, spirit: spirit.name, error: error.message });
    }
  }
  
  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 TRAINING SUMMARY");
  console.log("=".repeat(60));
  console.log(`✅ Successful: ${results.filter(r => !r.error).length}/100`);
  console.log(`❌ Failed: ${results.filter(r => r.error).length}/100`);
  
  // Save results to file
  const fs = await import('fs');
  fs.writeFileSync(
    './src/services/spirit/training_results.json', 
    JSON.stringify(results, null, 2)
  );
  console.log("\n💾 Results saved to training_results.json");
};

runTraining().catch(console.error);

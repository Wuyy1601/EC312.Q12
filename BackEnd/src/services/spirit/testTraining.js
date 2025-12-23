// Quick test script
import trainingExamples from "./trainingExamples.js";
import spiritsData from "./spiritData.js";

console.log("=== Training Examples Check ===\n");

for (const spirit of spiritsData) {
  const examples = trainingExamples[spirit.id] || [];
  console.log(`${spirit.emoji} ${spirit.name}: ${examples.length} examples`);
  if (examples.length > 0) {
    console.log(`   Sample: "${examples[0].user}" -> "${examples[0].spirit.substring(0, 50)}..."`);
  }
}

console.log("\n✅ Training data loaded successfully!");
console.log(`📊 Total spirits: ${spiritsData.length}`);
console.log(`📊 Total examples: ${Object.values(trainingExamples).flat().length}`);

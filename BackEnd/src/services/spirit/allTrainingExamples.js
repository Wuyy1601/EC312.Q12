// All Training Examples - Combined index file
// Merges original + extended + extra + final examples for 1000+ cases total

import { trainingExamples } from './trainingExamples.js';
import { extendedTrainingExamples } from './trainingExamplesExtended.js';
import { extraTrainingExamples } from './trainingExamplesExtra.js';
import { finalTrainingExamples } from './trainingExamplesFinal.js';

// Merge all examples for each spirit
const spiritIds = ['love', 'joy', 'care', 'gratitude', 'kindness', 'courage', 'peace', 'wisdom', 'magic', 'wonder'];

export const allTrainingExamples = {};

spiritIds.forEach(spiritId => {
  allTrainingExamples[spiritId] = [
    ...(trainingExamples[spiritId] || []),
    ...(extendedTrainingExamples[spiritId] || []),
    ...(extraTrainingExamples[spiritId] || []),
    ...(finalTrainingExamples[spiritId] || []),
  ];
});

// Helper function to get all examples for a spirit
export const getAllExamplesForSpirit = (spiritId) => {
  return allTrainingExamples[spiritId] || [];
};

// Get count per spirit
export const getExamplesCountBySpirit = () => {
  const counts = {};
  spiritIds.forEach(spiritId => {
    counts[spiritId] = allTrainingExamples[spiritId]?.length || 0;
  });
  return counts;
};

// Get total count of all examples
export const getTotalExamplesCount = () => {
  return Object.values(allTrainingExamples).reduce((sum, arr) => sum + arr.length, 0);
};

// Get random examples for a spirit (useful for few-shot prompting)
export const getRandomExamples = (spiritId, count = 5) => {
  const examples = allTrainingExamples[spiritId] || [];
  const shuffled = [...examples].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

// Get examples by keyword (for finding relevant examples)
export const searchExamples = (spiritId, keyword) => {
  const examples = allTrainingExamples[spiritId] || [];
  const lowerKeyword = keyword.toLowerCase();
  return examples.filter(ex => 
    ex.user.toLowerCase().includes(lowerKeyword) || 
    ex.spirit.toLowerCase().includes(lowerKeyword)
  );
};

// Format examples for prompt injection
export const formatExamplesForPrompt = (spiritId, count = 5) => {
  const examples = getRandomExamples(spiritId, count);
  return examples.map(ex => `User: "${ex.user}"\nSpirit: "${ex.spirit}"`).join('\n\n');
};

export default allTrainingExamples;

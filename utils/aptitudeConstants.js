export const APTITUDE_CATEGORIES = [
  "Quantitative Aptitude",
  "Logical Reasoning",
  "Verbal Ability",
  "Data Interpretation",
  "Number System",
  "Percentages",
  "Profit & Loss",
  "Time & Work",
  "Probability",
  "Permutation & Combination",
  "Mixed Aptitude",
];

export const APTITUDE_PRESETS = [
  {
    id: "general",
    title: "General Aptitude",
    category: "Mixed Aptitude",
    difficulty: "Medium",
    questionCount: 20,
    timeLimit: 20,
    negativeMarking: false,
    mode: "test",
    description: "Standard 20-question mixed test covering core math & logic.",
  },
  {
    id: "placement",
    title: "Placement Aptitude",
    category: "Quantitative Aptitude",
    difficulty: "Hard",
    questionCount: 30,
    timeLimit: 30,
    negativeMarking: true,
    mode: "test",
    description: "Challenging placement prep test with negative marking enabled.",
  },
  {
    id: "quick",
    title: "Quick 10-Minute Test",
    category: "Mixed Aptitude",
    difficulty: "Medium",
    questionCount: 10,
    timeLimit: 10,
    negativeMarking: false,
    mode: "test",
    description: "Fast 10-question evaluation for quick practice sessions.",
  },
  {
    id: "practice",
    title: "Mixed Practice",
    category: "Mixed Aptitude",
    difficulty: "Adaptive",
    questionCount: 15,
    timeLimit: 20,
    negativeMarking: false,
    mode: "practice",
    description: "Interactive practice mode with immediate step-by-step explanations.",
  },
];

export const DIFFICULTY_LEVELS = ["Easy", "Medium", "Hard", "Adaptive"];
export const QUESTION_COUNTS = [10, 20, 30, 50];
export const TIME_LIMITS = [5, 10, 15, 20, 30, 45, 60];

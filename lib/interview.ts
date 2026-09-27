export const DEFAULT_QUESTIONS = 3;
export const MIN_QUESTIONS = 1;
export const MAX_QUESTIONS = 10;

// BYOK：前端把使用者的 OpenAI API Key 放在這個 header 送給 /api/interview
export const API_KEY_HEADER = "x-openai-key";

export type ChatMessage = {
  role: "interviewer" | "candidate";
  content: string;
};

export type InterviewRequest = {
  jobDescription: string;
  totalQuestions: number;
  messages: ChatMessage[];
};

export type QuestionReview = {
  question: string;
  answer: string;
  feedback: string;
  betterAnswer: string;
};

export type Evaluation = {
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  questionReviews: QuestionReview[];
};

export type InterviewResponse =
  | { type: "question"; questionNumber: number; content: string }
  | { type: "evaluation"; evaluation: Evaluation };

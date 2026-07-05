import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIRequestType, AIContext } from '@/types/ai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error('Missing GEMINI_API_KEY in environment variables.');

const genAI = new GoogleGenerativeAI(apiKey);

// gemini-1.5-flash-8b has the highest free tier limits:
// - 15 requests per minute
// - 1 million requests per day
// - 1 million tokens per minute
const MODEL_NAME = 'gemini-1.5-flash-8b';

const SYSTEM_PROMPTS: Record<AIRequestType, string> = {
  'idea-structure': `You are a hackathon project advisor.
Given a raw project idea, return a JSON object with exactly these keys:
{
  "problem_statement": string,
  "target_users": string,
  "core_features": string[],
  "suggested_tech_stack": string[],
  "architecture_overview": string,
  "mvp_scope": string[],
  "stretch_goals": string[]
}
Return only valid JSON. No markdown, no explanation outside the JSON.`,

  'task-assignment': `You are a hackathon team lead.
Given a list of team members with their skills and a project idea, return a JSON array of tasks:
[
  {
    "id": "task-1",
    "team_id": "",
    "title": string,
    "description": string,
    "assigned_to_id": string,
    "assigned_to_name": string,
    "status": "todo",
    "created_at": ""
  }
]
Assign each task to the most suitable team member based on their skills.
Return only valid JSON array. No markdown, no explanation outside the JSON.`,

  'roadmap': `You are a hackathon planning expert.
Given a project idea and hackathon duration in hours, return a JSON array of roadmap phases:
[
  {
    "phase_number": number,
    "time_range": string,
    "title": string,
    "tasks": string[]
  }
]
Create 6-8 phases that cover the full hackathon timeline realistically.
Return only valid JSON array. No markdown, no explanation outside the JSON.`,

  'boilerplate': `You are a senior software engineer helping a hackathon team get started fast.
Given their tech stack and project idea, generate:
1. A recommended folder structure
2. Key starter code snippets
Keep it concise and runnable. Use markdown code blocks with language labels.`,

  'mentor-chat': `You are an experienced hackathon mentor — direct, practical, and encouraging.
Answer the team's question clearly and concisely. Focus on unblocking them fast.
Keep responses under 200 words unless more depth is genuinely needed.`,
};

// Simple in-memory rate limiter
// Tracks last request time to enforce minimum gap between requests
let lastRequestTime = 0;
const MIN_REQUEST_GAP_MS = 4000; // 4 seconds between requests = max 15/min

async function waitForRateLimit() {
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < MIN_REQUEST_GAP_MS) {
    const waitTime = MIN_REQUEST_GAP_MS - timeSinceLast;
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }
  lastRequestTime = Date.now();
}

// Retry with exponential backoff on 429 errors
async function generateWithRetry(
  prompt: string,
  retries = 3,
  delayMs = 5000
): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await waitForRateLimit();
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err: any) {
      const is429 = err?.message?.includes('429') || err?.message?.includes('quota');

      if (is429 && attempt < retries) {
        console.warn(`Rate limit hit. Attempt ${attempt}/${retries}. Waiting ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        delayMs *= 2; // exponential backoff
        continue;
      }

      // If it's a 429 on the last attempt, give a friendly error
      if (is429) {
        throw new Error(
          'AI quota exceeded. Please wait 30 seconds and try again, or generate a new API key at aistudio.google.com.'
        );
      }

      throw err;
    }
  }
  throw new Error('Max retries reached');
}

export async function generateAIResponse(
  type: AIRequestType,
  prompt: string,
  context?: AIContext
): Promise<string> {
  const contextBlock = context
    ? `\n\nContext:\n${JSON.stringify(context, null, 2)}`
    : '';

  const fullPrompt = `${SYSTEM_PROMPTS[type]}${contextBlock}\n\nUser input:\n${prompt}`;

  return generateWithRetry(fullPrompt);
}

export function parseJsonResponse<T>(rawText: string): T | null {
  try {
    const cleaned = rawText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}

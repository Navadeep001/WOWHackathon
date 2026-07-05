import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse, parseJsonResponse } from '@/lib/gemini';
import type { AIRequest, AIResponse, IdeaStructureResponse } from '@/types/ai';
import type { Task } from '@/types/team';
import type { RoadmapPhase } from '@/types/team';

const VALID_TYPES = [
  'idea-structure',
  'task-assignment',
  'roadmap',
  'boilerplate',
  'mentor-chat',
];

export async function POST(request: NextRequest) {
  try {
    const body: AIRequest = await request.json();
    const { type, prompt, context } = body;

    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `type must be one of: ${VALID_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    const rawText = await generateAIResponse(type, prompt, context);

    // For structured types, attempt to parse JSON from Gemini's response
    const response: AIResponse = { type, raw_text: rawText };

    if (type === 'idea-structure') {
      const parsed = parseJsonResponse<IdeaStructureResponse>(rawText);
      if (parsed) {
        response.structured = { idea: parsed };
      }
    }

    if (type === 'task-assignment') {
      const parsed = parseJsonResponse<Task[]>(rawText);
      if (parsed) {
        response.structured = { tasks: parsed };
      }
    }

    if (type === 'roadmap') {
      const parsed = parseJsonResponse<RoadmapPhase[]>(rawText);
      if (parsed) {
        response.structured = { roadmap: parsed };
      }
    }

    return NextResponse.json(response);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

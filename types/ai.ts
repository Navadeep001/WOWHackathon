import { Profile } from './user';
import { RoadmapPhase, Task } from './team';

// All supported AI feature types — routed via /api/ai?type=...
export type AIRequestType =
  | 'idea-structure'      // structures a raw idea into problem, features, stack, MVP
  | 'task-assignment'     // assigns tasks to team members based on their skills
  | 'roadmap'             // generates a time-boxed roadmap for a hackathon duration
  | 'boilerplate'         // generates starter code/folder structure
  | 'mentor-chat';        // freeform AI mentor Q&A

// Request body sent to POST /api/ai
export interface AIRequest {
  type: AIRequestType;
  prompt: string;
  context?: AIContext;
}

// Optional context that makes AI responses more targeted
export interface AIContext {
  team_members?: Pick<Profile, 'full_name' | 'skills' | 'preferred_roles'>[];
  hackathon_duration_hours?: number;
  tech_stack?: string[];
  project_idea?: string;
}

// Structured response for idea-structure type
export interface IdeaStructureResponse {
  problem_statement: string;
  target_users: string;
  core_features: string[];
  suggested_tech_stack: string[];
  architecture_overview: string;
  mvp_scope: string[];
  stretch_goals: string[];
}

// API response envelope — all /api/ai responses follow this shape
export interface AIResponse {
  type: AIRequestType;
  raw_text: string;               // always present — raw Gemini output
  structured?: {                  // present for structured types (idea, tasks, roadmap)
    idea?: IdeaStructureResponse;
    tasks?: Task[];
    roadmap?: RoadmapPhase[];
  };
}

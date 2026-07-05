export type HackathonMode = 'online' | 'offline' | 'hybrid';
export type HackathonStatus = 'upcoming' | 'ongoing' | 'ended';

export interface Hackathon {
  id: string;
  title: string;
  organizer: string;
  description: string;
  banner_url?: string;
  registration_deadline: string;   // ISO date string
  start_date: string;
  end_date: string;
  prize_pool: string;              // e.g. "₹1,00,000" or "$5,000"
  min_team_size: number;
  max_team_size: number;
  tags: string[];                  // e.g. ["AI", "Web3", "Open Innovation"]
  mode: HackathonMode;
  location?: string;               // city/venue for offline/hybrid
  status: HackathonStatus;
  participant_count: number;
  external_url?: string;           // link to original hackathon page
}

// Lighter version used in dashboard cards — not the full details object
export interface HackathonCardData {
  id: string;
  title: string;
  organizer: string;
  registration_deadline: string;
  prize_pool: string;
  min_team_size: number;
  max_team_size: number;
  tags: string[];
  mode: HackathonMode;
  status: HackathonStatus;
  participant_count: number;
}

// Tracks a user's interest/registration for a hackathon
export interface UserHackathon {
  user_id: string;
  hackathon_id: string;
  registered_at: string;
  team_id?: string;               // null if not yet in a team for this hackathon
}

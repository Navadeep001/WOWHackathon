import { Profile } from '@/types/user';
import { Team, TeammateMatch, TeamMatch } from '@/types/team';

// ─── Weights (must sum to 100) ───────────────────────────────────────────────
const SKILL_GAP_WEIGHT = 35;       // fills skills the team is missing
const ROLE_GAP_WEIGHT = 25;        // fills a role the team doesn't have yet
const EXPERIENCE_WEIGHT = 20;      // diversity of experience levels
const AVAILABILITY_WEIGHT = 20;    // has enough hours per day

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalize(str: string): string {
  return str.trim().toLowerCase();
}

function overlappingItems(listA: string[], listB: string[]): string[] {
  const setB = new Set(listB.map(normalize));
  return listA.filter((item) => setB.has(normalize(item)));
}

function newItemsNotInList(newItems: string[], existingItems: string[]): string[] {
  const existingSet = new Set(existingItems.map(normalize));
  return newItems.filter((item) => !existingSet.has(normalize(item)));
}

// ─── Teammate Matching (AutoMatch) ───────────────────────────────────────────

interface AutoMatchContext {
  currentTeamMembers: Profile[];
  requiredSkills: string[];         // from team.required_skills
  hackathonDurationHours: number;
}

function scoreSkillGap(
  candidateSkills: string[],
  requiredSkills: string[]
): { score: number; filledSkills: string[] } {
  if (requiredSkills.length === 0) {
    return { score: SKILL_GAP_WEIGHT * 0.5, filledSkills: [] };
  }
  const filled = overlappingItems(candidateSkills, requiredSkills);
  const ratio = filled.length / requiredSkills.length;
  return { score: Math.round(ratio * SKILL_GAP_WEIGHT), filledSkills: filled };
}

function scoreRoleGap(
  candidateRoles: Profile['preferred_roles'],
  existingRoles: Profile['preferred_roles'][]
): { score: number; isNewRole: boolean } {
  const allExistingRoles = existingRoles.flat().map(normalize);
  const bringNewRole = candidateRoles.some(
    (role) => !allExistingRoles.includes(normalize(role))
  );
  return {
    score: bringNewRole ? ROLE_GAP_WEIGHT : Math.round(ROLE_GAP_WEIGHT * 0.2),
    isNewRole: bringNewRole,
  };
}

function scoreExperienceDiversity(
  candidateLevel: Profile['experience_level'],
  existingLevels: Profile['experience_level'][]
): { score: number } {
  if (existingLevels.length === 0) {
    return { score: Math.round(EXPERIENCE_WEIGHT * 0.6) };
  }
  const sameCount = existingLevels.filter((l) => l === candidateLevel).length;
  const diversityRatio = 1 - sameCount / existingLevels.length;
  // Reward diversity, but give a baseline score even if same level
  const score = Math.round(diversityRatio * EXPERIENCE_WEIGHT + EXPERIENCE_WEIGHT * 0.2);
  return { score: Math.min(score, EXPERIENCE_WEIGHT) };
}

function scoreAvailability(
  candidateHoursPerDay: number,
  hackathonDurationHours: number
): { score: number; isAvailableEnough: boolean } {
  // Expect at least 1/3 of hackathon hours daily to be "available enough"
  const minimumHoursPerDay = hackathonDurationHours / 3;
  const isAvailableEnough = candidateHoursPerDay >= minimumHoursPerDay;
  const ratio = Math.min(candidateHoursPerDay / minimumHoursPerDay, 1);
  return {
    score: Math.round(ratio * AVAILABILITY_WEIGHT),
    isAvailableEnough,
  };
}

export function scoreTeammateCandidate(
  candidate: Profile,
  context: AutoMatchContext
): TeammateMatch {
  const existingRoles = context.currentTeamMembers.map((m) => m.preferred_roles);
  const existingLevels = context.currentTeamMembers.map((m) => m.experience_level);

  const { score: skillScore, filledSkills } = scoreSkillGap(
    candidate.skills,
    context.requiredSkills
  );
  const { score: roleScore, isNewRole } = scoreRoleGap(
    candidate.preferred_roles,
    existingRoles
  );
  const { score: expScore } = scoreExperienceDiversity(
    candidate.experience_level,
    existingLevels
  );
  const { score: availScore, isAvailableEnough } = scoreAvailability(
    candidate.availability_hours_per_day,
    context.hackathonDurationHours
  );

  const totalScore = Math.min(100, skillScore + roleScore + expScore + availScore);

  const matchReasons: string[] = [];
  if (filledSkills.length > 0) {
    matchReasons.push(`Fills required skills: ${filledSkills.slice(0, 3).join(', ')}`);
  }
  if (isNewRole) {
    matchReasons.push(`Brings a new role: ${candidate.preferred_roles[0]}`);
  }
  if (expScore >= EXPERIENCE_WEIGHT * 0.7) {
    matchReasons.push('Adds useful experience-level diversity to the team');
  }
  if (isAvailableEnough) {
    matchReasons.push(`Available ${candidate.availability_hours_per_day}h/day — enough for this hackathon`);
  }
  if (matchReasons.length === 0) {
    matchReasons.push('General profile compatibility');
  }

  return { profile: candidate, match_score: totalScore, match_reasons: matchReasons };
}

export function rankTeammateCandidates(
  candidates: Profile[],
  context: AutoMatchContext
): TeammateMatch[] {
  return candidates
    .map((c) => scoreTeammateCandidate(c, context))
    .sort((a, b) => b.match_score - a.match_score);
}

// ─── Team Matching (Join Team) ────────────────────────────────────────────────

interface JoinTeamContext {
  userProfile: Profile;
  hackathonDurationHours: number;
}

export function scoreTeamForUser(
  team: Team,
  teamMembers: Profile[],
  context: JoinTeamContext
): TeamMatch {
  const { userProfile } = context;

  // How many of the team's required skills does this user bring?
  const filledByUser = overlappingItems(userProfile.skills, team.required_skills);
  const skillFitScore =
    team.required_skills.length > 0
      ? Math.round((filledByUser.length / team.required_skills.length) * SKILL_GAP_WEIGHT)
      : Math.round(SKILL_GAP_WEIGHT * 0.5);

  // Does the user fill a role the team doesn't already have?
  const existingRoles = teamMembers.flatMap((m) => m.preferred_roles).map(normalize);
  const userBringsNewRole = userProfile.preferred_roles.some(
    (role) => !existingRoles.includes(normalize(role))
  );
  const roleFitScore = userBringsNewRole ? ROLE_GAP_WEIGHT : Math.round(ROLE_GAP_WEIGHT * 0.2);

  // Availability
  const { score: availScore } = scoreAvailability(
    userProfile.availability_hours_per_day,
    context.hackathonDurationHours
  );

  // Tech stack overlap with existing members
  const allTeamStacks = teamMembers.flatMap((m) => m.tech_stack);
  const sharedStack = overlappingItems(userProfile.tech_stack, allTeamStacks);
  const stackScore = Math.min(
    EXPERIENCE_WEIGHT,
    Math.round((sharedStack.length / Math.max(userProfile.tech_stack.length, 1)) * EXPERIENCE_WEIGHT)
  );

  const totalScore = Math.min(100, skillFitScore + roleFitScore + availScore + stackScore);

  const matchReasons: string[] = [];
  if (filledByUser.length > 0) {
    matchReasons.push(`You fill their required skills: ${filledByUser.slice(0, 3).join(', ')}`);
  }
  if (userBringsNewRole) {
    matchReasons.push(`You bring a role they need: ${userProfile.preferred_roles[0]}`);
  }
  if (sharedStack.length > 0) {
    matchReasons.push(`Shared tech stack: ${sharedStack.slice(0, 2).join(', ')}`);
  }
  if (matchReasons.length === 0) {
    matchReasons.push('Profile is a reasonable fit for this team');
  }

  return { team, match_score: totalScore, match_reasons: matchReasons };
}

export function rankTeamsForUser(
  teams: Team[],
  teamMembersMap: Record<string, Profile[]>,
  context: JoinTeamContext
): TeamMatch[] {
  return teams
    .filter((t) => t.is_open && t.current_member_ids.length < t.max_members)
    .map((t) => scoreTeamForUser(t, teamMembersMap[t.id] || [], context))
    .sort((a, b) => b.match_score - a.match_score);
}

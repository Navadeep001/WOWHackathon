import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rankTeammateCandidates, rankTeamsForUser } from '@/lib/matchAlgorithm';
import type { Profile } from '@/types/user';
import type { Team } from '@/types/team';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, userId, hackathonId, hackathonDurationHours = 24 } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // ── AutoMatch: find best teammates for a newly created team ───────────────
    if (type === 'automatch') {
      const { teamId, requiredSkills = [] } = body;

      if (!teamId) {
        return NextResponse.json({ error: 'teamId is required for automatch' }, { status: 400 });
      }

      // Fetch current team members
      const { data: team } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      const { data: currentMembers } = await supabase
        .from('profiles')
        .select('*')
        .in('id', team?.current_member_ids || []);

      // Fetch candidate pool: users looking for a team, not already in this team
      const { data: candidates, error: candidatesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('looking_for_team', true)
        .not('id', 'in', `(${(team?.current_member_ids || [userId]).join(',')})`);

      if (candidatesError) {
        return NextResponse.json({ error: candidatesError.message }, { status: 500 });
      }

      const ranked = rankTeammateCandidates((candidates || []) as Profile[], {
        currentTeamMembers: (currentMembers || []) as Profile[],
        requiredSkills,
        hackathonDurationHours,
      });

      return NextResponse.json({ matches: ranked.slice(0, 20) });
    }

    // ── Join: find best teams for a user to join ──────────────────────────────
    if (type === 'join') {
      // Fetch the requesting user's profile
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError || !userProfile) {
        return NextResponse.json(
          { error: 'User profile not found. Complete onboarding first.' },
          { status: 404 }
        );
      }

      // Fetch open teams for this hackathon (or all open teams if no hackathonId)
      let teamsQuery = supabase
        .from('teams')
        .select('*')
        .eq('is_open', true);

      if (hackathonId) {
        teamsQuery = teamsQuery.eq('hackathon_id', hackathonId);
      }

      // Exclude teams the user is already in
      teamsQuery = teamsQuery.not('current_member_ids', 'cs', `{${userId}}`);

      const { data: teams, error: teamsError } = await teamsQuery;

      if (teamsError) {
        return NextResponse.json({ error: teamsError.message }, { status: 500 });
      }

      if (!teams || teams.length === 0) {
        return NextResponse.json({ matches: [] });
      }

      // Fetch all members for all candidate teams in one query
      const allMemberIds = [...new Set((teams as Team[]).flatMap((t) => t.current_member_ids))];

      const { data: allMembers } = await supabase
        .from('profiles')
        .select('*')
        .in('id', allMemberIds);

      // Build a map of teamId → Profile[]
      const teamMembersMap: Record<string, Profile[]> = {};
      for (const team of teams as Team[]) {
        teamMembersMap[team.id] = (allMembers || []).filter((m) =>
          team.current_member_ids.includes(m.id)
        ) as Profile[];
      }

      const ranked = rankTeamsForUser(teams as Team[], teamMembersMap, {
        userProfile: userProfile as Profile,
        hackathonDurationHours,
      });

      return NextResponse.json({ matches: ranked.slice(0, 20) });
    }

    return NextResponse.json(
      { error: 'type must be "automatch" or "join"' },
      { status: 400 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

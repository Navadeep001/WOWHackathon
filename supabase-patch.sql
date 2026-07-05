-- ─────────────────────────────────────────────────────────
-- LegoLink — SQL Patch
-- Run this in Supabase Dashboard > SQL Editor > New Query
-- after the original supabase-schema.sql has been run
-- ─────────────────────────────────────────────────────────

-- 1. Enable Realtime for team chat (messages appear without refresh)
alter publication supabase_realtime add table chat_messages;

-- 2. Enable Realtime for notifications (invites + join requests update live)
alter publication supabase_realtime add table team_invites;
alter publication supabase_realtime add table team_join_requests;

-- 3. Function to accept a team invite
--    - sets invite status to accepted
--    - adds the user to teams.current_member_ids
--    - sets team is_open to false if team is now full
create or replace function public.accept_team_invite(invite_id uuid)
returns void as $$
declare
  v_team_id uuid;
  v_user_id uuid;
  v_current_members uuid[];
  v_max_members int;
begin
  -- Get invite details
  select team_id, invited_user_id
  into v_team_id, v_user_id
  from team_invites
  where id = invite_id and status = 'pending';

  if not found then
    raise exception 'Invite not found or already responded to';
  end if;

  -- Update invite status
  update team_invites set status = 'accepted' where id = invite_id;

  -- Add user to team
  update teams
  set current_member_ids = array_append(current_member_ids, v_user_id)
  where id = v_team_id
  returning current_member_ids, max_members
  into v_current_members, v_max_members;

  -- Close team if now full
  if array_length(v_current_members, 1) >= v_max_members then
    update teams set is_open = false where id = v_team_id;
  end if;

  -- Update user_hackathons with the team they joined
  update user_hackathons
  set team_id = v_team_id
  where user_id = v_user_id
    and hackathon_id = (select hackathon_id from teams where id = v_team_id);
end;
$$ language plpgsql security definer;

-- 4. Function to accept a join request
--    Same logic as above but for join requests
create or replace function public.accept_join_request(request_id uuid)
returns void as $$
declare
  v_team_id uuid;
  v_user_id uuid;
  v_current_members uuid[];
  v_max_members int;
begin
  select team_id, requesting_user_id
  into v_team_id, v_user_id
  from team_join_requests
  where id = request_id and status = 'pending';

  if not found then
    raise exception 'Request not found or already responded to';
  end if;

  update team_join_requests set status = 'accepted' where id = request_id;

  update teams
  set current_member_ids = array_append(current_member_ids, v_user_id)
  where id = v_team_id
  returning current_member_ids, max_members
  into v_current_members, v_max_members;

  if array_length(v_current_members, 1) >= v_max_members then
    update teams set is_open = false where id = v_team_id;
  end if;

  update user_hackathons
  set team_id = v_team_id
  where user_id = v_user_id
    and hackathon_id = (select hackathon_id from teams where id = v_team_id);
end;
$$ language plpgsql security definer;

-- 5. RLS policies for team_invites (team owner can read all invites for their team)
create policy "Team owner can read invites for their team"
  on team_invites for select
  using (
    auth.uid() = invited_user_id
    or auth.uid() = (select owner_id from teams where id = team_id)
  );

-- 6. RLS policy for team owner to read join requests
create policy "Team owner can read join requests"
  on team_join_requests for select
  using (
    auth.uid() = requesting_user_id
    or auth.uid() = (select owner_id from teams where id = team_id)
  );

-- 7. Allow team owner to update join request status
create policy "Team owner can update join request status"
  on team_join_requests for update
  using (auth.uid() = (select owner_id from teams where id = team_id));

-- 8. Allow team owner to update invite status (decline on behalf)
create policy "Team owner can update invite"
  on team_invites for update
  using (
    auth.uid() = invited_user_id
    or auth.uid() = (select owner_id from teams where id = team_id)
  );

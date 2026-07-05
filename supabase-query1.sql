-- ─────────────────────────────────────────────────────────
-- LegoLink — Query 1
-- Run this FIRST in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────

-- Drop everything cleanly first
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user cascade;
drop function if exists public.accept_team_invite cascade;
drop function if exists public.accept_join_request cascade;
drop table if exists tasks cascade;
drop table if exists chat_messages cascade;
drop table if exists team_join_requests cascade;
drop table if exists team_invites cascade;
drop table if exists user_hackathons cascade;
drop table if exists teams cascade;
drop table if exists profiles cascade;

-- ── Tables ────────────────────────────────────────────────

create table profiles (
  id                          uuid primary key references auth.users(id) on delete cascade,
  email                       text not null,
  full_name                   text not null default '',
  college                     text not null default '',
  year_of_study               int not null default 1,
  skills                      text[] not null default '{}',
  tech_stack                  text[] not null default '{}',
  preferred_roles             text[] not null default '{}',
  experience_level            text not null default 'intermediate',
  availability_hours_per_day  int not null default 4,
  timezone                    text not null default 'Asia/Kolkata',
  github_url                  text,
  portfolio_url               text,
  linkedin_url                text,
  avatar_url                  text,
  looking_for_team            boolean not null default true,
  created_at                  timestamptz not null default now()
);

create table teams (
  id                 uuid primary key default gen_random_uuid(),
  hackathon_id       text not null,
  name               text not null,
  description        text not null default '',
  required_skills    text[] not null default '{}',
  current_member_ids uuid[] not null default '{}',
  max_members        int not null default 4,
  owner_id           uuid not null references profiles(id) on delete cascade,
  is_open            boolean not null default true,
  created_at         timestamptz not null default now()
);

create table user_hackathons (
  user_id       uuid not null references profiles(id) on delete cascade,
  hackathon_id  text not null,
  registered_at timestamptz not null default now(),
  team_id       uuid references teams(id) on delete set null,
  primary key (user_id, hackathon_id)
);

create table team_invites (
  id              uuid primary key default gen_random_uuid(),
  team_id         uuid not null references teams(id) on delete cascade,
  invited_user_id uuid not null references profiles(id) on delete cascade,
  invited_by      uuid not null references profiles(id) on delete cascade,
  status          text not null default 'pending',
  created_at      timestamptz not null default now(),
  unique (team_id, invited_user_id)
);

create table team_join_requests (
  id                 uuid primary key default gen_random_uuid(),
  team_id            uuid not null references teams(id) on delete cascade,
  requesting_user_id uuid not null references profiles(id) on delete cascade,
  status             text not null default 'pending',
  requested_at       timestamptz not null default now(),
  unique (team_id, requesting_user_id)
);

create table chat_messages (
  id            uuid primary key default gen_random_uuid(),
  team_id       uuid not null references teams(id) on delete cascade,
  sender_id     uuid not null references profiles(id) on delete cascade,
  sender_name   text not null,
  content       text not null,
  is_ai_message boolean not null default false,
  created_at    timestamptz not null default now()
);

create table tasks (
  id               uuid primary key default gen_random_uuid(),
  team_id          uuid not null references teams(id) on delete cascade,
  title            text not null,
  description      text not null default '',
  assigned_to_id   uuid not null references profiles(id) on delete cascade,
  assigned_to_name text not null,
  status           text not null default 'todo',
  created_at       timestamptz not null default now()
);

-- ── Auto-create profile on signup ─────────────────────────

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Row Level Security ────────────────────────────────────

alter table profiles           enable row level security;
alter table teams              enable row level security;
alter table user_hackathons    enable row level security;
alter table team_invites       enable row level security;
alter table team_join_requests enable row level security;
alter table chat_messages      enable row level security;
alter table tasks              enable row level security;

-- profiles
create policy "Anyone can read profiles"
  on profiles for select using (true);

create policy "Users can insert their own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- teams
create policy "Anyone can read teams"
  on teams for select using (true);

create policy "Authenticated users can create teams"
  on teams for insert with check (auth.uid() = owner_id);

create policy "Team owner can update team"
  on teams for update using (auth.uid() = owner_id);

-- user_hackathons
create policy "Users can read own registrations"
  on user_hackathons for select using (auth.uid() = user_id);

create policy "Users can register interest"
  on user_hackathons for insert with check (auth.uid() = user_id);

create policy "Users can update own registrations"
  on user_hackathons for update using (auth.uid() = user_id);

-- team_invites
create policy "Users can read their invites or invites for teams they own"
  on team_invites for select using (
    auth.uid() = invited_user_id
    or auth.uid() = (select owner_id from teams where id = team_id)
  );

create policy "Team owners can send invites"
  on team_invites for insert with check (auth.uid() = invited_by);

create policy "Invited user or owner can update invite"
  on team_invites for update using (
    auth.uid() = invited_user_id
    or auth.uid() = (select owner_id from teams where id = team_id)
  );

-- team_join_requests
create policy "Requester or team owner can read join requests"
  on team_join_requests for select using (
    auth.uid() = requesting_user_id
    or auth.uid() = (select owner_id from teams where id = team_id)
  );

create policy "Users can send join requests"
  on team_join_requests for insert with check (
    auth.uid() = requesting_user_id
  );

create policy "Team owner can update join request status"
  on team_join_requests for update using (
    auth.uid() = (select owner_id from teams where id = team_id)
  );

-- chat_messages — use = any() for uuid[] comparison
create policy "Team members can read messages"
  on chat_messages for select using (
    auth.uid() = any(
      (select current_member_ids from teams where id = team_id)
    )
  );

create policy "Team members can send messages"
  on chat_messages for insert with check (
    auth.uid() = any(
      (select current_member_ids from teams where id = team_id)
    )
  );

-- tasks — use = any() for uuid[] comparison
create policy "Team members can read tasks"
  on tasks for select using (
    auth.uid() = any(
      (select current_member_ids from teams where id = team_id)
    )
  );

create policy "Team members can create tasks"
  on tasks for insert with check (
    auth.uid() = any(
      (select current_member_ids from teams where id = team_id)
    )
  );

create policy "Team members can update tasks"
  on tasks for update using (
    auth.uid() = any(
      (select current_member_ids from teams where id = team_id)
    )
  );

-- ── Postgres functions ────────────────────────────────────

create or replace function public.accept_team_invite(invite_id uuid)
returns void as $$
declare
  v_team_id        uuid;
  v_user_id        uuid;
  v_current_members uuid[];
  v_max_members    int;
begin
  select team_id, invited_user_id
  into v_team_id, v_user_id
  from team_invites
  where id = invite_id and status = 'pending';

  if not found then
    raise exception 'Invite not found or already responded to';
  end if;

  update team_invites set status = 'accepted' where id = invite_id;

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

create or replace function public.accept_join_request(request_id uuid)
returns void as $$
declare
  v_team_id        uuid;
  v_user_id        uuid;
  v_current_members uuid[];
  v_max_members    int;
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

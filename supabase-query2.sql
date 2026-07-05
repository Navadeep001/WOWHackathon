-- ─────────────────────────────────────────────────────────
-- LegoLink — Query 2
-- Run this AFTER Query 1 succeeds
-- Enables Realtime for live chat and notifications
-- ─────────────────────────────────────────────────────────

alter publication supabase_realtime add table chat_messages;
alter publication supabase_realtime add table team_invites;
alter publication supabase_realtime add table team_join_requests;

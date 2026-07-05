'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface InviteNotification {
  id: string;
  team_id: string;
  team_name: string;
  invited_by_name: string;
  status: string;
  created_at: string;
}

export interface JoinRequestNotification {
  id: string;
  team_id: string;
  team_name: string;
  requesting_user_name: string;
  requesting_user_id: string;
  status: string;
  requested_at: string;
}

export function useNotifications(userId: string | undefined) {
  const [invites, setInvites] = useState<InviteNotification[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequestNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const totalPending =
    invites.filter((i) => i.status === 'pending').length +
    joinRequests.filter((r) => r.status === 'pending').length;

  const loadNotifications = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    try {
      // ── Invites sent TO this user ───────────────────────────────────
      const { data: inviteData } = await supabase
        .from('team_invites')
        .select('id, team_id, status, created_at, invited_by')
        .eq('invited_user_id', userId)
        .order('created_at', { ascending: false });

      if (inviteData && inviteData.length > 0) {
        const teamIds = [...new Set(inviteData.map((i) => i.team_id))];
        const inviterIds = [...new Set(inviteData.map((i) => i.invited_by))];

        const [{ data: teams }, { data: inviters }] = await Promise.all([
          supabase.from('teams').select('id, name').in('id', teamIds),
          supabase.from('profiles').select('id, full_name').in('id', inviterIds),
        ]);

        const teamMap: Record<string, string> = {};
        (teams || []).forEach((t) => { teamMap[t.id] = t.name; });

        const inviterMap: Record<string, string> = {};
        (inviters || []).forEach((p) => { inviterMap[p.id] = p.full_name; });

        setInvites(
          inviteData.map((i) => ({
            id: i.id,
            team_id: i.team_id,
            team_name: teamMap[i.team_id] || 'Unknown Team',
            invited_by_name: inviterMap[i.invited_by] || 'Someone',
            status: i.status,
            created_at: i.created_at,
          }))
        );
      } else {
        setInvites([]);
      }

      // ── Join requests for teams this user owns ─────────────────────
      const { data: ownedTeams } = await supabase
        .from('teams')
        .select('id, name')
        .eq('owner_id', userId);

      if (ownedTeams && ownedTeams.length > 0) {
        const ownedTeamIds = ownedTeams.map((t) => t.id);
        const teamNameMap: Record<string, string> = {};
        ownedTeams.forEach((t) => { teamNameMap[t.id] = t.name; });

        const { data: requestData } = await supabase
          .from('team_join_requests')
          .select('id, team_id, requesting_user_id, status, requested_at')
          .in('team_id', ownedTeamIds)
          .order('requested_at', { ascending: false });

        if (requestData && requestData.length > 0) {
          const requesterIds = [...new Set(requestData.map((r) => r.requesting_user_id))];
          const { data: requesters } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', requesterIds);

          const requesterMap: Record<string, string> = {};
          (requesters || []).forEach((p) => { requesterMap[p.id] = p.full_name; });

          setJoinRequests(
            requestData.map((r) => ({
              id: r.id,
              team_id: r.team_id,
              team_name: teamNameMap[r.team_id] || 'Unknown Team',
              requesting_user_name: requesterMap[r.requesting_user_id] || 'Someone',
              requesting_user_id: r.requesting_user_id,
              status: r.status,
              requested_at: r.requested_at,
            }))
          );
        } else {
          setJoinRequests([]);
        }
      } else {
        setJoinRequests([]);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    loadNotifications();

    // ── Realtime: correctly chain .on() BEFORE .subscribe() ────────────
    const inviteChannel = supabase
      .channel(`notifications-invites-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_invites',
          filter: `invited_user_id=eq.${userId}`,
        },
        () => { loadNotifications(); }
      )
      .subscribe();

    const requestChannel = supabase
      .channel(`notifications-requests-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_join_requests',
        },
        () => { loadNotifications(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(inviteChannel);
      supabase.removeChannel(requestChannel);
    };
  }, [userId, loadNotifications]);

  return {
    invites,
    joinRequests,
    totalPending,
    loading,
    reload: loadNotifications,
  };
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, Users, UserPlus, Check, X } from 'lucide-react';
import { AppNavbar } from '@/components/layout/app-navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';

// ── Types ─────────────────────────────────────────────────────────────────────

interface InviteNotification {
  id: string;
  team_id: string;
  team_name: string;
  invited_by_name: string;
  status: string;
  created_at: string;
}

interface JoinRequestNotification {
  id: string;
  team_id: string;
  team_name: string;
  requesting_user_name: string;
  requesting_user_id: string;
  status: string;
  requested_at: string;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [invites, setInvites] = useState<InviteNotification[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequestNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    loadNotifications();
  }, [user]);

  async function loadNotifications() {
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      // ── Load invites sent TO this user ──────────────────────────────
      const { data: inviteData, error: inviteError } = await supabase
        .from('team_invites')
        .select('id, team_id, status, created_at, invited_by')
        .eq('invited_user_id', user.id)
        .order('created_at', { ascending: false });

      if (inviteError) throw new Error(`Invites error: ${inviteError.message}`);

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

      // ── Load join requests for teams owned by this user ─────────────
      const { data: ownedTeams } = await supabase
        .from('teams')
        .select('id, name')
        .eq('owner_id', user.id);

      if (ownedTeams && ownedTeams.length > 0) {
        const ownedTeamIds = ownedTeams.map((t) => t.id);
        const teamNameMap: Record<string, string> = {};
        ownedTeams.forEach((t) => { teamNameMap[t.id] = t.name; });

        const { data: requestData, error: requestError } = await supabase
          .from('team_join_requests')
          .select('id, team_id, requesting_user_id, status, requested_at')
          .in('team_id', ownedTeamIds)
          .order('requested_at', { ascending: false });

        if (requestError) throw new Error(`Requests error: ${requestError.message}`);

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
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }

  async function handleAcceptInvite(inviteId: string) {
    setActionLoading(inviteId);
    const { error } = await supabase.rpc('accept_team_invite', { invite_id: inviteId });
    if (error) {
      setError(`Failed to accept invite: ${error.message}`);
    } else {
      await loadNotifications();
    }
    setActionLoading(null);
  }

  async function handleDeclineInvite(inviteId: string) {
    setActionLoading(inviteId);
    await supabase.from('team_invites').update({ status: 'declined' }).eq('id', inviteId);
    await loadNotifications();
    setActionLoading(null);
  }

  async function handleAcceptJoinRequest(requestId: string) {
    setActionLoading(requestId);
    const { error } = await supabase.rpc('accept_join_request', { request_id: requestId });
    if (error) {
      setError(`Failed to accept request: ${error.message}`);
    } else {
      await loadNotifications();
    }
    setActionLoading(null);
  }

  async function handleDeclineJoinRequest(requestId: string) {
    setActionLoading(requestId);
    await supabase.from('team_join_requests').update({ status: 'declined' }).eq('id', requestId);
    await loadNotifications();
    setActionLoading(null);
  }

  if (authLoading) return null;

  const pendingInvites = invites.filter((i) => i.status === 'pending');
  const pastInvites = invites.filter((i) => i.status !== 'pending');
  const pendingRequests = joinRequests.filter((r) => r.status === 'pending');
  const pastRequests = joinRequests.filter((r) => r.status !== 'pending');

  return (
    <div className="flex min-h-screen flex-col bg-page-alt">
      <AppNavbar />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={22} className="text-secondary" />
            <h1 className="text-xl font-bold text-primary">Notifications</h1>
          </div>
          <button
            onClick={loadNotifications}
            className="text-sm text-brand hover:underline"
          >
            Refresh
          </button>
        </div>

        {/* Global error */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Loading skeletons */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-[var(--border)]" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-8">

            {/* ── Team Invites ──────────────────────────────────────── */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <UserPlus size={16} className="text-brand" />
                <h2 className="text-base font-semibold text-primary">Team Invites</h2>
                {pendingInvites.length > 0 && (
                  <Badge variant="info">{pendingInvites.length} pending</Badge>
                )}
              </div>

              {invites.length === 0 ? (
                <div className="rounded-xl border border-dashed border-brand bg-card p-6 text-center">
                  <p className="text-sm text-muted">No team invites yet.</p>
                  <p className="mt-1 text-xs text-muted">
                    Invites appear here when a team owner invites you from AutoMatch results.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {pendingInvites.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-blue-100 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar name={invite.invited_by_name} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-primary">
                            <span className="font-semibold">{invite.invited_by_name}</span>
                            {' '}invited you to join{' '}
                            <Link
                              href={`/teams/${invite.team_id}/workspace`}
                              className="font-semibold text-brand hover:underline"
                            >
                              {invite.team_name}
                            </Link>
                          </p>
                          <p className="text-xs text-muted">
                            {new Date(invite.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleAcceptInvite(invite.id)}
                          isLoading={actionLoading === invite.id}
                        >
                          <Check size={14} />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeclineInvite(invite.id)}
                          isLoading={actionLoading === invite.id}
                        >
                          <X size={14} />
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}

                  {pastInvites.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-brand bg-card p-4 opacity-60"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar name={invite.invited_by_name} size="sm" />
                        <p className="text-sm text-secondary">
                          Invite to <span className="font-medium">{invite.team_name}</span>
                          {' '}from {invite.invited_by_name}
                        </p>
                      </div>
                      <Badge variant={invite.status === 'accepted' ? 'success' : 'danger'}>
                        {invite.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── Join Requests ─────────────────────────────────────── */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <Users size={16} className="text-green-600" />
                <h2 className="text-base font-semibold text-primary">Join Requests</h2>
                {pendingRequests.length > 0 && (
                  <Badge variant="success">{pendingRequests.length} pending</Badge>
                )}
              </div>

              {joinRequests.length === 0 ? (
                <div className="rounded-xl border border-dashed border-brand bg-card p-6 text-center">
                  <p className="text-sm text-muted">No join requests yet.</p>
                  <p className="mt-1 text-xs text-muted">
                    Requests appear here when someone clicks &quot;Request to Join&quot; on a team you own.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-green-100 bg-green-50 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar name={request.requesting_user_name} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-primary">
                            <span className="font-semibold">{request.requesting_user_name}</span>
                            {' '}wants to join{' '}
                            <Link
                              href={`/teams/${request.team_id}/workspace`}
                              className="font-semibold text-brand hover:underline"
                            >
                              {request.team_name}
                            </Link>
                          </p>
                          <p className="text-xs text-muted">
                            {new Date(request.requested_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleAcceptJoinRequest(request.id)}
                          isLoading={actionLoading === request.id}
                        >
                          <Check size={14} />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeclineJoinRequest(request.id)}
                          isLoading={actionLoading === request.id}
                        >
                          <X size={14} />
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}

                  {pastRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-brand bg-card p-4 opacity-60"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar name={request.requesting_user_name} size="sm" />
                        <p className="text-sm text-secondary">
                          <span className="font-medium">{request.requesting_user_name}</span>
                          {' '}requested to join{' '}
                          <span className="font-medium">{request.team_name}</span>
                        </p>
                      </div>
                      <Badge variant={request.status === 'accepted' ? 'success' : 'danger'}>
                        {request.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>
        )}
      </main>
    </div>
  );
}

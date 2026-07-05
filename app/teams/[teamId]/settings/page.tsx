'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppNavbar } from '@/components/layout/app-navbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Modal } from '@/components/ui/modal';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { parseCommaSeparated } from '@/lib/utils';
import type { TeamWithMembers } from '@/types/team';
import type { Profile } from '@/types/user';

export default function TeamSettingsPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [team, setTeam] = useState<TeamWithMembers | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkillsInput, setRequiredSkillsInput] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Profile | null>(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  // Load team data
  useEffect(() => {
    if (!user || !teamId) return;

    async function loadTeam() {
      const { data: teamData } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (!teamData) return;

      // Only the owner can access settings
      if (teamData.owner_id !== user!.id) {
        router.push(`/teams/${teamId}/workspace`);
        return;
      }

      const { data: members } = await supabase
        .from('profiles')
        .select('*')
        .in('id', teamData.current_member_ids);

      setTeam({ ...teamData, members: members || [] });
      setName(teamData.name);
      setDescription(teamData.description);
      setRequiredSkillsInput((teamData.required_skills || []).join(', '));
      setIsOpen(teamData.is_open);
    }

    loadTeam();
  }, [user, teamId, router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    const { error: updateError } = await supabase
      .from('teams')
      .update({
        name: name.trim(),
        description: description.trim(),
        required_skills: parseCommaSeparated(requiredSkillsInput),
        is_open: isOpen,
      })
      .eq('id', teamId);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
    }
    setSaving(false);
  }

  function openRemoveModal(member: Profile) {
    setMemberToRemove(member);
    setShowRemoveModal(true);
  }

  async function handleRemoveMember() {
    if (!memberToRemove || !team) return;
    setRemoving(true);

    const updatedMemberIds = team.current_member_ids.filter(
      (id) => id !== memberToRemove.id
    );

    const { error: removeError } = await supabase
      .from('teams')
      .update({
        current_member_ids: updatedMemberIds,
        // Re-open team if a spot opens up
        is_open: updatedMemberIds.length < team.max_members,
      })
      .eq('id', teamId);

    if (!removeError) {
      setTeam((prev) =>
        prev
          ? {
              ...prev,
              current_member_ids: updatedMemberIds,
              members: prev.members.filter((m) => m.id !== memberToRemove.id),
            }
          : prev
      );
    }

    setRemoving(false);
    setShowRemoveModal(false);
    setMemberToRemove(null);
  }

  if (authLoading || !team) return null;

  const nonOwnerMembers = team.members.filter((m) => m.id !== team.owner_id);

  return (
    <div className="flex min-h-screen flex-col bg-page-alt">
      <AppNavbar />

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
        {/* Breadcrumb */}
        <p className="mb-6 text-sm text-muted">
          <Link
            href={`/teams/${teamId}/workspace`}
            className="hover:text-primary"
          >
            ← Back to Workspace
          </Link>
        </p>

        <h1 className="mb-6 text-xl font-bold text-primary">Team Settings</h1>

        <form onSubmit={handleSave} className="flex flex-col gap-6">

          {/* ── Team Details ───────────────────────────────────── */}
          <section className="rounded-xl border border-brand bg-card p-6">
            <h2 className="mb-4 text-base font-semibold text-primary">
              Team Details
            </h2>
            <div className="flex flex-col gap-4">
              <Input
                id="team-name"
                label="Team Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="team-description"
                  className="text-sm font-medium text-secondary"
                >
                  Description
                </label>
                <textarea
                  id="team-description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-brand bg-card px-3 py-2 text-sm text-primary placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-royal)]"
                />
              </div>
              <Input
                id="required-skills"
                label="Skills still needed (comma-separated)"
                placeholder="e.g. Python, UI/UX, DevOps"
                hint="Update this as your team fills up so AutoMatch stays accurate."
                value={requiredSkillsInput}
                onChange={(e) => setRequiredSkillsInput(e.target.value)}
              />
            </div>
          </section>

          {/* ── Team Status ────────────────────────────────────── */}
          <section className="rounded-xl border border-brand bg-card p-6">
            <h2 className="mb-2 text-base font-semibold text-primary">
              Team Status
            </h2>
            <p className="mb-4 text-sm text-muted">
              When closed, your team won&apos;t appear in Join Team recommendations
              and AutoMatch won&apos;t suggest you to candidates.
            </p>
            <label className="flex cursor-pointer items-center gap-3">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isOpen}
                  onChange={(e) => setIsOpen(e.target.checked)}
                />
                <div
                  className={`h-6 w-11 rounded-full transition-colors ${
                    isOpen ? 'bg-[var(--brand-royal)]' : 'bg-[var(--border)]'
                  }`}
                />
                <div
                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform ${
                    isOpen ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
              <span className="text-sm font-medium text-secondary">
                {isOpen
                  ? 'Open — accepting new members'
                  : 'Closed — not accepting new members'}
              </span>
            </label>
          </section>

          {/* ── Save button ────────────────────────────────────── */}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && (
            <p className="text-sm font-medium text-green-600">
              ✓ Team settings saved
            </p>
          )}
          <Button type="submit" isLoading={saving} fullWidth>
            Save Settings
          </Button>
        </form>

        {/* ── Member Management ──────────────────────────────── */}
        {nonOwnerMembers.length > 0 && (
          <section className="mt-6 rounded-xl border border-brand bg-card p-6">
            <h2 className="mb-4 text-base font-semibold text-primary">
              Members ({team.members.length}/{team.max_members})
            </h2>
            <ul className="flex flex-col gap-3">
              {team.members.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={member.full_name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-primary">
                        {member.full_name}
                        {member.id === team.owner_id && (
                          <span className="ml-2 text-xs text-brand">Owner</span>
                        )}
                      </p>
                      <p className="text-xs capitalize text-muted">
                        {member.preferred_roles[0]} · {member.experience_level}
                      </p>
                    </div>
                  </div>
                  {member.id !== team.owner_id && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => openRemoveModal(member)}
                    >
                      Remove
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      {/* Remove member confirmation modal */}
      <Modal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        title="Remove Member"
      >
        <p className="text-sm text-secondary">
          Are you sure you want to remove{' '}
          <span className="font-semibold">{memberToRemove?.full_name}</span> from
          the team? This cannot be undone.
        </p>
        <div className="mt-5 flex gap-3">
          <Button
            variant="danger"
            fullWidth
            onClick={handleRemoveMember}
            isLoading={removing}
          >
            Yes, Remove
          </Button>
          <Button
            variant="outline"
            fullWidth
            onClick={() => setShowRemoveModal(false)}
          >
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}

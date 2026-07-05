'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { parseCommaSeparated } from '@/lib/utils';

interface CreateTeamFormProps {
  hackathonId: string;
  maxAllowedMembers: number;
  onSubmit: (data: CreateTeamFormData) => Promise<void>;
  isSubmitting: boolean;
}

export interface CreateTeamFormData {
  name: string;
  description: string;
  required_skills: string[];
  max_members: number;
}

export function CreateTeamForm({
  hackathonId,
  maxAllowedMembers,
  onSubmit,
  isSubmitting,
}: CreateTeamFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkillsInput, setRequiredSkillsInput] = useState('');
  const [maxMembers, setMaxMembers] = useState(maxAllowedMembers);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Team name is required.');
      return;
    }

    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      required_skills: parseCommaSeparated(requiredSkillsInput),
      max_members: maxMembers,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        id="team-name"
        label="Team Name"
        placeholder="e.g. Team Nexus"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <div className="flex flex-col gap-1">
        <label htmlFor="team-description" className="text-sm font-medium text-secondary">
          Description
        </label>
        <textarea
          id="team-description"
          rows={3}
          placeholder="What are you building? What problem are you solving?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-brand bg-card px-3 py-2 text-sm text-primary placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-royal)]"
        />
      </div>

      <Input
        id="required-skills"
        label="Skills you're looking for (comma-separated)"
        placeholder="e.g. React, Node.js, UI/UX, Python"
        hint="These skills are used by AutoMatch to suggest the best candidates."
        value={requiredSkillsInput}
        onChange={(e) => setRequiredSkillsInput(e.target.value)}
      />

      <div className="flex flex-col gap-1">
        <label htmlFor="max-members" className="text-sm font-medium text-secondary">
          Team Size (max {maxAllowedMembers} for this hackathon)
        </label>
        <input
          id="max-members"
          type="number"
          min={1}
          max={maxAllowedMembers}
          value={maxMembers}
          onChange={(e) => setMaxMembers(Number(e.target.value))}
          className="w-24 rounded-lg border border-brand bg-card px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-[var(--brand-royal)]"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" isLoading={isSubmitting} fullWidth>
        Create Team & Find Teammates
      </Button>
    </form>
  );
}

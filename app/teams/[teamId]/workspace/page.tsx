'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppNavbar } from '@/components/layout/app-navbar';
import { WorkspaceSidebar } from '@/components/layout/workspace-sidebar';
import { TeamChat } from '@/components/workspace/team-chat';
import { AIMentor } from '@/components/workspace/ai-mentor';
import { TaskBoard } from '@/components/workspace/task-board';
import { Roadmap } from '@/components/workspace/roadmap';
import { BoilerplateGenerator } from '@/components/workspace/boilerplate-generator';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function WorkspacePage() {
  const { teamId } = useParams<{ teamId: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    team,
    messages,
    tasks,
    activeTab,
    setActiveTab,
    loading: workspaceLoading,
    sendMessage,
    updateTaskStatus,
  } = useWorkspace(teamId);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  if (authLoading || workspaceLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted">Loading workspace...</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex min-h-screen flex-col">
        <AppNavbar />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted">Team not found or you don&apos;t have access.</p>
        </main>
      </div>
    );
  }

  const displayName = user?.user_metadata?.full_name || user?.email || 'You';

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <AppNavbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <WorkspaceSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          teamName={team.name}
          teamId={teamId}
        />

        {/* Main workspace area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Overview tab */}
          {activeTab === 'overview' && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mx-auto max-w-3xl flex flex-col gap-6">
                {/* Team header */}
                <div className="rounded-xl border border-brand bg-card p-6">
                  <h1 className="text-xl font-bold text-primary">{team.name}</h1>
                  <p className="mt-2 text-sm text-secondary">{team.description}</p>

                  {team.required_skills.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 text-xs font-medium text-muted uppercase tracking-wider">
                        Still looking for
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {team.required_skills.map((skill) => (
                          <Badge key={skill} variant="info">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Team members */}
                <div className="rounded-xl border border-brand bg-card p-6">
                  <h2 className="text-base font-semibold text-primary">
                    Team Members ({team.members.length}/{team.max_members})
                  </h2>
                  <ul className="mt-4 flex flex-col gap-4">
                    {team.members.map((member) => (
                      <li key={member.id} className="flex items-center gap-3">
                        <Avatar name={member.full_name} src={member.avatar_url} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-primary">
                              {member.full_name}
                            </p>
                            {member.id === team.owner_id && (
                              <Badge variant="info">Owner</Badge>
                            )}
                          </div>
                          <p className="text-xs capitalize text-muted">
                            {member.preferred_roles[0]} · {member.experience_level}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {member.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="default">{skill}</Badge>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quick links to other tabs */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { tab: 'chat', label: 'Team Chat', description: 'Message your team' },
                    { tab: 'ai-mentor', label: 'AI Mentor', description: 'Get help from AI' },
                    { tab: 'tasks', label: 'Tasks', description: `${tasks.length} tasks` },
                    { tab: 'roadmap', label: 'Roadmap', description: 'Plan your build' },
                  ].map(({ tab, label, description }) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className="rounded-xl border border-brand bg-card p-4 text-left transition-shadow hover:shadow-md"
                    >
                      <p className="text-sm font-semibold text-primary">{label}</p>
                      <p className="mt-0.5 text-xs text-muted">{description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Chat tab */}
          {activeTab === 'chat' && (
            <TeamChat
              messages={messages}
              currentUserId={user?.id || ''}
              currentUserName={displayName}
              onSendMessage={(content) => sendMessage(content, user?.id || '', displayName)}
            />
          )}

          {/* AI Mentor tab */}
          {activeTab === 'ai-mentor' && (
            <AIMentor team={team} currentUserId={user?.id || ''} />
          )}

          {/* Tasks tab */}
          {activeTab === 'tasks' && (
            <TaskBoard tasks={tasks} onStatusChange={updateTaskStatus} />
          )}

          {/* Roadmap tab */}
          {activeTab === 'roadmap' && <Roadmap team={team} />}

          {/* Boilerplate tab */}
          {activeTab === 'boilerplate' && <BoilerplateGenerator team={team} />}
        </div>
      </div>
    </div>
  );
}

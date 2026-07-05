'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { TeamWithMembers, ChatMessage, Task } from '@/types/team';

export type WorkspaceTab = 'overview' | 'chat' | 'ai-mentor' | 'tasks' | 'roadmap' | 'boilerplate';

export function useWorkspace(teamId: string) {
  const [team, setTeam] = useState<TeamWithMembers | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamId) return;

    async function loadWorkspace() {
      // Load team + members
      const { data: teamData } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (teamData) {
        const { data: members } = await supabase
          .from('profiles')
          .select('*')
          .in('id', teamData.current_member_ids);

        setTeam({ ...teamData, members: members || [] });
      }

      // Load chat messages
      const { data: messagesData } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: true });

      setMessages(messagesData || []);

      // Load tasks
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('team_id', teamId);

      setTasks(tasksData || []);
      setLoading(false);
    }

    loadWorkspace();

    // Real-time subscription for new chat messages
    const channel = supabase
      .channel(`workspace-${teamId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `team_id=eq.${teamId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId]);

  async function sendMessage(content: string, senderId: string, senderName: string) {
    const { error } = await supabase.from('chat_messages').insert({
      team_id: teamId,
      sender_id: senderId,
      sender_name: senderName,
      content,
      is_ai_message: false,
    });
    if (error) throw error;
  }

  async function updateTaskStatus(taskId: string, status: Task['status']) {
    const { error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', taskId);
    if (error) throw error;
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
  }

  return {
    team,
    messages,
    tasks,
    activeTab,
    setActiveTab,
    loading,
    sendMessage,
    updateTaskStatus,
  };
}

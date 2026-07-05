'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppNavbar } from '@/components/layout/app-navbar';
import { HackathonCard } from '@/components/dashboard/hackathon-card';
import { AlertSidebar } from '@/components/dashboard/alert-sidebar';
import { SearchBar } from '@/components/dashboard/search-bar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { MOCK_HACKATHONS, getHotHackathons } from '@/data/hackathons';
import type { HackathonCardData, Hackathon } from '@/types/hackathon';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [registeredHackathons, setRegisteredHackathons] = useState<Hackathon[]>([]);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  // Load hackathons this user has registered for (clicked Interested)
  useEffect(() => {
    if (!user) return;
    async function loadRegisteredHackathons() {
      const { data } = await supabase
        .from('user_hackathons')
        .select('hackathon_id')
        .eq('user_id', user!.id);

      if (data) {
        const registeredIds = data.map((row) => row.hackathon_id);
        const registered = MOCK_HACKATHONS.filter((h) => registeredIds.includes(h.id));
        setRegisteredHackathons(registered);
      }
    }
    loadRegisteredHackathons();
  }, [user]);

  // Filter hackathons by search query (title, tags, organizer)
  const filteredHackathons: HackathonCardData[] = MOCK_HACKATHONS.filter((h) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      h.title.toLowerCase().includes(query) ||
      h.organizer.toLowerCase().includes(query) ||
      h.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  const hotHackathons = getHotHackathons();

  if (authLoading) return null;

  return (
    <div className="flex min-h-screen flex-col bg-page-alt">
      <AppNavbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        {/* Search bar */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search hackathons by name, tag, or organizer..."
        />

        <div className="mt-6 flex gap-6">
          {/* Main content area — hackathon grid */}
          <div className="flex-1 min-w-0">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-primary">
                Upcoming Hackathons
                <span className="ml-2 text-sm font-normal text-muted">
                  ({filteredHackathons.length} found)
                </span>
              </h2>
            </div>

            {filteredHackathons.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-brand bg-card py-16 text-center">
                <p className="text-sm font-medium text-secondary">No hackathons match your search.</p>
                <p className="text-xs text-muted">Try a different keyword or clear the filter.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredHackathons.map((hackathon) => (
                  <HackathonCard key={hackathon.id} hackathon={hackathon} />
                ))}
              </div>
            )}
          </div>

          {/* Right sidebar — Alert + Hot */}
          <div className="hidden lg:block">
            <AlertSidebar
              registeredHackathons={registeredHackathons}
              hotHackathons={hotHackathons}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

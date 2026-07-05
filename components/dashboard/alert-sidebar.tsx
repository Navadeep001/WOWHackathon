import Link from 'next/link';
import { Bell, Flame } from 'lucide-react';
import { timeFromNow } from '@/lib/utils';
import type { Hackathon } from '@/types/hackathon';

interface AlertSidebarProps {
  registeredHackathons: Hackathon[];   // hackathons this user registered for
  hotHackathons: Hackathon[];          // trending hackathons from getHotHackathons()
}

export function AlertSidebar({ registeredHackathons, hotHackathons }: AlertSidebarProps) {
  return (
    <aside className="flex w-72 flex-col gap-6">
      {/* Alert section — registered hackathons with deadlines */}
      <div className="rounded-xl border border-brand bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Bell size={16} className="text-yellow-500" />
          Alert
        </div>
        {registeredHackathons.length === 0 ? (
          <p className="mt-3 text-xs text-muted">
            No registered hackathons yet. Explore and hit &quot;Interested&quot;!
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {registeredHackathons.map((hackathon) => (
              <li key={hackathon.id}>
                <Link href={`/hackathons/${hackathon.id}`}>
                  <div className="rounded-lg bg-yellow-50 p-3 hover:bg-yellow-100">
                    <p className="text-sm font-medium text-primary">{hackathon.title}</p>
                    <p className="mt-0.5 text-xs text-yellow-700">
                      Registration closes: {timeFromNow(hackathon.registration_deadline)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Hot section — trending hackathons */}
      <div className="rounded-xl border border-brand bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Flame size={16} className="text-orange-500" />
          Hot
        </div>
        <ul className="mt-3 flex flex-col gap-2">
          {hotHackathons.map((hackathon) => (
            <li key={hackathon.id}>
              <Link href={`/hackathons/${hackathon.id}`}>
                <div className="flex items-center gap-2 rounded-lg p-2 hover:bg-[var(--bg-secondary)]">
                  <Flame size={14} className="shrink-0 text-orange-400" />
                  <div>
                    <p className="text-sm font-medium text-primary">{hackathon.title}</p>
                    <p className="text-xs text-muted">
                      {hackathon.participant_count.toLocaleString()} participants
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

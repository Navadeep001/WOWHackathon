import Link from 'next/link';
import { Calendar, Users, Trophy, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate, timeFromNow } from '@/lib/utils';
import type { HackathonCardData } from '@/types/hackathon';

interface HackathonCardProps {
  hackathon: HackathonCardData;
}

const STATUS_BADGE_VARIANT: Record<string, 'success' | 'warning' | 'default'> = {
  upcoming: 'default',
  ongoing: 'success',
  ended: 'default',
};

export function HackathonCard({ hackathon }: HackathonCardProps) {
  const deadlineText = timeFromNow(hackathon.registration_deadline);
  const isUrgent =
    hackathon.status === 'ongoing' ||
    (hackathon.status === 'upcoming' &&
      new Date(hackathon.registration_deadline).getTime() - Date.now() <
        3 * 24 * 60 * 60 * 1000); // within 3 days

  return (
    <Link href={`/hackathons/${hackathon.id}`}>
      <article className="flex h-full flex-col gap-4 rounded-xl border border-brand bg-card p-5 transition-shadow hover:shadow-md">
        {/* Title + status */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-primary leading-snug">{hackathon.title}</h3>
          <Badge variant={STATUS_BADGE_VARIANT[hackathon.status]}>
            {hackathon.status}
          </Badge>
        </div>

        {/* Organizer */}
        <p className="text-sm text-muted">{hackathon.organizer}</p>

        {/* Key details row */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Calendar size={13} />
            {formatDate(hackathon.registration_deadline)}
          </span>
          <span className="flex items-center gap-1">
            <Trophy size={13} />
            {hackathon.prize_pool}
          </span>
          <span className="flex items-center gap-1">
            <Users size={13} />
            {hackathon.min_team_size}–{hackathon.max_team_size} members
          </span>
          <span className="flex items-center gap-1 capitalize">
            <MapPin size={13} />
            {hackathon.mode}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {hackathon.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="info">{tag}</Badge>
          ))}
        </div>

        {/* Registration deadline urgency */}
        <p
          className={`mt-auto text-xs font-medium ${
            isUrgent ? 'text-red-600' : 'text-muted'
          }`}
        >
          {hackathon.status === 'ended'
            ? 'Registration closed'
            : `Registration closes: ${deadlineText}`}
        </p>
      </article>
    </Link>
  );
}

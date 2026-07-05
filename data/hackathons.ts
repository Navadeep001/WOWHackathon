import { Hackathon } from '@/types/hackathon';

export const MOCK_HACKATHONS: Hackathon[] = [
  {
    id: 'hack-001',
    title: 'AI Innovation Challenge 2025',
    organizer: 'Google Developer Groups',
    description:
      'Build AI-powered solutions that solve real-world problems. Open to all engineering students across India.',
    registration_deadline: '2025-08-15',
    start_date: '2025-08-20',
    end_date: '2025-08-21',
    prize_pool: '₹5,00,000',
    min_team_size: 2,
    max_team_size: 4,
    tags: ['AI', 'Machine Learning', 'Open Innovation'],
    mode: 'hybrid',
    location: 'Bangalore + Online',
    status: 'upcoming',
    participant_count: 1240,
    external_url: 'https://unstop.com',
  },
  {
    id: 'hack-002',
    title: 'Web3 Buildathon',
    organizer: 'Ethereum India',
    description:
      'Decentralized applications, DeFi tools, NFT platforms — build the future of Web3 in 36 hours.',
    registration_deadline: '2025-08-10',
    start_date: '2025-08-18',
    end_date: '2025-08-19',
    prize_pool: '$10,000',
    min_team_size: 1,
    max_team_size: 3,
    tags: ['Web3', 'Blockchain', 'DeFi', 'NFT'],
    mode: 'online',
    status: 'upcoming',
    participant_count: 870,
  },
  {
    id: 'hack-003',
    title: 'Smart India Hackathon 2025',
    organizer: 'Government of India',
    description:
      'National-level hackathon addressing problem statements from government ministries and PSUs.',
    registration_deadline: '2025-09-01',
    start_date: '2025-09-20',
    end_date: '2025-09-22',
    prize_pool: '₹10,00,000',
    min_team_size: 6,
    max_team_size: 6,
    tags: ['GovTech', 'Social Impact', 'Healthcare', 'AgriTech'],
    mode: 'offline',
    location: 'Pan India (Nodal Centers)',
    status: 'upcoming',
    participant_count: 15000,
    external_url: 'https://sih.gov.in',
  },
  {
    id: 'hack-004',
    title: 'FinTech Future Hack',
    organizer: 'Razorpay & YCombinator India',
    description:
      'Reimagine financial services — payments, lending, insurance, and wealth management for Bharat.',
    registration_deadline: '2025-07-30',
    start_date: '2025-08-08',
    end_date: '2025-08-09',
    prize_pool: '₹3,00,000',
    min_team_size: 2,
    max_team_size: 5,
    tags: ['FinTech', 'Payments', 'Banking', 'AI'],
    mode: 'hybrid',
    location: 'Mumbai + Online',
    status: 'upcoming',
    participant_count: 620,
  },
  {
    id: 'hack-005',
    title: 'Sustainability Hack',
    organizer: 'United Nations India',
    description:
      'Tech solutions for climate change, clean energy, water conservation, and sustainable agriculture.',
    registration_deadline: '2025-08-25',
    start_date: '2025-09-05',
    end_date: '2025-09-06',
    prize_pool: '$7,500',
    min_team_size: 2,
    max_team_size: 4,
    tags: ['CleanTech', 'Sustainability', 'SDGs', 'IoT'],
    mode: 'online',
    status: 'upcoming',
    participant_count: 980,
  },
  {
    id: 'hack-006',
    title: 'Health-Tech Hackathon',
    organizer: 'Apollo Hospitals & IIT Delhi',
    description:
      'Build digital health tools — telemedicine, patient monitoring, diagnostic AI, and hospital management.',
    registration_deadline: '2025-08-05',
    start_date: '2025-08-12',
    end_date: '2025-08-13',
    prize_pool: '₹2,00,000',
    min_team_size: 2,
    max_team_size: 4,
    tags: ['HealthTech', 'AI', 'IoT', 'MedTech'],
    mode: 'offline',
    location: 'New Delhi',
    status: 'upcoming',
    participant_count: 450,
  },
  {
    id: 'hack-007',
    title: 'WOW Hackathon — GITAM University',
    organizer: 'Google & GITAM University',
    description:
      'Build innovative solutions across any domain. Mentored by Google engineers. Open to GITAM students.',
    registration_deadline: '2025-07-20',
    start_date: '2025-07-25',
    end_date: '2025-07-26',
    prize_pool: '₹1,00,000',
    min_team_size: 2,
    max_team_size: 4,
    tags: ['Open Innovation', 'AI', 'Web', 'Mobile'],
    mode: 'offline',
    location: 'GITAM University, Visakhapatnam',
    status: 'ongoing',
    participant_count: 300,
  },
];

// Returns hackathons marked as "Hot" (high participant count or ongoing)
export function getHotHackathons(): Hackathon[] {
  return MOCK_HACKATHONS.filter(
    (h) => h.participant_count > 800 || h.status === 'ongoing'
  ).slice(0, 5);
}

export function getHackathonById(id: string): Hackathon | undefined {
  return MOCK_HACKATHONS.find((h) => h.id === id);
}

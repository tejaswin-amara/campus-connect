import type { CampusEvent } from '../types';

export const INITIAL_EVENTS: CampusEvent[] = [
  {
    id: 1,
    title: 'Autonomous Agents Hackathon 2026',
    description:
      'A 48-hour competitive sprint engineered for teams building autonomous coding assistants, MCP tools, and sovereign local LLM platforms. Features live hardware clusters and mentor-led design reviews.',
    category: 'Technical',
    venue: 'Turing Innovation Hall 301',
    dateTime: '2026-09-24T09:00:00',
    endDateTime: '2026-09-26T18:00:00',
    maxCapacity: 120,
    registeredCount: 88,
    registrationLink: 'https://campusconnect.edu/register/1',
    responsesLink: 'https://campusconnect.edu/responses/1',
    imageUrl:
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
    isRecommended: true,
    recommendationReasons: ['Matches Computer Science profile', 'High peer engagement score'],
    syllabus: [
      'Day 1: Problem statement unveiling & architecture validation',
      'Day 2: Overnight building sprint & cluster stress testing',
      'Day 3: Final pitch round before venture judges & awards',
    ],
    eligibility: [
      'Undergraduate or Postgraduate student enrolled in AY 2026–27',
      'Teams of 2 to 4 members with at least one verified GitHub profile',
      'Laptop with Docker and Node.js v22+ or Python 3.12+ pre-installed',
    ],
    coordinators: [
      { name: 'Dr. Evelyn Vance', role: 'Faculty Lead, AI Lab', email: 'e.vance@campus.edu' },
      { name: 'Marcus Chen', role: 'President, ACM Student Chapter', email: 'm.chen@campus.edu' },
    ],
  },
  {
    id: 2,
    title: 'Inter-Collegiate Symphony & Jazz Gala',
    description:
      'An electric evening featuring collegiate orchestral compositions, guest woodwind soloists, and modern brass ensembles beneath the open-air amphitheater stars.',
    category: 'Cultural',
    venue: 'Grand Open-Air Amphitheater',
    dateTime: '2026-09-28T18:30:00',
    endDateTime: '2026-09-28T22:00:00',
    maxCapacity: 350,
    registeredCount: 290,
    registrationLink: 'https://campusconnect.edu/register/2',
    imageUrl:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    isRecommended: false,
    syllabus: [
      'Movement I: Classical Suite in D Minor',
      'Movement II: Inter-Collegiate Jazz Improvisations',
      'Movement III: Combined Symphonic Finale',
    ],
    eligibility: [
      'Open to all university students, faculty, and alumni',
      'Student ID badge required at turnstiles for complimentary admission',
    ],
    coordinators: [
      {
        name: 'Maestro Julian Reed',
        role: 'Director of Instrumental Studies',
        email: 'j.reed@campus.edu',
      },
      { name: 'Aria Montgomery', role: 'Cultural Secretary', email: 'a.montgomery@campus.edu' },
    ],
  },
  {
    id: 3,
    title: 'Varsity Basketball Championship Finals',
    description:
      'Cheer on the university team in the national cup finals against State Tech. Free commemorative jersey for the first 100 courtside attendees.',
    category: 'Sports',
    venue: 'Main Campus Arena',
    dateTime: '2026-10-02T17:00:00',
    endDateTime: '2026-10-02T20:30:00',
    maxCapacity: 500,
    registeredCount: 475,
    imageUrl:
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
    isRecommended: true,
    recommendationReasons: ['Campus spirit marquee event', 'Exclusive merchandise giveaway'],
    syllabus: [
      '16:30: Arena doors open & pep band warm-up',
      '17:00: Tip-off: CampusConnect Knights vs. State Tech Titans',
      '19:45: Trophy presentation & post-game rally',
    ],
    eligibility: [
      'Active student ID mandatory for student section wristbands',
      'Clear bag policy strictly enforced at arena gates',
    ],
    coordinators: [
      { name: 'Coach Ray Delgado', role: 'Head Coach, Athletics', email: 'r.delgado@campus.edu' },
      { name: 'Kobe Alvarez', role: 'Sports Council Convener', email: 'k.alvarez@campus.edu' },
    ],
  },
  {
    id: 4,
    title: 'Cloud Infrastructure & Kubernetes Deep Dive',
    description:
      'Hands-on cluster deployment workshop covering OpenTofu/Terraform orchestration, container networking, and auto-scaling policies on live cloud instances.',
    category: 'Workshop',
    venue: 'Computing Lab 4B',
    dateTime: '2026-10-05T14:00:00',
    endDateTime: '2026-10-05T17:30:00',
    maxCapacity: 45,
    registeredCount: 44,
    registrationLink: 'https://campusconnect.edu/register/4',
    imageUrl:
      'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=80',
    isRecommended: true,
    recommendationReasons: ['Hands-on laboratory format', 'Critical capacity (1 seat remaining)'],
    syllabus: [
      'Module 1: Pod lifecycles, Services, and Ingress routing',
      'Module 2: State management with Persistent Volumes and Helm',
      'Module 3: Chaos engineering drill & auto-healing verification',
    ],
    eligibility: [
      'Familiarity with basic Linux CLI and container concepts',
      'Personal laptop with terminal and SSH client ready',
    ],
    coordinators: [
      { name: 'Samantha Wu', role: 'Cloud Infrastructure Architect', email: 's.wu@campus.edu' },
    ],
  },
  {
    id: 5,
    title: 'AI Governance & Safety Keynote',
    description:
      'Distinguished keynote lecture exploring international compliance frameworks, algorithmic accountability, and societal safety bounds for agentic intelligence.',
    category: 'Seminar',
    venue: 'Auditorium Hall B',
    dateTime: '2026-10-10T11:00:00',
    endDateTime: '2026-10-10T13:00:00',
    maxCapacity: 200,
    registeredCount: 135,
    registrationLink: 'https://campusconnect.edu/register/5',
    imageUrl:
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
    isRecommended: false,
    syllabus: [
      'Part 1: The Frontier Model Safety Ecosystem',
      'Part 2: Red Teaming, Jailbreak Mitigation & Guardrails',
      'Part 3: Interactive Open Floor Q&A with Panelists',
    ],
    eligibility: ['Open to all faculties and interdisciplinary departments'],
    coordinators: [
      {
        name: 'Prof. David K. Sterling',
        role: 'Chair of Ethics in Computing',
        email: 'd.sterling@campus.edu',
      },
    ],
  },
  {
    id: 6,
    title: 'Digital Arts & Architectural Photography Expo',
    description:
      'Exhibition spotlighting student digital matte painting, brutalist architecture studies, and generative visual media curated by the Department of Fine Arts.',
    category: 'Cultural',
    venue: 'Fine Arts Gallery & Sky Terrace',
    dateTime: '2026-10-15T10:00:00',
    endDateTime: '2026-10-15T19:00:00',
    maxCapacity: 150,
    registeredCount: 65,
    imageUrl:
      'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=800&q=80',
    isRecommended: false,
    syllabus: [
      'Gallery Floor: 40 curated photographic and digital displays',
      '14:00: Artist walkthrough & critique panel',
      '18:00: Sunset reception on the Sky Terrace',
    ],
    eligibility: ['Free entry for university community and invited guests'],
    coordinators: [
      { name: 'Elena Rostova', role: 'Exhibition Curator', email: 'e.rostova@campus.edu' },
    ],
  },
];

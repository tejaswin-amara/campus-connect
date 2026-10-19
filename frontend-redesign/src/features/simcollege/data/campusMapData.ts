import type { CampusBuildingData, EventCategory, SimCollegeEventPin } from '../types/simcollege';

/**
 * Universal Okabe-Ito Color Palette specification
 * Formatted for WCAG 2.2 contrast compliance.
 * Yellow and Sky Blue feature mandatory dark borders (border-slate-900).
 */
export const OKABE_ITO_COLORS: Record<
  EventCategory,
  { bg: string; text: string; stroke: string; label: string; needsDarkBorder: boolean }
> = {
  academic: {
    bg: '#0072B2', // Blue
    text: '#ffffff',
    stroke: '#004a75',
    label: 'Academic',
    needsDarkBorder: false,
  },
  arts: {
    bg: '#E69F00', // Orange
    text: '#000000',
    stroke: '#996300',
    label: 'Arts & Culture',
    needsDarkBorder: false,
  },
  sports: {
    bg: '#009E73', // Bluish Green
    text: '#000000',
    stroke: '#005941',
    label: 'Athletics & Sports',
    needsDarkBorder: false,
  },
  social: {
    bg: '#D55E00', // Vermilion
    text: '#000000',
    stroke: '#8a3c00',
    label: 'Social & Clubs',
    needsDarkBorder: false,
  },
  tech: {
    bg: '#CC79A7', // Reddish Purple
    text: '#000000',
    stroke: '#7e355f',
    label: 'Tech & Hackathons',
    needsDarkBorder: false,
  },
  career: {
    bg: '#F0E442', // Yellow
    text: '#0f172a',
    stroke: '#0f172a', // Dark outline required for contrast on light terrain
    label: 'Careers & Networking',
    needsDarkBorder: true,
  },
  wellness: {
    bg: '#56B4E9', // Sky Blue
    text: '#0f172a',
    stroke: '#0f172a', // Dark outline required for contrast on light terrain
    label: 'Health & Wellness',
    needsDarkBorder: true,
  },
};

export const CAMPUS_BUILDINGS: CampusBuildingData[] = [
  {
    id: 'library',
    name: 'Ada Lovelace Library',
    gridX: 2,
    gridY: 1,
    gridWidth: 2,
    gridDepth: 2,
    height: 75,
    description: 'Central campus library, digital archives, and quiet study atrium.',
    accentColor: '#38bdf8',
  },
  {
    id: 'tech_quad',
    name: 'Alan Turing Engineering Center',
    gridX: 5,
    gridY: 1,
    gridWidth: 2,
    gridDepth: 2,
    height: 90,
    description: 'Robotics labs, software engineering suites, and hackathon concourse.',
    accentColor: '#a855f7',
  },
  {
    id: 'student_union',
    name: 'Campus Student Commons',
    gridX: 2,
    gridY: 4,
    gridWidth: 2,
    gridDepth: 2,
    height: 65,
    description: 'Dining halls, student club headquarters, and event amphitheater.',
    accentColor: '#f97316',
  },
  {
    id: 'arena',
    name: 'Titan Sports & Recreation Complex',
    gridX: 5,
    gridY: 4,
    gridWidth: 2,
    gridDepth: 2,
    height: 55,
    description: 'Indoor courts, fitness tracks, and intramural tournament pavilion.',
    accentColor: '#10b981',
  },
  {
    id: 'innovation_hub',
    name: 'Venture & Innovation Hub',
    gridX: 1,
    gridY: 0,
    gridWidth: 1,
    gridDepth: 1,
    height: 50,
    description: 'Startup incubator, angel pitch stage, and design thinking studio.',
    accentColor: '#eab308',
  },
  {
    id: 'arts_pavilion',
    name: 'Fine Arts & Music Pavilion',
    gridX: 0,
    gridY: 3,
    gridWidth: 1,
    gridDepth: 1,
    height: 45,
    description: 'Acoustic concert hall, exhibition gallery, and sculpture garden.',
    accentColor: '#ec4899',
  },
];

export const INITIAL_EVENT_PINS: SimCollegeEventPin[] = [
  {
    id: 101,
    title: 'Spring Hackathon 2026: AI & Systems',
    category: 'tech',
    venue: 'Alan Turing Engineering Center',
    gridX: 5.5,
    gridY: 1.5,
    time: '09:00 AM - 09:00 PM',
    date: 'Oct 24, 2026',
    capacity: 250,
    registeredCount: 180,
    status: 'UPCOMING',
  },
  {
    id: 102,
    title: 'Annual Tech Career Fair & Mixer',
    category: 'career',
    venue: 'Campus Student Commons',
    gridX: 2.5,
    gridY: 4.5,
    time: '11:00 AM - 04:00 PM',
    date: 'Oct 25, 2026',
    capacity: 400,
    registeredCount: 320,
    status: 'UPCOMING',
  },
  {
    id: 103,
    title: 'Campus Intramural Basketball Finals',
    category: 'sports',
    venue: 'Titan Sports & Recreation Complex',
    gridX: 5.5,
    gridY: 4.5,
    time: '05:00 PM - 08:00 PM',
    date: 'Oct 26, 2026',
    capacity: 300,
    registeredCount: 290,
    status: 'LIVE',
  },
  {
    id: 104,
    title: 'Distributed Systems & Database Seminar',
    category: 'academic',
    venue: 'Ada Lovelace Library',
    gridX: 2.5,
    gridY: 1.5,
    time: '02:00 PM - 03:30 PM',
    date: 'Oct 27, 2026',
    capacity: 120,
    registeredCount: 95,
    status: 'UPCOMING',
  },
  {
    id: 105,
    title: 'Sunset Jazz & Visual Arts Showcase',
    category: 'arts',
    venue: 'Fine Arts & Music Pavilion',
    gridX: 0.5,
    gridY: 3.5,
    time: '06:30 PM - 09:00 PM',
    date: 'Oct 28, 2026',
    capacity: 150,
    registeredCount: 110,
    status: 'UPCOMING',
  },
  {
    id: 106,
    title: 'Mindfulness & Campus Wellness Circle',
    category: 'wellness',
    venue: 'Venture & Innovation Hub Garden',
    gridX: 1.5,
    gridY: 0.5,
    time: '08:00 AM - 09:30 AM',
    date: 'Oct 29, 2026',
    capacity: 60,
    registeredCount: 45,
    status: 'UPCOMING',
  },
];

export const GRID_CONFIG = {
  columns: 8,
  rows: 8,
  // Define coordinates that form pedestrian stone plazas/walkways
  pathCoords: new Set([
    '2,0',
    '2,1',
    '2,2',
    '2,3',
    '2,4',
    '2,5',
    '2,6',
    '2,7', // North-South spine
    '0,3',
    '1,3',
    '3,3',
    '4,3',
    '5,3',
    '6,3',
    '7,3', // East-West boulevard
    '5,0',
    '5,1',
    '5,2',
    '5,4',
    '5,5',
    '5,6',
    '5,7', // East spine
  ]),
  waterCoords: new Set([
    '3,4',
    '4,4', // Central reflection pond
  ]),
};

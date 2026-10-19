export interface GridCoord {
  x: number;
  y: number;
  z?: number; // Layer or elevation offset
}

export interface ScreenCoord {
  x: number;
  y: number;
}

export interface TileSize {
  width: number;
  height: number;
}

export type EventCategory =
  | 'academic'
  | 'arts'
  | 'sports'
  | 'social'
  | 'tech'
  | 'career'
  | 'wellness';

export interface CampusBuildingData {
  id: string;
  name: string;
  gridX: number;
  gridY: number;
  gridWidth: number;
  gridDepth: number;
  height: number;
  description: string;
  accentColor: string;
}

export interface SimCollegeEventPin {
  id: number;
  title: string;
  category: EventCategory;
  venue: string;
  gridX: number;
  gridY: number;
  time: string;
  date: string;
  capacity: number;
  registeredCount: number;
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED';
}

export interface MapViewportState {
  panX: number;
  panY: number;
  zoom: number;
}

export type ViewModality = 'split' | 'map' | 'list';

export interface SimCollegeTelemetryPayload {
  eventId: string; // Deterministic/v4 UUID for deduplication
  eventType: 'map_pan' | 'map_zoom' | 'pin_focus' | 'pin_click' | 'view_toggle' | 'list_select';
  pinId?: number;
  venue?: string;
  modality?: ViewModality;
  zoomLevel?: number;
  timestamp: string;
}

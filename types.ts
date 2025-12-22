
export type UserRole = 'ADMIN' | 'OPERATOR' | 'AUDITOR';

export interface User {
  id: string;
  name: string;
  matricula: string;
  password?: string;
  role: UserRole;
  active: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  ip: string;
}

export interface DroneMedia {
  id: string;
  file?: File;
  name: string;
  type: 'image' | 'video';
  previewUrl: string; // Miniatura (usada em listagens)
  videoUrl?: string; // URL real do vídeo para player
  latitude: number | null;
  longitude: number | null;
  address?: string; 
  altitude?: number;
  timestamp?: string;
  hasGps: boolean;
  observation?: string;
  folder?: string;
}

export interface MapMarker {
  id: string;
  position: [number, number];
  media: DroneMedia;
}

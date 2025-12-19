
export interface DroneMedia {
  id: string;
  file: File;
  name: string;
  type: 'image' | 'video';
  previewUrl: string;
  latitude: number | null;
  longitude: number | null;
  altitude?: number;
  timestamp?: string;
  hasGps: boolean;
  observation?: string;
  folder?: string; // Nome da pasta de origem
}

export interface MapMarker {
  id: string;
  position: [number, number];
  media: DroneMedia;
}

export interface Stop {
  id: string;
  name: string;
  directionHint?: string;
  osmNodeId?: number;

  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

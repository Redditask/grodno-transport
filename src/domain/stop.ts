export interface Stop {
  id: string;
  name: string;
  directionHint?: string;

  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export type TransportType = 'bus' | 'trolleybus';

export interface Line {
  id: string;
  transportType: TransportType;
  number: string;
}

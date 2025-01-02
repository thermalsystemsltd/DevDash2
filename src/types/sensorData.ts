export interface LiveDataReading {
  sensor_id: string;
  sensor_name: string;
  temperature: number;
  timestamp: string;
}

export type LiveDataResponse = LiveDataReading[];
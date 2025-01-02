export interface Sensor {
  id: number;
  serialNo: number;
  name: string;
  type: string;
  created_at: string;
  updated_at: string | null;
  is_deleted: boolean;
  RSSI: string | null;
  SNR: string | null;
  Battery: string;
}

export interface BaseUnitType {
  type: number;
  description: string;
}

export interface Zone {
  zone_id: number;
  zone_name: string;
  is_deleted: boolean;
  sensor_count: number;
  description?: string;
}

export interface ZoneSensor {
  sensor_id: number;
  sensor_name: string;
  sensor_serialNo: number;
  zone_ids: string | null;
}

export interface BaseUnit {
  id: number;
  serialNo: number;
  base_unit_name: string;
  type: number | null;
  description: string | null;
  created_at: string;
  updated_at: string | null;
  is_deleted: boolean;
}
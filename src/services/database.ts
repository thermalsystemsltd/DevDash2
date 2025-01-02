import { Zone, Sensor, BaseUnit } from '../types';
import { mockSensors, mockZones, mockBaseUnits } from './mockData';

class DatabaseService {
  private static instance: DatabaseService;
  private companyName: string | null = null;

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  setCompanyContext(companyName: string) {
    this.companyName = companyName;
  }

  // Zones
  async getZones(): Promise<Zone[]> {
    return mockZones;
  }

  async getZoneById(id: string): Promise<Zone | undefined> {
    return mockZones.find(zone => zone.id === id);
  }

  // Sensors
  async getSensors(zoneId?: string): Promise<Sensor[]> {
    if (zoneId) {
      return mockSensors.filter(sensor => sensor.zoneId === zoneId);
    }
    return mockSensors;
  }

  async getSensorById(id: string): Promise<Sensor | undefined> {
    return mockSensors.find(sensor => sensor.id === id);
  }

  async getSensorReadings(id: string, startDate: Date, endDate: Date) {
    // Generate mock readings between start and end date
    const readings = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      readings.push({
        timestamp: new Date(currentDate),
        temperature: Math.random() * 30 - 20, // Random temperature between -20 and 10
        batteryLevel: Math.random() * 100,
        signalStrength: Math.random() * 100
      });
      currentDate.setHours(currentDate.getHours() + 1);
    }
    return readings;
  }

  // Base Units
  async getBaseUnits(): Promise<BaseUnit[]> {
    return mockBaseUnits;
  }

  async getBaseUnitById(id: string): Promise<BaseUnit | undefined> {
    return mockBaseUnits.find(unit => unit.id === id);
  }
}

export const dbService = DatabaseService.getInstance();
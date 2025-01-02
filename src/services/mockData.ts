import { Sensor, Zone, BaseUnit } from '../types';

export const mockSensors: Sensor[] = [
  {
    id: '1',
    serialNumber: 'TS1-001',
    name: 'Cold Storage 1',
    batteryLevel: 85,
    signalStrength: 92,
    temperature: -18.5,
    lastReading: new Date().toISOString(),
    zoneId: '1'
  },
  {
    id: '2',
    serialNumber: 'TS1-002',
    name: 'Freezer Unit 1',
    batteryLevel: 15,
    signalStrength: 78,
    temperature: -22.3,
    lastReading: new Date().toISOString(),
    zoneId: '1'
  },
  {
    id: '3',
    serialNumber: 'TS1-003',
    name: 'Ambient Storage',
    batteryLevel: 67,
    signalStrength: 95,
    temperature: 21.2,
    lastReading: new Date().toISOString(),
    zoneId: '2'
  }
];

export const mockZones: Zone[] = [
  {
    id: '1',
    name: 'Cold Storage Area',
    description: 'Main cold storage and freezer units'
  },
  {
    id: '2',
    name: 'Ambient Storage',
    description: 'Room temperature storage area'
  }
];

export const mockBaseUnits: BaseUnit[] = [
  {
    id: '1',
    serialNumber: 'BU-001',
    name: 'Main Hub',
    location: 'Server Room',
    status: 'online',
    lastConnection: new Date().toISOString()
  }
];
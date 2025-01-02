import React, { useState } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { Sensor } from '../../types';
import { formatSensorSerial } from '../../utils/sensorUtils';
import { useGetZoneSensorsQuery } from '../../services/zoneApi';

interface SensorAssignmentProps {
  zoneId: number;
  sensors: Sensor[];
  onAssign: (zoneId: number, sensorId: number) => void;
}

export default function SensorAssignment({ zoneId, sensors, onAssign }: SensorAssignmentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: zoneSensors, isLoading } = useGetZoneSensorsQuery(zoneId);

  // Filter out sensors that are already assigned to this zone using memoization
  const unassignedSensors = React.useMemo(() => {
    if (!zoneSensors || !sensors) return [];
    return sensors.filter(sensor => {
      const sensorData = zoneSensors.find(s => s.sensor_id === sensor.id || s.sensor_serialNo === sensor.serialNo);
      if (!sensorData?.zone_ids) return true;
      const zoneIds = sensorData.zone_ids.split(',').map(Number);
      return !zoneIds.includes(zoneId);
    });
  },
    [sensors, zoneSensors, zoneId]
  );

  if (isLoading) {
    return null;
  }

  if (unassignedSensors.length === 0) {
    return null;
  }

  return (
    <div className="relative mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
      >
        <span className="flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Assign Sensor
        </span>
        <ChevronDown className="h-4 w-4 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <ul className="py-1 max-h-60 overflow-auto">
            {unassignedSensors.map((sensor) => (
              <li key={sensor.id}>
                <button
                  onClick={() => {
                    onAssign(zoneId, sensor.id);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">{sensor.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatSensorSerial(sensor.serialNo, sensor.type)}
                    </div>
                  </div>
                  <Plus className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
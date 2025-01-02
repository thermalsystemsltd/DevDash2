import React from 'react';
import { X, Thermometer } from 'lucide-react';
import { useGetZoneSensorsQuery } from '../../services/zoneApi';
import SensorAssignment from './SensorAssignment';
import { formatSensorSerial } from '../../utils/sensorUtils';
import type { Sensor } from '../../types';

interface ZoneSensorsProps {
  zoneId: number;
  sensors: Sensor[];
  onAssign: (zoneId: number, sensorId: number) => void;
  onRemove: (zoneId: number, sensorId: number) => void;
}

export default function ZoneSensors({ zoneId, sensors, onAssign, onRemove }: ZoneSensorsProps) {
  const { data: zoneSensors, isLoading } = useGetZoneSensorsQuery(zoneId);
  
  // Filter sensors to only show ones assigned to this zone
  const assignedSensors = React.useMemo(() => {
    if (!zoneSensors || !sensors) return [];
    return sensors.filter(sensor => {
      const sensorData = zoneSensors.find(s => s.sensor_id === sensor.id || s.sensor_serialNo === sensor.serialNo);
      if (!sensorData?.zone_ids) return false;
      const zoneIds = sensorData.zone_ids.split(',').map(Number);
      return zoneIds.includes(zoneId);
    });
  },
    [sensors, zoneSensors, zoneId]
  );

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
          Loading sensors...
        </div>
      </div>
    );
  }

  const showNoSensorsMessage = !isLoading && (!zoneSensors || assignedSensors.length === 0);

  return (
    <div className="p-2 sm:p-4 w-full">
      <div className="space-y-2">
        <SensorAssignment
          zoneId={zoneId}
          sensors={sensors}
          onAssign={onAssign}
        />
        {showNoSensorsMessage ? (
          <div className="py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
            No sensors assigned to this zone
          </div>
        ) : (
          <div className="mt-3">
            <div className="overflow-x-visible">
            <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100/50 dark:bg-gray-800/50">
                <tr>
                  <th scope="col" className="px-4 sm:px-6 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    Sensor Name
                  </th>
                  <th scope="col" className="hidden sm:table-cell px-4 sm:px-6 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    Serial Number
                  </th>
                  <th scope="col" className="px-4 sm:px-6 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                {assignedSensors.map((sensor) => (
                  <tr key={sensor.id} className="hover:bg-gray-50 dark:hover:bg-gray-600/50">
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <Thermometer className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {sensor.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 sm:hidden">
                          {formatSensorSerial(sensor.serialNo, sensor.type)}
                        </span>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-4 sm:px-6 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatSensorSerial(sensor.serialNo, sensor.type)}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-right">
                      <button
                        onClick={() => onRemove(zoneId, sensor.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                        title="Remove sensor from zone"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
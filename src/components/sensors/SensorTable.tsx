import React from 'react';
import { Battery, Signal, Thermometer } from 'lucide-react';
import { Sensor } from '../../types';
import { useGetLiveDataQuery } from '../../services/sensorDataApi';
import { getBatteryStatus } from '../../utils/batteryUtils';
import { getSignalStatus } from '../../utils/signalUtils';
import { formatSensorSerial } from '../../utils/sensorUtils';
import { formatDateTime } from '../../utils/dateUtils';

interface SensorTableProps {
  sensors: Sensor[];
}

export default function SensorTable({ sensors }: SensorTableProps) {
  const { data: liveData } = useGetLiveDataQuery(undefined, {
    pollingInterval: 30000, // Poll every 30 seconds
  });

  return (
    <div className="overflow-x-auto -mx-2 sm:-mx-4 md:mx-0">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-1 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/3">
              Sensor Info
            </th>
            <th className="px-1 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Temperature
            </th>
            <th className="px-1 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/4">
              Status
            </th>
            <th className="px-1 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Last Reading
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {sensors.map((sensor) => (
            <tr key={sensor.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
              <td className="px-1 sm:px-4 py-2 sm:py-4">
                <div className="flex items-center">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {sensor.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatSensorSerial(sensor.serialNo, sensor.type)}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-1 sm:px-4 py-2 sm:py-4">
                <div className="flex items-center">
                  <Thermometer className="h-5 w-5 text-gray-400" />
                  <span className="ml-2 text-sm text-gray-900 dark:text-white">
                    {liveData?.find(d => d.sensor_id === sensor.serialNo?.toString())?.temperature?.toFixed(1) ?? '***'}°C
                  </span>
                </div>
              </td>
              <td className="px-1 sm:px-4 py-2 sm:py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center flex-shrink-0">
                    <Battery className="h-4 w-4 text-gray-400" />
                    {!isNaN(parseFloat(sensor.Battery)) && (
                      <span className={`ml-1 text-sm ${getBatteryStatus(sensor.type, parseFloat(sensor.Battery)).color}`}>
                        {getBatteryStatus(sensor.type, parseFloat(sensor.Battery)).text}
                      </span>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-1 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {liveData?.find(d => d.sensor_id === sensor.serialNo?.toString())?.timestamp
                  ? formatDateTime(new Date(liveData.find(d => d.sensor_id === sensor.serialNo?.toString())!.timestamp))
                  : formatDateTime(new Date(sensor.updated_at || sensor.created_at))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

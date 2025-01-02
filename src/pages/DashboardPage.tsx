import React, { useEffect, useState } from 'react';
import { Thermometer, AlertTriangle, Battery } from 'lucide-react';
import SensorTable from '../components/sensors/SensorTable';
import { useGetZonesQuery, useGetZoneSensorsQuery } from '../services/zoneApi';
import { useGetSensorListQuery } from '../services/sensorApi';
import { useGetLiveDataQuery } from '../services/sensorDataApi';
import { formatSensorSerial } from '../utils/sensorUtils';
import { isLowBattery } from '../utils/batteryUtils';
import type { Sensor } from '../types';

export default function DashboardPage() {
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const { data: sensors, isLoading: sensorsLoading, error: sensorsError } = useGetSensorListQuery();
  const { data: zones } = useGetZonesQuery();
  const { data: zoneSensors } = useGetZoneSensorsQuery(selectedZone || 0, {
    skip: !selectedZone
  });
  const { data: liveData, isLoading: dataLoading } = useGetLiveDataQuery();

  const loading = sensorsLoading || dataLoading;
  const error = sensorsError ? 'Failed to load sensors' : null;

  const filteredSensors = React.useMemo(() => {
    if (!selectedZone) return sensors;
    if (!sensors) return [];
    if (!zoneSensors) return [];

    return sensors.filter(sensor => 
      zoneSensors.some(zoneSensor => {
        const zoneIds = zoneSensor.zone_ids?.split(',').map(Number) || [];
        return zoneSensor.sensor_id === sensor.id && zoneIds.includes(selectedZone);
      })
    );
  }, [sensors, selectedZone, zoneSensors]);
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading sensors...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 p-4 rounded-md">
          <div className="text-red-700">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Monitor your temperature sensors in real-time
        </p>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <select
              value={selectedZone || ''}
              onChange={(e) => setSelectedZone(e.target.value ? Number(e.target.value) : null)}
              className="block w-full sm:w-48 pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">All Zones</option>
              {zones?.map((zone) => (
                <option key={zone.zone_id} value={zone.zone_id}>
                  {zone.zone_name} ({zone.sensor_count})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-2 sm:p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Thermometer className="h-4 w-4 sm:h-6 sm:w-6 text-gray-400" />
                </div>
                <div className="ml-2 sm:ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Active Sensors
                    </dt>
                    <dd className="text-sm sm:text-lg font-medium text-gray-900 dark:text-white">
                      {sensors?.length ?? 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-2 sm:p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-400" />
                </div>
                <div className="ml-2 sm:ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Alerts
                    </dt>
                    <dd className="text-sm sm:text-lg font-medium text-gray-900 dark:text-white">
                      {liveData?.reduce((count, reading) => {
                        return count + (reading?.temperature > 25 || reading?.temperature < -25 ? 1 : 0);
                      }, 0) ?? 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-2 sm:p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Battery className="h-4 w-4 sm:h-6 sm:w-6 text-gray-400" />
                </div>
                <div className="ml-2 sm:ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Low Battery
                    </dt>
                    <dd className="text-sm sm:text-lg font-medium text-gray-900 dark:text-white">
                      {sensors?.filter(s => isLowBattery(s.type, parseFloat(s.Battery))).length ?? 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg sm:mx-0 -mx-4">
        <div className="px-4 py-5 sm:p-6">
          <SensorTable sensors={filteredSensors ?? []} />
        </div>
      </div>
    </div>
  );
}
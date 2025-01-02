import React, { useState } from 'react';
import { Bell, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

// Placeholder data until we have the database
const mockAlarms = [
  {
    id: 1,
    sensorName: 'Cold Storage 1',
    sensorId: 'TS1-001',
    highLimit: 8.0,
    lowLimit: 2.0,
    currentTemp: 9.2,
    alarmDelay: 5,
    status: 'active',
    disabled: false,
    acknowledged: false,
    timestamp: new Date().toISOString()
  },
  {
    id: 2,
    sensorName: 'Freezer Unit 1',
    sensorId: 'TS1-002',
    highLimit: -18.0,
    lowLimit: -22.0,
    currentTemp: -16.5,
    alarmDelay: 10,
    status: 'active',
    disabled: false,
    acknowledged: true,
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 3,
    sensorName: 'Ambient Storage',
    sensorId: 'TS1-003',
    highLimit: 25.0,
    lowLimit: 15.0,
    currentTemp: 20.5,
    alarmDelay: 15,
    status: 'normal',
    disabled: false,
    acknowledged: false,
    timestamp: new Date(Date.now() - 7200000).toISOString()
  }
];

export default function AlarmsPage() {
  const [alarms, setAlarms] = useState(mockAlarms);
  const [showAcknowledged, setShowAcknowledged] = useState(true);

  const handleAcknowledge = (alarmId: number) => {
    setAlarms(alarms.map(alarm => 
      alarm.id === alarmId ? { ...alarm, acknowledged: true } : alarm
    ));
  };

  const handleToggleDisable = (alarmId: number) => {
    setAlarms(alarms.map(alarm => 
      alarm.id === alarmId ? { ...alarm, disabled: !alarm.disabled } : alarm
    ));
  };

  const filteredAlarms = alarms.filter(alarm => 
    showAcknowledged || !alarm.acknowledged
  );

  const getStatusColor = (status: string, acknowledged: boolean) => {
    if (status === 'active') {
      return acknowledged 
        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    }
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Alarms</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Monitor and manage sensor alarms
            </p>
          </div>
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showAcknowledged}
                onChange={(e) => setShowAcknowledged(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                Show Acknowledged
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Sensor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Limits
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Current
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Delay (min)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAlarms.map((alarm) => (
              <tr key={alarm.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Bell className={`h-5 w-5 ${
                      alarm.status === 'active' 
                        ? 'text-red-500 dark:text-red-400' 
                        : 'text-gray-400'
                    }`} />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {alarm.sensorName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {alarm.sensorId}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    H: {alarm.highLimit}°C
                  </div>
                  <div className="text-sm text-gray-900 dark:text-white">
                    L: {alarm.lowLimit}°C
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    alarm.currentTemp > alarm.highLimit || alarm.currentTemp < alarm.lowLimit
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {alarm.currentTemp}°C
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {alarm.alarmDelay}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    getStatusColor(alarm.status, alarm.acknowledged)
                  }`}>
                    {alarm.status.charAt(0).toUpperCase() + alarm.status.slice(1)}
                    {alarm.acknowledged && ' (Ack)'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {alarm.status === 'active' && !alarm.acknowledged && (
                      <button
                        onClick={() => handleAcknowledge(alarm.id)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        title="Acknowledge"
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleDisable(alarm.id)}
                      className={`${
                        alarm.disabled
                          ? 'text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400'
                          : 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                      }`}
                      title={alarm.disabled ? 'Enable' : 'Disable'}
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
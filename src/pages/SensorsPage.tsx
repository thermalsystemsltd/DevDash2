import React, { useState } from 'react';
import { Plus, Trash2, AlertCircle, PencilLine } from 'lucide-react';
import { 
  useGetSensorListQuery, 
  useAddSensorMutation,
  useDeleteSensorMutation,
  useUpdateSensorMutation
} from '../services/sensorApi';
import { formatSensorSerial } from '../utils/sensorUtils';
import { getBatteryStatus } from '../utils/batteryUtils';

interface EditSensorState {
  id: number | null;
  name: string;
}

interface AddSensorForm {
  serialNo: string;
  name: string;
  type: string;
}

const initialFormState: AddSensorForm = {
  serialNo: '',
  name: '',
  type: '1'
};

export default function SensorsPage() {
  const [isAddingSensor, setIsAddingSensor] = useState(false);
  const [formData, setFormData] = useState<AddSensorForm>(initialFormState);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSensor, setEditingSensor] = useState<EditSensorState>({ id: null, name: '' });
  const [formError, setFormError] = useState<string | null>(null);

  const { data: sensors, isLoading, error } = useGetSensorListQuery();
  const [addSensor] = useAddSensorMutation();
  const [deleteSensor] = useDeleteSensorMutation();
  const [updateSensor] = useUpdateSensorMutation();

  const filteredSensors = React.useMemo(() => {
    if (!sensors) return [];
    if (!searchQuery.trim()) return sensors;

    const query = searchQuery.toLowerCase();
    return sensors.filter(sensor => 
      sensor.name.toLowerCase().includes(query) || 
      formatSensorSerial(sensor.serialNo, sensor.type).toLowerCase().includes(query)
    );
  }, [sensors, searchQuery]);

  const handleEdit = (sensor: Sensor) => {
    setEditingSensor({ id: sensor.id, name: sensor.name });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSensor.id) return;
    setFormError(null);

    try {
      await updateSensor({
        sensorId: editingSensor.id,
        sensorName: editingSensor.name
      }).unwrap();
      
      setEditingSensor({ id: null, name: '' });
    } catch (error) {
      const errorMessage = error?.data?.message || 'Failed to update sensor name. Please try again.';
      setFormError(errorMessage);
      console.error('Update sensor error:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingSensor({ id: null, name: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      const serialNumber = parseInt(formData.serialNo);
      if (isNaN(serialNumber)) {
        throw new Error('Serial number must be a valid number');
      }

      await addSensor({
        serialNo: serialNumber,
        name: formData.name,
        type: formData.type
      }).unwrap();

      setFormData(initialFormState);
      setIsAddingSensor(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to add sensor');
    }
  };

  const handleDelete = async (sensor: { id: number }) => {
    if (window.confirm('Are you sure you want to delete this sensor?')) {
      try {
        setFormError(null);
        await deleteSensor(sensor).unwrap();
      } catch (error) {
        console.error('Failed to delete sensor:', error);
        setFormError('Failed to delete sensor. Please try again.');
      }
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading sensors...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-700 dark:text-red-400">Failed to load sensors</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sensors</h2>
          <p className="mt-1 mb-4 text-sm text-gray-500 dark:text-gray-400">
            Manage your temperature sensors
          </p>
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-96 pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                ×
              </button>
            )}
          </div>
        </div>
        <button
          onClick={() => setIsAddingSensor(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 sm:px-4 sm:py-2 rounded-md flex items-center text-sm"
        >
          <Plus className="h-5 w-5 mr-2" />
          <span className="hidden sm:inline">Add Sensor</span>
        </button>
      </div>

      {isAddingSensor && (
        <div className="mb-6 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Sensor</h3>
          {formError && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Serial Number
              </label>
              <input
                type="text"
                required
                value={formData.serialNo}
                onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Sensor Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Sensor Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm bg-white"
              >
                <option value="1">TS1</option>
                <option value="2">Hanwell IceSpy</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsAddingSensor(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
              >
                Add Sensor
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Sensor Info
              </th>
              <th className="hidden sm:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Battery
              </th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredSensors.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 sm:px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No sensors found{searchQuery ? ' matching search criteria' : ''}
                </td>
              </tr>
            ) : filteredSensors.map((sensor) => (
              <tr key={sensor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-3 sm:px-6 py-2 sm:py-4">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                        {editingSensor.id === sensor.id ? (
                          <form onSubmit={handleSaveEdit} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={editingSensor.name}
                              onChange={(e) => setEditingSensor({ ...editingSensor, name: e.target.value })}
                              className="block w-full rounded-md border-gray-300 shadow-sm 
                                focus:border-indigo-500 focus:ring-indigo-500 
                                dark:bg-gray-700 dark:border-gray-600 dark:text-white 
                                sm:text-sm"
                            />
                            <button type="submit" className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1">✓</button>
                            <button type="button" onClick={handleCancelEdit} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1">✕</button>
                          </form>
                        ) : (
                          <>
                            {sensor.name}
                            <button onClick={() => handleEdit(sensor)} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 ml-2">
                              <PencilLine className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatSensorSerial(sensor.serialNo, sensor.type)}
                        <span className="sm:hidden ml-1">
                          ({sensor.type === '1' ? 'TS1' : 'IceSpy'})
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="hidden sm:table-cell px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {sensor.type === '1' ? 'TS1' : 'Hanwell IceSpy'}
                </td>
                <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                  <span className={getBatteryStatus(sensor.type, parseFloat(sensor.Battery)).color}>
                    {getBatteryStatus(sensor.type, parseFloat(sensor.Battery)).text}
                    <span className="sm:hidden">V</span>
                  </span>
                </td>
                <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm">
                  <button
                    onClick={() => handleDelete(sensor)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
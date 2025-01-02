import React, { useState } from 'react';
import { Plus, Trash2, AlertCircle, Map, ChevronDown, ChevronRight } from 'lucide-react';
import { 
  useGetZonesQuery, 
  useCreateZoneMutation, 
  useDeleteZoneMutation, 
  useAssignSensorMutation, 
  useRemoveSensorMutation 
} from '../services/zoneApi';
import { useGetSensorListQuery } from '../services/sensorApi';
import ZoneSensors from '../components/zones/ZoneSensors';

interface ZoneFormData {
  name: string;
}

const initialFormState: ZoneFormData = {
  name: '',
};

export default function ZonesPage() {
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [expandedZones, setExpandedZones] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState<ZoneFormData>(initialFormState);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: zones, isLoading: zonesLoading, error: zonesError } = useGetZonesQuery();
  const { data: sensors } = useGetSensorListQuery();
  const [createZone] = useCreateZoneMutation();
  const [deleteZone] = useDeleteZoneMutation();
  const [assignSensor] = useAssignSensorMutation();
  const [removeSensor] = useRemoveSensorMutation();

  const toggleZone = (zoneId: number) => {
    const newExpanded = new Set(expandedZones);
    if (expandedZones.has(zoneId)) {
      newExpanded.delete(zoneId);
    } else {
      newExpanded.add(zoneId);
    }
    setExpandedZones(newExpanded);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      await createZone({ zoneName: formData.name }).unwrap();
      setFormData(initialFormState);
      setIsAddingZone(false);
    } catch (error) {
      setFormError('Failed to create zone. Please try again.');
    }
  };

  const handleDelete = async (zoneId: number) => {
    if (window.confirm('Are you sure you want to delete this zone?')) {
      try {
        setFormError(null);
        await deleteZone(zoneId).unwrap();
        setExpandedZones(prev => {
          const newSet = new Set(prev);
          newSet.delete(zoneId);
          return newSet;
        });
      } catch (error: any) {
        console.error('Failed to delete zone:', error);
        setFormError(error?.data?.message || 'Failed to delete zone. Please try again.');
      }
    }
  };

  const handleAssignSensor = async (zoneId: number, sensorId: number) => {
    try {
      setFormError(null);
      if (!zoneId || !sensorId) {
        throw new Error('Zone ID and sensor ID are required');
      }
      await assignSensor({ zoneId, sensorId }).unwrap();
    } catch (error) {
      console.error('Failed to assign sensor:', error);
      setFormError(error instanceof Error ? error.message : 'Failed to assign sensor to zone');
    }
  };

  const handleRemoveSensor = async (zoneId: number, sensorId: number) => {
    try {
      setFormError(null);
      if (!zoneId || !sensorId) {
        throw new Error('Zone ID and sensor ID are required');
      }
      await removeSensor({ zoneId, sensorId }).unwrap();
    } catch (error) {
      console.error('Failed to remove sensor:', error);
      setFormError(error instanceof Error ? error.message : 'Failed to remove sensor from zone');
    }
  };

  if (zonesLoading) {
    return <div className="p-6">Loading zones...</div>;
  }

  if (zonesError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-700 dark:text-red-400">Failed to load zones</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Zones</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your zones and assign sensors
          </p>
        </div>
        <button
          onClick={() => setIsAddingZone(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Zone
        </button>
      </div>

      {formError && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
        </div>
      )}

      {isAddingZone && (
        <div className="mb-6 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Zone</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Zone Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsAddingZone(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
              >
                Create Zone
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Zone Name
              </th>
              <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Sensors
              </th>
              <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {zones?.map((zone) => (
                <React.Fragment key={zone.zone_id}>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <button
                          onClick={() => toggleZone(zone.zone_id)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full mr-2 flex-shrink-0"
                        >
                          {expandedZones.has(zone.zone_id) ? (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                        <Map className="h-5 w-5 text-gray-400 mr-2 hidden sm:block" />
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                            {zone.zone_name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        {zone.sensor_count} sensors
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleDelete(zone.zone_id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                    {expandedZones.has(zone.zone_id) && (
                      <tr>
                        <td colSpan={3} className="bg-gray-50 dark:bg-gray-800/50">
                          <ZoneSensors
                            zoneId={zone.zone_id}
                            sensors={sensors ?? []}
                            onAssign={handleAssignSensor}
                            onRemove={handleRemoveSensor}
                          />
                        </td>
                      </tr>
                    )}
                </React.Fragment>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
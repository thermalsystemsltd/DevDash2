import React, { useState } from 'react';
import { Plus, Trash2, AlertCircle, Radio, Signal, Power } from 'lucide-react';
import { 
  useGetTypesQuery,
  useGetBaseUnitListQuery, 
  useAddBaseUnitMutation,
  useDeleteBaseUnitMutation 
} from '../services/baseUnitApi';

interface AddBaseUnitForm {
  serialNo: string;
  name: string;
  typeId: number;
}

const initialFormState: AddBaseUnitForm = {
  serialNo: '',
  name: '',
  typeId: 0
};

export default function BaseUnitsPage() {
  const [isAddingBaseUnit, setIsAddingBaseUnit] = useState(false);
  const [formData, setFormData] = useState<AddBaseUnitForm>(initialFormState);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: baseUnits, isLoading, error } = useGetBaseUnitListQuery();
  const { data: types, isLoading: typesLoading } = useGetTypesQuery();
  const [addBaseUnit] = useAddBaseUnitMutation();
  const [deleteBaseUnit] = useDeleteBaseUnitMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      await addBaseUnit({
        baseUnitSerialNo: formData.serialNo,
        baseUnitName: formData.name,
        typeId: formData.typeId
      }).unwrap();

      setFormData(initialFormState);
      setIsAddingBaseUnit(false);
    } catch (error) {
      if (error.status === 400) {
        setFormError('Base unit with same serial number or name already exists.');
      } else {
        setFormError('Failed to add base unit. Please try again.');
      }
    }
  };

  const handleDelete = async (baseUnit: { id: number }) => {
    if (window.confirm('Are you sure you want to delete this base unit?')) {
      try {
        await deleteBaseUnit({ baseUnitId: baseUnit.id }).unwrap();
      } catch (error) {
        console.error('Failed to delete base unit:', error);
        setFormError('Failed to delete base unit. Please try again.');
      }
    }
  };

  if (isLoading || typesLoading) {
    return <div className="p-6">Loading base units...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-700 dark:text-red-400">Failed to load base units</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Base Units</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your base units and gateways
          </p>
        </div>
        <button
          onClick={() => setIsAddingBaseUnit(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Base Unit
        </button>
      </div>

      {formError && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
        </div>
      )}

      {isAddingBaseUnit && (
        <div className="mb-6 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Base Unit</h3>
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Base Unit Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Base Unit Type
              </label>
              <select
                required
                value={formData.typeId}
                onChange={(e) => setFormData({ ...formData, typeId: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              >
                <option value="">Select a type</option>
                {types?.map((type) => (
                  <option key={type.type} value={type.type}>
                    {type.description}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsAddingBaseUnit(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
              >
                Add Base Unit
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Base Unit
              </th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                Created At
              </th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {baseUnits?.map((baseUnit) => (
              <tr key={baseUnit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-3 sm:px-6 py-2 sm:py-4">
                  <div className="flex items-center">
                    <Radio className="h-5 w-5 text-gray-400 mr-2 sm:mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {baseUnit.base_unit_name}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {baseUnit.serialNo}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {baseUnit.type === 1 ? 'TS1' : baseUnit.type === 2 ? 'Hybrid EMS' : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
                  {new Date(baseUnit.created_at).toLocaleString()}
                </td>
                <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right text-sm">
                  <button
                    onClick={() => handleDelete(baseUnit)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
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
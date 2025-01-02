import React, { useState } from 'react';
import { Plus, Trash2, AlertCircle, PencilLine, Users, Fingerprint } from 'lucide-react';
import { useGetUsersQuery, useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation } from '../services/userApi';
import { webAuthnApi } from '../services/webauthn';
import type { CreateUserRequest, UpdateUserRequest } from '../types/user';

interface UserFormData {
  email: string;
  password: string;
  role: 'admin' | 'viewer';
}

const initialFormState: UserFormData = {
  email: '',
  password: '',
  role: 'viewer'
};

export default function UsersPage() {
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<{ id: number | null; data: Partial<UserFormData> }>({
    id: null,
    data: {}
  });
  const [formData, setFormData] = useState<UserFormData>(initialFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: users, isLoading, error } = useGetUsersQuery();
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const handleBiometricsRegistration = async (userId: number) => {
    try {
      console.log('Starting biometrics registration for user:', userId);

      const user = users?.find(u => u.id === userId);
      if (!user) {
        throw new Error('User not found');
      }
      console.log('Found user:', user);

      // Check if browser supports WebAuthn
      if (!window.PublicKeyCredential) {
        alert('Your browser does not support biometric authentication');
        return;
      }

      const companyName = localStorage.getItem('lastCompanyName');
      console.log('Company name from storage:', companyName);
      if (!companyName) {
        throw new Error('Company name not found');
      }

      // Get registration options
      console.log('Getting registration options...');
      const options = await webAuthnApi.getRegistrationOptions({
        companyName,
        email: user.email
      });
      console.log('Got registration options:', options);

      // Create credentials
      console.log('Creating credentials...');
      const credential = await navigator.credentials.create({
        publicKey: options
      }) as PublicKeyCredential;
      console.log('Created credential:', credential);

      if (!credential) {
        throw new Error('Failed to create credentials');
      }

      // Prepare credential for verification
      const preparedCredential = webAuthnApi.prepareCredentialForVerify(credential);

      // Verify registration
      await webAuthnApi.verifyRegistration({
        companyName,
        email: user.email
      }, preparedCredential);

      alert('Biometric registration successful');
    } catch (error) {
      console.error('Biometrics registration failed:', error);
      alert('Failed to register biometrics. Please try again.');
    }
  };

  const filteredUsers = React.useMemo(() => {
    if (!users) return [];
    if (!searchQuery.trim()) return users;

    const query = searchQuery.toLowerCase();
    return users.filter(user => 
      user.username.toLowerCase().includes(query) || 
      user.email.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      const roles = formData.role === 'admin' ? [1, 2] : [2];
      await createUser({
        email: formData.email,
        password: formData.password,
        roles
      }).unwrap();
      setFormData(initialFormState);
      setIsAddingUser(false);
    } catch (error) {
      setFormError('Failed to create user. Please try again.');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser.id) return;
    setFormError(null);

    try {
      const roles = editingUser.data.role === 'admin' ? [1, 2] : [2];
      const updateData: UpdateUserRequest = {
        userId: editingUser.id,
        ...editingUser.data,
        roles
      };
      await updateUser(updateData).unwrap();
      setEditingUser({ id: null, data: {} });
    } catch (error) {
      setFormError('Failed to update user. Please try again.');
    }
  };

  const handleDelete = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId).unwrap();
      } catch (error) {
        setFormError('Failed to delete user. Please try again.');
      }
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading users...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-700 dark:text-red-400">Failed to load users</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h2>
          <p className="mt-1 mb-4 text-sm text-gray-500 dark:text-gray-400">
            Manage user accounts and permissions
          </p>
          <div className="relative max-w-xs">
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
          onClick={() => setIsAddingUser(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 sm:px-4 sm:py-2 rounded-md flex items-center text-sm"
        >
          <Plus className="h-5 w-5 mr-2" />
          <span className="hidden sm:inline">Add User</span>
        </button>
      </div>

      {formError && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
        </div>
      )}

      {isAddingUser && (
        <div className="mb-6 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New User</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'viewer' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              >
                <option value="viewer">Viewer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsAddingUser(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
              >
                Add User
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <table className="w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="w-1/2 sm:w-1/3 px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User Info
              </th>
              <th className="w-1/4 sm:w-1/4 px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Role
              </th>
              <th className="w-1/4 hidden sm:table-cell px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Created
              </th>
              <th className="w-1/4 sm:w-1/6 px-2 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 sm:px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No users found{searchQuery ? ' matching search criteria' : ''}
                </td>
              </tr>
            ) : filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-2 sm:px-4 py-2">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <div className="text-xs text-gray-900 dark:text-white truncate max-w-[140px] sm:max-w-[200px]">
                        {editingUser.id === user.id ? (
                          <input
                            type="email"
                            value={editingUser.data.email || user.email}
                            onChange={(e) => setEditingUser({
                              id: user.id,
                              data: { ...editingUser.data, email: e.target.value }
                            })}
                            className="block w-full rounded-md border-gray-300 shadow-sm 
                              focus:border-indigo-500 focus:ring-indigo-500 
                              dark:bg-gray-700 dark:border-gray-600 dark:text-white 
                              sm:text-sm mt-1"
                          />
                        ) : (
                          <span className="text-sm text-gray-900 dark:text-white">{user.email}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-2 sm:px-4 py-2">
                  {editingUser.id === user.id ? (
                    <select
                      value={editingUser.data.role || user.role}
                      onChange={(e) => setEditingUser({
                        id: user.id,
                        data: { ...editingUser.data, role: e.target.value as 'admin' | 'viewer' }
                      })}
                      className="block w-full rounded-md border-gray-300 shadow-sm 
                        focus:border-indigo-500 focus:ring-indigo-500 
                        dark:bg-gray-700 dark:border-gray-600 dark:text-white 
                        sm:text-sm"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {user.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  )}
                </td>
                <td className="hidden sm:table-cell px-2 sm:px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-2 sm:px-4 py-2 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    {editingUser.id === user.id ? (
                      <>
                        <button
                          onClick={handleUpdate}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingUser({ id: null, data: {} })}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingUser({ id: user.id, data: {} })}
                          className="p-1 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          <PencilLine className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleBiometricsRegistration(user.id)}
                          className="p-1 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          title="Register Biometrics"
                        >
                          <Fingerprint className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
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
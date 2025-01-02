import { rootApi } from './baseApi';
import type { User, CreateUserRequest, UpdateUserRequest, BiometricsCredential } from '../types/user';

const transformRolesToType = (roles?: number[]): 'admin' | 'viewer' => {
  if (!roles) return 'viewer';
  return roles.includes(1) ? 'admin' : 'viewer';
};

const transformResponse = (user: any): User => ({
  id: user.id,
  email: user.email,
  role: transformRolesToType(user.roles),
  created_at: user.created_at,
  updated_at: user.updated_at,
  roles: user.roles
});

export const userApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => ({
        url: '/service3/users',
        method: 'GET',
      }),
      transformResponse: (response: any[]) => 
        response.map(transformResponse),
      providesTags: ['Users'],
    }),

    createUser: builder.mutation<User, CreateUserRequest>({
      query: (userData) => ({
        url: '/service3/users',
        method: 'POST', 
        body: {
          email: userData.email,
          password: userData.password,
          roles: userData.roles || [2]
        },
      }),
      transformResponse: transformResponse,
      invalidatesTags: ['Users'],
    }),

    updateUser: builder.mutation<User, UpdateUserRequest>({
      query: ({ userId, ...update }) => ({
        url: `/service3/users/${userId}`,
        method: 'PATCH',
        body: update,
      }),
      transformResponse: transformResponse,
      invalidatesTags: ['Users'],
    }),

    deleteUser: builder.mutation<void, number>({
      query: (userId) => ({
        url: `/service3/users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation
} = userApi;
import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { logOut } from "../store/slices/authSlice";

const API_URL = import.meta.env.VITE_API_URL || '';

const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    headers.set('Accept', 'application/json');
    headers.set('Content-Type', 'application/json');

    // Get auth state directly from Redux store
    const state = getState() as { auth: { user: { companyID: number; companyName: string } | null } };
    const user = state.auth.user;
    
    if (user) {
      headers.set('x-company-id', user.companyID.toString());
      headers.set('x-company-name', user.companyName);
    }
    
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  FetchArgs,
  unknown,
  FetchBaseQueryError,
  {},
  {}
> = async (args, api, extraOptions) => {
  // Import setUser at the top level to avoid circular dependencies
  const { setUser } = await import('../store/slices/authSlice');

  let result = await baseQuery(args, api, extraOptions);

  // Skip verification for auth endpoints
  if (args.url?.startsWith('/auth/')) {
    return result;
  }

  if (result?.error?.status === 401) {
    console.log("Verifying session access");
    const refreshResult = await baseQuery("/auth/verifyAccess", api, extraOptions);
    const response = refreshResult.data;

    if (response?.message === 'Valid Session' && response?.data) {
      // Update session timeout
      const { startSessionTimeout } = await import('../services/api');
      startSessionTimeout();
      
      api.dispatch(setUser({
        companyID: response.data.companyID,
        companyName: response.data.companyName,
        roles: ['user']
      }));
      result = await baseQuery(args, api, extraOptions);
    } else {
      console.log("Session expired, logging out");
      // Clear session timeout
      const { clearSessionTimeout } = await import('../services/api');
      clearSessionTimeout();
      api.dispatch(logOut());
      // Use history.replaceState to prevent back button access
      window.history.replaceState(null, '', '/login');
      window.location.reload();
    }
  }

  return result;
};

export const rootApi = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Sensors", "BaseUnits", "LiveData", "DayData", "Zones", "ZoneSensors"],
  endpoints: () => ({}),
});
import { rootApi } from './baseApi';
import { LiveDataResponse } from '../types/sensorData';

export const sensorDataApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getLiveData: builder.query<LiveDataResponse, void>({
      query: () => ({
        url: "/service3/getLiveData",
        method: "GET",
      }),
      providesTags: ['LiveData'],
      transformResponse: (response: any[]) => {
        if (!response || !Array.isArray(response)) {
          console.warn('Invalid live data response:', response);
          return [];
        }
        return response.map(item => ({
          sensor_id: item.sensor_id?.toString() ?? '',
          sensor_name: item.sensor_name ?? '',
          temperature: parseFloat(item.temperature ?? '0'),
          timestamp: item.timestamp
        }));
      }
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetLiveDataQuery
} = sensorDataApi;
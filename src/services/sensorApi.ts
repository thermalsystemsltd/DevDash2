import { rootApi } from "./baseApi";
import { Sensor } from "../types";

interface UpdateSensorRequest {
  sensorId: number;
  sensorName: string;
}

export const sensorApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getSensorList: builder.query<Sensor[], void>({
      query: () => ({
        url: "/service3/sensors",
        method: "GET"
      }),
      providesTags: ['Sensors'],
      // Refresh sensor list every 5 minutes
      pollingInterval: 300000
    }),

    addSensor: builder.mutation({
      query: (newSensor) => ({
        url: "/service3/sensors",
        method: "POST",
        body: newSensor,
        credentials: "include"
      }),
      invalidatesTags: ['Sensors'],
    }),

    updateSensor: builder.mutation({
      query: (updateData: UpdateSensorRequest) => ({
        url: `/service3/sensors/${updateData.sensorId}`,
        method: "PATCH",
        body: {
          sensorId: updateData.sensorId,
          sensorName: updateData.sensorName
        },
        credentials: "include"
      }),
      invalidatesTags: ['Sensors'],
    }),

    deleteSensor: builder.mutation({
      query: (sensor) => ({
        url: `/service3/sensors/${sensor.id}`,
        method: "DELETE",
        credentials: "include"
      }),
      invalidatesTags: ['Sensors'],
    })
  }),
  overrideExisting: false
});

export const {
  useGetSensorListQuery,
  useAddSensorMutation,
  useUpdateSensorMutation,
  useDeleteSensorMutation,
} = sensorApi;
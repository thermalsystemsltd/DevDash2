import { rootApi } from "./baseApi";
import type { Zone } from "../types";

interface CreateZoneRequest {
  zoneName: string;
}

interface UpdateZoneRequest {
  zoneId: number;
  name: string;
  description: string;
}

interface AssignSensorRequest {
  sensorId: number;
}

export const zoneApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getZones: builder.query<Zone[], void>({
      query: () => ({
        url: "/service3/zones",
        method: "GET"
      }),
      // Refresh zones every 5 minutes
      pollingInterval: 300000,
      transformResponse: (response: any) => {
        if (!Array.isArray(response)) {
          console.warn('Invalid zones response:', response);
          return [];
        }
        return response.map(zone => ({
          zone_id: zone.zone_id,
          zone_name: zone.zone_name,
          is_deleted: zone.is_deleted,
          sensor_count: zone.sensor_count,
          description: zone.description
        }));
      },
      providesTags: ['Zones'],
    }),

    getZoneSensors: builder.query<ZoneSensor[], number>({
      query: (zoneId) => ({
        url: `/service3/zones/${zoneId}/sensors`,
        method: "GET"
      }),
      transformResponse: (response: any) => {
        if (!Array.isArray(response)) {
          console.warn('Invalid zone sensors response:', response);
          return [];
        }
        return response.map(sensor => ({
          sensor_id: sensor.sensor_id,
          sensor_name: sensor.sensor_name,
          sensor_serialNo: sensor.sensor_serialNo,
          zone_ids: sensor.zone_ids
        }));
      },
      providesTags: (result, error, zoneId) => [{ type: 'ZoneSensors', id: zoneId }],
    }),

    createZone: builder.mutation<Zone, CreateZoneRequest>({
      query: (newZone) => ({
        url: "/service3/zones",
        method: "POST",
        body: {
          zoneName: newZone.zoneName
        },
      }),
      invalidatesTags: ['Zones'],
    }),

    updateZone: builder.mutation<Zone, UpdateZoneRequest>({
      query: ({ zoneId, ...update }) => ({
        url: `/service3/zones/${zoneId}`,
        method: "PATCH",
        body: update,
      }),
      invalidatesTags: ['Zones'],
    }),

    deleteZone: builder.mutation<void, number>({
      query: (zoneId) => ({
        url: `/service3/zones/${zoneId}`,
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json'
        }
      }),
      invalidatesTags: (result, error, zoneId) => [
        'Zones',
        { type: 'ZoneSensors', id: zoneId }
      ],
      async onQueryStarted(zoneId, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Optimistically update the zones list
          dispatch(
            zoneApi.util.updateQueryData('getZones', undefined, (draft) => {
              const index = draft.findIndex(z => z.zone_id === zoneId);
              if (index !== -1) {
                draft.splice(index, 1);
              }
            })
          );
        } catch {
          // If the deletion fails, the error will be handled by the component
        }
      }
    }),

    assignSensor: builder.mutation<void, { zoneId: number; sensorId: number }>({
      query: ({ zoneId, sensorId }) => ({
        url: `/service3/zones/${zoneId}/sensors`,
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          sensorId: sensorId
        }
      }),
      invalidatesTags: (result, error, { zoneId }) => [
        { type: 'ZoneSensors', id: zoneId },
        'Zones'
      ]
    }),

    removeSensor: builder.mutation<void, { zoneId: number; sensorId: number }>({
      query: ({ zoneId, sensorId }) => ({
        url: `/service3/zones/${zoneId}/sensors/${sensorId}`,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      }),
      invalidatesTags: (result, error, { zoneId }) => [
        { type: 'ZoneSensors', id: zoneId },
        'Zones'
      ]
    }),
  }),
});

export const {
  useGetZonesQuery,
  useGetZoneSensorsQuery,
  useCreateZoneMutation,
  useUpdateZoneMutation,
  useDeleteZoneMutation,
  useAssignSensorMutation,
  useRemoveSensorMutation,
} = zoneApi;
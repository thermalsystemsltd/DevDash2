import { rootApi } from "./baseApi";
import type { BaseUnit, BaseUnitType } from "../types";

interface AddBaseUnitRequest {
  baseUnitSerialNo: number;
  baseUnitName: string;
  typeId: number;
}

interface DeleteBaseUnitRequest {
  baseUnitId: number;
}

interface UpdateBaseUnitRequest {
  baseUnitId: number;
  baseUnitName: string;
}

export const baseUnitApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getTypes: builder.query<BaseUnitType[], void>({
      query: () => ({
        url: "/service3/types",
        method: "GET"
      }),
      providesTags: ['Types'],
      transformResponse: (response: BaseUnitType[]) => response.map(type => ({
        type: type.type,
        description: type.description
      }))
    }),

    getBaseUnitList: builder.query<BaseUnit[], void>({
      query: () => ({
        url: "/service3/baseUnits",
        method: "GET"
      }),
      providesTags: ['BaseUnits'],
      // Refresh base units every 5 minutes
      pollingInterval: 300000
    }),

    addBaseUnit: builder.mutation<{ message: string }, AddBaseUnitRequest>({
      query: (newBaseUnit) => ({
        url: "/service3/baseUnits",
        method: "POST",
        body: newBaseUnit,
      }),
      invalidatesTags: ['BaseUnits'],
    }),

    updateBaseUnit: builder.mutation<BaseUnit, UpdateBaseUnitRequest>({
      query: (updateData) => ({
        url: "/service3/baseUnits",
        method: "PATCH",
        body: updateData,
      }),
      invalidatesTags: ['BaseUnits'],
    }),

    deleteBaseUnit: builder.mutation<{ message: string }, DeleteBaseUnitRequest>({
      query: (deleteData) => ({
        url: "/service3/baseUnits",
        method: "DELETE",
        body: deleteData,
      }),
      invalidatesTags: ['BaseUnits'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTypesQuery,
  useGetBaseUnitListQuery,
  useAddBaseUnitMutation,
  useUpdateBaseUnitMutation,
  useDeleteBaseUnitMutation,
} = baseUnitApi;
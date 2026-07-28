import { Profession } from './professionApis'
import baseApis from '../baseApis'

export interface GoverningBody {
  _id: string
  name: string
  profession: Profession
  createdAt: string
  updatedAt: string
  __v: number
}

export interface GoverningBodiesResponse {
  success: boolean
  statusCode: number
  message: string
  data: GoverningBody[]
}

export interface GoverningBodyInput { name: string; parentId: string }

const governingBodyApis = baseApis.injectEndpoints({
  endpoints: (builder) => ({
    getGoverningBodiesByProfession: builder.query<GoverningBodiesResponse, string>({
      query: (professionId) => ({ url: `/governing-body/by-profession/${professionId}`, method: 'GET' }),
      providesTags: ['governingBody'],
    }),
    createGoverningBody: builder.mutation<{ message?: string }, GoverningBodyInput>({
      query: (data) => ({ url: '/governing-body', method: 'POST', body: data }),
      invalidatesTags: ['governingBody'],
    }),
    updateGoverningBody: builder.mutation<{ message?: string }, { id: string; data: GoverningBodyInput }>({
      query: ({ id, data }) => ({ url: `/governing-body/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: ['governingBody'],
    }),
    deleteGoverningBody: builder.mutation<{ message?: string }, string>({
      query: (id) => ({ url: `/governing-body/${id}`, method: 'DELETE' }),
      invalidatesTags: ['governingBody'],
    }),
  }),
})

export const { useGetGoverningBodiesByProfessionQuery, useCreateGoverningBodyMutation, useUpdateGoverningBodyMutation, useDeleteGoverningBodyMutation } = governingBodyApis
export default governingBodyApis

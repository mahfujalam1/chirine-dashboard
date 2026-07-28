import baseApis from '../baseApis'

export interface Profession {
  _id: string
  name: string
  icon?: string | null
  createdAt: string
  updatedAt: string
  __v: number
}

export interface ProfessionsResponse {
  success: boolean
  statusCode: number
  message: string
  data: {
    meta: {
      page: number
      limit: number
      total: number
      totalPage: number
    }
    result: Profession[]
  }
}

export interface ProfessionQueryParams {
  page?: number
  limit?: number
}

export interface ProfessionInput {
  name: string
  icon?: File
}

function professionFormData({ name, icon }: ProfessionInput) {
  const formData = new FormData()
  formData.append('name', name.trim())
  if (icon instanceof File) formData.append('icon', icon)
  return formData
}

const professionApis = baseApis.injectEndpoints({
  endpoints: (builder) => ({
    getProfessions: builder.query<ProfessionsResponse, ProfessionQueryParams | void>({
      query: (params) => ({ url: '/profession', method: 'GET', params: params || undefined }),
      providesTags: ['profession'],
    }),
    createProfession: builder.mutation<{ message?: string }, ProfessionInput>({
      query: (data) => ({ url: '/profession', method: 'POST', body: professionFormData(data) }),
      invalidatesTags: ['profession'],
    }),
    updateProfession: builder.mutation<{ message?: string }, { id: string; data: ProfessionInput }>({
      query: ({ id, data }) => ({ url: `/profession/${id}`, method: 'PATCH', body: professionFormData(data) }),
      invalidatesTags: ['profession', 'governingBody'],
    }),
    deleteProfession: builder.mutation<{ message?: string }, string>({
      query: (id) => ({ url: `/profession/${id}`, method: 'DELETE' }),
      invalidatesTags: ['profession', 'governingBody'],
    }),
  }),
})

export const { useGetProfessionsQuery, useCreateProfessionMutation, useUpdateProfessionMutation, useDeleteProfessionMutation } = professionApis
export default professionApis
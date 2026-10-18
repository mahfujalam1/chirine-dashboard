import baseApis from "../baseApis";

export interface Expertise {
  _id: string;
  name: string;
  icon: string;
}

export interface AdminExpertiseResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Expertise[];
}

export interface CreateExpertisePayload {
  name: string;
  icon: File;
}

export interface UpdateExpertisePayload {
  name: string;
  icon?: File | null;
}

export interface ExpertiseMutationResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data?: Expertise;
}

function createExpertiseFormData({ name, icon }: UpdateExpertisePayload) {
  const formData = new FormData();
  formData.append("name", name.trim());
  if (icon) {
    formData.append("icon", icon);
  }
  return formData;
}

const expertiseApis = baseApis.injectEndpoints({
  endpoints: (builder) => ({
    getAdminExpertise: builder.query<AdminExpertiseResponse, void>({
      query: () => ({
        url: "/expertise/admin-expertise",
        method: "GET",
        params: {
          limit: 999
        }
      }),
      providesTags: ["expertise"],
    }),

    createExpertise: builder.mutation<
      ExpertiseMutationResponse,
      CreateExpertisePayload
    >({
      query: (data) => ({
        url: "/expertise",
        method: "POST",
        body: createExpertiseFormData(data),
      }),
      invalidatesTags: ["expertise"],
    }),

    deleteExpertise: builder.mutation<ExpertiseMutationResponse, string>({
      query: (id) => ({
        url: `/expertise/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["expertise"],
    }),
    updateExpertise: builder.mutation<ExpertiseMutationResponse, { id: string; data: UpdateExpertisePayload }>({
      query: ({ id, data }) => ({
        url: `/expertise/${id}`,
        method: "PATCH",
        body: createExpertiseFormData(data),
      }),
      invalidatesTags: ["expertise"],
    }),
  }),
});

export const {
  useGetAdminExpertiseQuery,
  useCreateExpertiseMutation,
  useDeleteExpertiseMutation,
  useUpdateExpertiseMutation,
} = expertiseApis;

export default expertiseApis;

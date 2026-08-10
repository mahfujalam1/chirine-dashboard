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

export interface ExpertiseMutationResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data?: Expertise;
}

function createExpertiseFormData({ name, icon }: CreateExpertisePayload) {
  const formData = new FormData();

  formData.append("name", name.trim());
  formData.append("icon", icon);

  return formData;
}

const expertiseApis = baseApis.injectEndpoints({
  endpoints: (builder) => ({
    getAdminExpertise: builder.query<AdminExpertiseResponse, void>({
      query: () => ({
        url: "/expertise/admin-expertise",
        method: "GET",
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
  }),
});

export const {
  useGetAdminExpertiseQuery,
  useCreateExpertiseMutation,
  useDeleteExpertiseMutation,
} = expertiseApis;

export default expertiseApis;

import baseApis from "../baseApis";

export interface ManagedWebContent {
  _id: string;
  id: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ManagedWebContentResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: ManagedWebContent;
}

export interface UpdateManagedWebContentPayload {
  description: string;
}

const manageWebApis = baseApis.injectEndpoints({
  endpoints: (builder) => ({
    getTermsConditions: builder.query<ManagedWebContentResponse, void>({
      query: () => ({
        url: "/manage-web/get-terms-conditions",
        method: "GET",
      }),
      providesTags: [{ type: "manageWeb", id: "TERMS_CONDITIONS" }],
    }),

    getPrivacyPolicy: builder.query<ManagedWebContentResponse, void>({
      query: () => ({
        url: "/manage-web/get-privacy-policy",
        method: "GET",
      }),
      providesTags: [{ type: "manageWeb", id: "PRIVACY_POLICY" }],
    }),

    updateTermsConditions: builder.mutation<
      ManagedWebContentResponse,
      UpdateManagedWebContentPayload
    >({
      query: (body) => ({
        url: "/manage-web/terms-conditions",
        method: "PATCH",
        body,
      }),
      invalidatesTags: [{ type: "manageWeb", id: "TERMS_CONDITIONS" }],
    }),

    updatePrivacyPolicy: builder.mutation<
      ManagedWebContentResponse,
      UpdateManagedWebContentPayload
    >({
      query: (body) => ({
        url: "/manage-web/privacy-policy",
        method: "PATCH",
        body,
      }),
      invalidatesTags: [{ type: "manageWeb", id: "PRIVACY_POLICY" }],
    }),
  }),
});

export const {
  useGetTermsConditionsQuery,
  useGetPrivacyPolicyQuery,
  useUpdateTermsConditionsMutation,
  useUpdatePrivacyPolicyMutation,
} = manageWebApis;

export default manageWebApis;

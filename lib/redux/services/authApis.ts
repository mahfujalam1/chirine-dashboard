import baseApis from '../baseApis'

const authApis = baseApis.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    signIn: builder.mutation({
      query: (data) => ({
        url: '/auth/signin',
        method: 'POST',
        body: data,
      }),
    }),
    forgotPassword: builder.mutation({
      query: (data) => {
        return (
          {
            url: '/auth/forget-password',
            method: 'POST',
            body: data,
          }
        )
      },
    }),
    verifyForgotOtp: builder.mutation({
      query: (data) => ({
        url: '/auth/verify-reset-otp',
        method: 'POST',
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),
    verifyResetOtp: builder.mutation({
      query: (data) => ({
        url: '/auth/verify-reset-otp',
        method: 'POST',
        body: data,
      }),
    }),
    resendResetCode: builder.mutation({
      query: (data) => ({
        url: '/auth/resend-reset-code',
        method: 'POST',
        body: data,
      }),
    }),
    verificationCreate: builder.mutation({
      query: (data) => ({
        url: '/verification/create',
        method: 'POST',
        body: data,
      }),
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: data,
      }),
    }),
    deleteUserAccount: builder.mutation({
      query: (data) => ({
        url: '/user/delete-account',
        method: 'DELETE',
        body: data,
      }),
    }),
  })
})

export const {
  useSignInMutation,
  useForgotPasswordMutation,
  useVerifyForgotOtpMutation,
  useResetPasswordMutation,
  useVerificationCreateMutation,
  useChangePasswordMutation,
  useDeleteUserAccountMutation,
  useVerifyResetOtpMutation,
  useResendResetCodeMutation,
} = authApis

export default authApis


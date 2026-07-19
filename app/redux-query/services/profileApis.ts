import baseApis from '../baseApis'

export interface ProfileLocation {
  address: string | null
  type: 'Point'
  coordinates: [number, number]
  radiusInKm: number | null
}

export interface MyProfile {
  _id: string
  fullName: string
  email: string
  licenseNo: string
  phone: string | null
  bio: string | null
  country: string
  city: string
  role: string
  profileImage: string | null
  location: ProfileLocation
  blockedUsers: string[]
  isPremium: boolean
  isBlocked: boolean
  isVerified: boolean
  isResetVerified: boolean
  isActive: boolean
  isDeleted: boolean
  playerIds: string[]
  createdAt: string
  updatedAt: string
  __v: number
}

export interface ProfileResponse {
  success: boolean
  statusCode: number
  message: string
  data: MyProfile
}

const profileApis = baseApis.injectEndpoints({
  endpoints: (builder) => ({
    getMyProfile: builder.query<ProfileResponse, void>({
      query: () => ({ url: '/user/get-my-profile', method: 'GET' }),
      providesTags: ['profile', 'auth'],
    }),
    updateMyProfile: builder.mutation<unknown, FormData>({
      query: (data) => ({ url: '/user/update-profile', method: 'PATCH', body: data }),
      invalidatesTags: ['profile', 'auth'],
    }),
    updateMyPassword: builder.mutation<unknown, { currentPassword: string; newPassword: string; confirmPassword: string }>({
      query: (data) => ({ url: '/user/update-password', method: 'PATCH', body: data }),
      invalidatesTags: ['profile', 'auth'],
    }),
  }),
})

export const { useGetMyProfileQuery, useUpdateMyProfileMutation, useUpdateMyPasswordMutation } = profileApis
export default profileApis

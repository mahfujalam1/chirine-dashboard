import baseApis from '../baseApis';
import { buildEventFormData, buildUpdateEventFormData, CreateEventPayload, UpdateEventPayload } from './eventApiHelpers';

export interface SocialEventParticipant {
  location: {
    address: string;
    type: 'Point';
    coordinates: [number, number];
    radiusInKm: number;
  };
  _id: string;
  fullName: string;
  email: string;
  licenseNo: string;
  phone: string;
  bio: string;
  country: string;
  city: string;
  role: 'user' | 'therapist' | 'admin' | string;
  profileImage: string;
  isPremium: boolean;
  isBlocked: boolean;
  isVerified: boolean;
  isResetVerified: boolean;
  isActive: boolean;
  isDeleted: boolean;
  playerIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SocialEvent {
  _id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  location: string;
  entryRequirements: string[];
  startTime: string;
  endTime: string;
  maxParticipants: number;
  participants: SocialEventParticipant[];
  isExpired: boolean;
  isDeleted: boolean;
  notified2d: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface SocialEventResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SocialEvent[];
}

const socialEventApis = baseApis.injectEndpoints({
  endpoints: (builder) => ({
    createSocialEvent: builder.mutation<unknown, CreateEventPayload>({
      query: (payload) => ({
        url: '/social-event',
        method: 'POST',
        body: buildEventFormData(payload),
      }),
      invalidatesTags: ['event'],
    }),
    getSocialEvent: builder.query<SocialEventResponse, void>({
      query: () => ({
        url: '/social-event',
        method: 'GET',
      }),
      providesTags: ['event'],
    }),
    updateSocialEvent: builder.mutation<unknown, { eventId: string; data: UpdateEventPayload }>({
      query: ({ eventId, data }) => ({ url: `/social-event/${eventId}`, method: 'PATCH', body: buildUpdateEventFormData(data) }),
      invalidatesTags: ['event'],
    }),
    deleteSocialEvent: builder.mutation<unknown, string>({
      query: (eventId) => ({ url: `/social-event/${eventId}`, method: 'DELETE' }),
      invalidatesTags: ['event'],
    }),
  }),
});

export const { useCreateSocialEventMutation, useGetSocialEventQuery, useUpdateSocialEventMutation, useDeleteSocialEventMutation } = socialEventApis;
export default socialEventApis;

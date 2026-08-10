import baseApis from '../baseApis';
import { buildEventFormData, buildUpdateEventFormData, CreateEventPayload, UpdateEventPayload } from './eventApiHelpers';

export interface LunchAndLearnParticipant {
  _id: string;
  fullName: string;
  email: string;
  profileImage: string;
}

export interface LunchAndLearnEvent {
  _id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  startTime: string;
  endTime: string;
  timezone?: string;
  zoomMeetingId: string;
  zoomMeetingPassword: string;
  zoomJoinUrl: string;
  zoomStartUrl: string;
  maxParticipants: number;
  participants: LunchAndLearnParticipant[];
  isExpired: boolean;
  isDeleted: boolean;
  notified2h: boolean;
  notified10m: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface LunchAndLearnResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: LunchAndLearnEvent[];
}

const lunchAndLearnApis = baseApis.injectEndpoints({
  endpoints: (builder) => ({
    createLunchAndLearn: builder.mutation<unknown, CreateEventPayload>({
      query: (payload) => ({
        url: '/lunch-and-learn',
        method: 'POST',
        body: buildEventFormData(payload),
      }),
      invalidatesTags: ['event'],
    }),
    getLunchAndLearn: builder.query<LunchAndLearnResponse, void>({
      query: () => ({
        url: '/lunch-and-learn',
        method: 'GET',
      }),
      providesTags: ['event'],
    }),
    updateLunchAndLearn: builder.mutation<unknown, { eventId: string; data: UpdateEventPayload }>({
      query: ({ eventId, data }) => ({ url: `/lunch-and-learn/${eventId}`, method: 'PATCH', body: buildUpdateEventFormData(data) }),
      invalidatesTags: ['event'],
    }),
    deleteLunchAndLearn: builder.mutation<unknown, string>({
      query: (eventId) => ({ url: `/lunch-and-learn/${eventId}`, method: 'DELETE' }),
      invalidatesTags: ['event'],
    }),
  }),
});

export const { useCreateLunchAndLearnMutation, useGetLunchAndLearnQuery, useUpdateLunchAndLearnMutation, useDeleteLunchAndLearnMutation } = lunchAndLearnApis;
export default lunchAndLearnApis;

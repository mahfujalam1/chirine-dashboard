import baseApis from '../baseApis';
import { buildEventFormData, buildUpdateEventFormData, CreateEventPayload, UpdateEventPayload } from './eventApiHelpers';

export interface CoffeConnectParticipant {
  _id: string;
  name?: string;
  email?: string;
  joinedAt?: string;
}

export interface CoffeConnectEvent {
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
  participants: CoffeConnectParticipant[];
  isExpired: boolean;
  isDeleted: boolean;
  notified2h: boolean;
  notified10m: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CoffeConnectResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: CoffeConnectEvent[];
}

const coffeConnectApis = baseApis.injectEndpoints({
  endpoints: (builder) => ({
    createCoffeConnect: builder.mutation<unknown, CreateEventPayload>({
      query: (payload) => ({
        url: '/coffee-connect',
        method: 'POST',
        body: buildEventFormData(payload),
      }),
      invalidatesTags: ['event'],
    }),
    getCoffeConnect: builder.query<CoffeConnectResponse, void>({
      query: () => ({
        url: '/coffee-connect',
        method: 'GET',
      }),
      providesTags: ['event'],
    }),
    updateCoffeConnect: builder.mutation<unknown, { eventId: string; data: UpdateEventPayload }>({
      query: ({ eventId, data }) => ({ url: `/coffee-connect/${eventId}`, method: 'PATCH', body: buildUpdateEventFormData(data) }),
      invalidatesTags: ['event'],
    }),
    deleteCoffeConnect: builder.mutation<unknown, string>({
      query: (eventId) => ({ url: `/coffee-connect/${eventId}`, method: 'DELETE' }),
      invalidatesTags: ['event'],
    }),
  }),
});

export const { useCreateCoffeConnectMutation, useGetCoffeConnectQuery, useUpdateCoffeConnectMutation, useDeleteCoffeConnectMutation } = coffeConnectApis;
export default coffeConnectApis;

import baseApis from '../baseApis';

export interface EventListParams {
  status?: 'Pending' | 'Accepted' | 'Rejected';
  searchTerm?: string;
  page: number;
  limit: number;
}

export interface RequestEvent {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
    profileImage?: string;
  };
  title: string;
  description: string;
  image?: string;
  date: string;
  startTime: string;
  endTime: string;
  eventType: 'CoffeeConnect' | 'SocialEvent' | 'LunchAndLearn';
  maxParticipants?: number;
  entryRequirements?: string[];
  isOnline?: boolean;
  status: 'Pending' | 'Accepted' | 'Rejected';
  createdAt: string;
  updatedAt: string;
}

export interface EventsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    stats: {
      coffeeConnectEvents: number;
      socialEvents: number;
      lunchAndLearnEvents: number;
    };
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPage: number;
    };
    result: RequestEvent[];
  };
}

const eventApis = baseApis.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAllRequestEvents: builder.query<EventsResponse, EventListParams>({
      query: (params) => ({
        url: `/dashboard/events`,
        method: 'GET',
        params,
      }),
      providesTags: ["event"],
    }),

    updateEventStatus: builder.mutation<any, { eventId: string; status: 'Accepted' | 'Rejected' }>(
      {
        query: ({ eventId, status }) => ({
          url: `/dashboard/events/${eventId}/status`,
          method: 'PATCH',
          body: { status },
        }),
        invalidatesTags: ["event"],
      }
    ),

    deleteRequestEvent: builder.mutation<any, { eventId: string }>({
      query: ({ eventId }) => ({
        url: `/dashboard/events/${eventId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ["event"],
    }),
  }),
})

export const {
  useGetAllRequestEventsQuery,
  useUpdateEventStatusMutation,
  useDeleteRequestEventMutation,
} = eventApis

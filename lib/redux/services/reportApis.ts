import baseApis from '../baseApis'

export type ReportStatus = 'Pending' | 'Resolved' | 'Rejected'

export interface ReportUser {
  _id: string
  fullName: string
  email: string
  profileImage: string | null
}

export interface Report {
  _id: string
  reporter: ReportUser
  reportedUser: ReportUser
  reportType: string
  title: string
  description: string
  isResolved: boolean
  status: ReportStatus
  createdAt: string
  updatedAt: string
  __v: number
}

export interface ReportListParams {
  page: number
  limit: number
  status?: ReportStatus
  search?: string
}

export interface ReportsResponse {
  success: boolean
  statusCode: number
  message: string
  data: {
    stats: {
      totalReports: number
      pendingReports: number
      resolvedReports: number
      rejectedReports: number
    }
    meta: {
      total: number
      page: number
      limit: number
      totalPage: number
    }
    result: Report[]
  }
}

export interface MutationResponse {
  success: boolean
  statusCode: number
  message: string
  data?: Report
}

const statsKey: Record<ReportStatus, 'pendingReports' | 'resolvedReports' | 'rejectedReports'> = {
  Pending: 'pendingReports',
  Resolved: 'resolvedReports',
  Rejected: 'rejectedReports',
}

const reportApis = baseApis.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAllReports: builder.query<ReportsResponse, ReportListParams>({
      query: (params) => ({ url: '/dashboard/reports', method: 'GET', params }),
      providesTags: ['report'],
    }),
    updateStatus: builder.mutation<MutationResponse, { id: string; status: Exclude<ReportStatus, 'Pending'> }>({
      query: ({ id, status }) => ({ url: `/dashboard/reports/${id}/status`, method: 'PATCH', body: { status } }),
      async onQueryStarted({ id, status }, { dispatch, getState, queryFulfilled }) {
        const cachedQueries = reportApis.util.selectInvalidatedBy(getState(), ['report'])
        const patches = cachedQueries
          .filter(({ endpointName }) => endpointName === 'getAllReports')
          .map(({ originalArgs }) => dispatch(reportApis.util.updateQueryData('getAllReports', originalArgs as ReportListParams, (draft) => {
            const args = originalArgs as ReportListParams
            const index = draft.data.result.findIndex((item) => item._id === id)
            const report = draft.data.result[index]
            if (!report || report.status === status) return
            draft.data.stats[statsKey[report.status]]--
            draft.data.stats[statsKey[status]]++
            if (args.status && args.status !== status) {
              draft.data.result.splice(index, 1)
              draft.data.meta.total--
              return
            }
            report.status = status
            report.isResolved = status === 'Resolved'
          })))
        try { await queryFulfilled } catch { patches.forEach((patch) => patch.undo()) }
      },
      invalidatesTags: ['report'],
    }),
    deleteReport: builder.mutation<MutationResponse, { id: string }>({
      query: ({ id }) => ({ url: `/dashboard/reports/${id}`, method: 'DELETE' }),
      async onQueryStarted({ id }, { dispatch, getState, queryFulfilled }) {
        const cachedQueries = reportApis.util.selectInvalidatedBy(getState(), ['report'])
        const patches = cachedQueries
          .filter(({ endpointName }) => endpointName === 'getAllReports')
          .map(({ originalArgs }) => dispatch(reportApis.util.updateQueryData('getAllReports', originalArgs as ReportListParams, (draft) => {
            const index = draft.data.result.findIndex((item) => item._id === id)
            if (index < 0) return
            const [report] = draft.data.result.splice(index, 1)
            draft.data.stats.totalReports--
            draft.data.stats[statsKey[report.status]]--
            draft.data.meta.total--
          })))
        try { await queryFulfilled } catch { patches.forEach((patch) => patch.undo()) }
      },
      invalidatesTags: ['report'],
    }),
  }),
})

export const { useGetAllReportsQuery, useUpdateStatusMutation, useDeleteReportMutation } = reportApis
export default reportApis

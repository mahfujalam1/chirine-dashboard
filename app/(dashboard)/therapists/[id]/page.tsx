"use client"

import { useGetSingleUserQuery } from '@/app/redux-query/services/userApis'
import { PageHeader } from "@/components/dashboard/page-header"
import { LoadingScreen } from '@/components/loading-screen'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from '@/components/ui/badge'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CalendarClock,
  Hash,
  Mail,
  MapPin,
  Phone
} from "lucide-react"
import { useParams, useRouter } from 'next/navigation'

// Types for the nested reference objects returned by the API
interface NamedRef {
  _id: string
  name: string
}

export default function TherapistsDetailsPage() {
  const { id } = useParams()
  const router = useRouter()

  const { data, isLoading, error } = useGetSingleUserQuery(id as string, { skip: !id })

  if (!id) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-medium mb-2">Missing ID</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Please provide a valid therapist ID.
            </p>
            <Button onClick={() => router.back()} variant="outline" size="sm">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) return <LoadingScreen />

  if (error || !data?.data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <ArrowLeft className="w-5 h-5 text-destructive" />
            </div>
            <h2 className="text-lg font-medium mb-2">
              {error ? "Error Loading" : "Not Found"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {error
                ? "Failed to load therapist details. Please try again."
                : "This therapist doesn't exist or has been removed."
              }
            </p>
            <Button onClick={() => router.back()} variant="outline" size="sm">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const therapist = data.data

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?'
  }

  // profession / governingBody can arrive either as a populated object or (rarely)
  // as a raw string/id, so this stays safe either way.
  const getName = (val: NamedRef | string | undefined | null) => {
    if (!val) return null
    if (typeof val === 'string') return val
    return val.name
  }

  const professionName = getName(therapist?.profession?.name)
  const governingBodyName = getName(therapist?.governingBody?.name)

  const formatDate = (date: string, withTime = false) =>
    date
      ? new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
      })
      : 'N/A'

  const InfoRow = ({ label, value, icon: Icon }: { label: string; value?: string | null; icon?: any }) => (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
        <span className="truncate">{value || 'N/A'}</span>
      </p>
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Therapist Details"
        description="View detailed information about the therapist."
      >
        <Button onClick={() => router.back()} variant="outline" size="sm">
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Back
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 items-start">
        {/* Left Column — identity, status, contact, actions (sticky so it stays visible while scanning credentials) */}
        <div className="lg:col-span-1 lg:sticky lg:top-4">
          <Card>
            <CardContent className="p-4 lg:p-5">
              <div className="flex flex-col">
                <div className="flex items-start justify-between">
                  <Avatar className="w-14 h-14 mb-3">
                    <AvatarImage src={therapist.profileImage} />
                    <AvatarFallback className="text-lg">
                      {getInitials(therapist.fullName || '')}
                    </AvatarFallback>
                  </Avatar>
                  {therapist.isVerified && (
                    <BadgeCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                  )}
                </div>

                <h2 className="text-base font-semibold leading-tight">{therapist?.fullName}</h2>
                {professionName && (
                  <p className="text-sm text-muted-foreground mt-0.5">{professionName}</p>
                )}

                <div className="flex flex-wrap gap-1.5 mt-3">
                  <Badge
                    variant="secondary"
                    className={`text-xs ${therapist.isVerified
                      ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}
                  >
                    {therapist.isVerified ? 'Verified' : 'Pending'}
                  </Badge>
                  {therapist.isBlocked && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                    >
                      Blocked
                    </Badge>
                  )}
                  <Badge
                    variant="secondary"
                    className={`text-xs ${therapist.isActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}
                  >
                    {therapist.isActive ? 'Active' : 'Pending'}
                  </Badge>
                  {therapist?.isPremium && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
                    >
                      Premium
                    </Badge>
                  )}
                </div>

                {therapist.bio && (
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed line-clamp-4">
                    {therapist.bio}
                  </p>
                )}

                {/* Contact — kept once, here, instead of repeating on the right */}
                <div className="mt-4 pt-4 border-t space-y-2.5">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{therapist.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{therapist.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">
                      {[therapist.city, therapist.country].filter(Boolean).join(', ') || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column — credentials lead, then personal, then a slim timeline strip */}
        <div className="lg:col-span-2 gap-4 space-y-4 grid grid-cols-1 md:grid-cols-2">
          {/* Credentials & Verification — this is the trust-critical info, shown first */}
          <Card>
            <CardContent>
              <CardTitle className="text-sm font-medium mb-3 flex items-center gap-1.5">
                Credentials & Verification
              </CardTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-200 p-2 rounded-md border border-border">
                <InfoRow label="Profession" value={professionName} />
                <InfoRow label="Governing Body" value={governingBodyName} icon={Building2} />
                <InfoRow label="License Number" value={therapist.licenseNo} icon={Hash} />
                <InfoRow
                  label="Verification Status"
                  value={therapist.isVerified ? 'Verified' : 'Pending Review'}
                />
              </div>
            </CardContent>
          </Card>

          {/* Personal Info */}
          <Card>
            <CardContent>
              <CardTitle className="text-sm font-medium mb-3 flex items-center gap-1.5">Personal Information</CardTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 gap-4 bg-gray-200 p-2 rounded-md">
                <InfoRow label="Full Name" value={therapist.fullName} />
                <InfoRow label="Role" value={therapist.role} />
                <InfoRow label="Country" value={therapist.country} icon={MapPin} />
                <InfoRow
                  label="City"
                  value={
                    therapist.location?.radiusInKm
                      ? `${therapist.city || 'N/A'} (${therapist.location.radiusInKm}km radius)`
                      : therapist.city
                  }
                  icon={MapPin}
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Timeline — compact single strip instead of its own tall card */}
          <Card className='grid col-span-2'>
            <CardContent className="w-full ">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CalendarClock className="w-3.5 h-3.5" />
                  <span>Joined: <span className="font-medium text-foreground">{formatDate(therapist.createdAt)}</span></span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t">
                <Button variant="outline" size="sm" className="text-xs h-8">
                  <Mail className="w-3 h-3 mr-1.5" />
                  Email
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-8">
                  Verify
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-8">
                  {therapist.isBlocked ? 'Unblock' : 'Block'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
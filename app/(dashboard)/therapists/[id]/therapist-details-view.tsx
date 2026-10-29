"use client"

import { PageHeader } from "@/components/dashboard/page-header"
import { LoadingScreen } from '@/components/loading-screen'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from '@/components/ui/badge'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { formatUsDate, formatUsDateTime } from "@/lib/date-utils"
import { useGetAdminExpertiseQuery } from '@/lib/redux/services/expertiseApis'
import {
  useBlockTherapistMutation,
  useGetSingleUserQuery,
  useVerifyTherapistMutation
} from '@/lib/redux/services/userApis'
import { formatLocation, getRefName } from '@/lib/utils'
import { User } from '@/types/userApis'
import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  Building2,
  CalendarClock,
  Check,
  Compass,
  Globe,
  Hash,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Radius,
  ShieldAlert,
  ShieldCheck,
  UserRound
} from "lucide-react"
import { useParams, useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

const getInitials = (name: string) =>
  name
    ?.split(' ')
    .filter(Boolean)
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'

function InfoRow({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value?: string | number | null
  icon?: React.ElementType
}) {
  return (
    <div className="space-y-0.5 min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium flex items-start gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />}
        <span className="break-words min-w-0">
          {value === 0 ? 0 : value || 'N/A'}
        </span>
      </p>
    </div>
  )
}

function Section({
  title,
  icon: Icon,
  className,
  children,
}: {
  title: string
  icon?: React.ElementType
  className?: string
  children: React.ReactNode
}) {
  return (
    <Card className={className}>
      <CardContent>
        <CardTitle className="text-sm font-medium mb-3 flex items-center gap-1.5">
          {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
          {title}
        </CardTitle>
        <div className="bg-muted/40 p-3 rounded-lg border border-border">
          {children}
        </div>
      </CardContent>
    </Card>
  )
}

export default function TherapistDetailsClientView() {
  const { id } = useParams()
  const router = useRouter()

  const [confirmModal, setConfirmModal] = useState<'verify' | 'block' | 'unblock' | null>(null)

  const { data, isLoading, error } = useGetSingleUserQuery(id as string, { skip: !id })
  const { data: expertiseData } = useGetAdminExpertiseQuery()
  const [verifyTherapist, { isLoading: isVerifying }] = useVerifyTherapistMutation()
  const [blockTherapist, { isLoading: isBlocking }] = useBlockTherapistMutation()

  const therapist = data?.data as User | undefined

  // The list endpoint sends expertise as ids, so fall back to the admin catalogue for names.
  const expertiseItems = useMemo(() => {
    const catalogue = expertiseData?.data ?? []
    return (therapist?.expertise ?? []).map((item) => {
      if (item && typeof item === 'object') {
        const match = catalogue.find((entry) => entry._id === item._id)
        return { _id: item._id, name: item.name, icon: match?.icon }
      }
      const match = catalogue.find((entry) => entry._id === item)
      return { _id: String(item), name: match?.name ?? null, icon: match?.icon }
    })
  }, [therapist?.expertise, expertiseData])

  if (!id) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-medium mb-2">Missing ID</h2>
            <p className="text-sm text-muted-foreground mb-4">
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

  if (error || !therapist) {
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
            <p className="text-sm text-muted-foreground mb-4">
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

  const handleEmailClick = () => {
    if (therapist?.email) {
      window.open(
        `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(therapist.email)}`,
        '_blank'
      )
    } else {
      toast.error('No email address available for this therapist.')
    }
  }

  const handleConfirmVerify = async () => {
    if (!id) return
    try {
      const res: any = await verifyTherapist({ id: id as string }).unwrap()
      toast.success(res?.message || 'Therapist verified successfully')
      setConfirmModal(null)
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to verify therapist')
    }
  }

  const handleConfirmBlockToggle = async () => {
    if (!id) return
    const isCurrentlyBlocked = therapist?.isBlocked
    try {
      const res: any = await blockTherapist({ id: id as string }).unwrap()
      toast.success(
        res?.message ||
        (isCurrentlyBlocked
          ? 'Therapist unblocked successfully'
          : 'Therapist blocked successfully')
      )
      setConfirmModal(null)
    } catch (err: any) {
      toast.error(
        err?.data?.message ||
        err?.message ||
        `Failed to ${isCurrentlyBlocked ? 'unblock' : 'block'} therapist`
      )
    }
  }

  const professionName = getRefName(therapist?.profession)
  const governingBodyName = getRefName(therapist?.governingBody)
  const fullAddress = formatLocation(
    therapist.location?.address,
    therapist.city,
    therapist.province,
    therapist.country
  )
  const coordinates = therapist.location?.coordinates
  const [longitude, latitude] = coordinates ?? []

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

      {/* PageHeader hides its actions below sm, so mobile gets its own back button. */}
      <Button
        onClick={() => router.back()}
        variant="outline"
        size="sm"
        className="sm:hidden"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 items-start">
        <div className="lg:col-span-1 lg:sticky lg:top-4">
          <Card>
            <CardContent className="p-4 lg:p-5">
              <div className="flex flex-col">
                <div className="flex items-start justify-between">
                  <Avatar className="w-14 h-14 mb-3">
                    <AvatarImage src={therapist.profileImage ?? undefined} />
                    <AvatarFallback className="text-lg">
                      {getInitials(therapist.fullName || '')}
                    </AvatarFallback>
                  </Avatar>
                  {therapist.isVerified && (
                    <BadgeCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                  )}
                </div>

                <h2 className="text-base font-semibold leading-tight break-words">
                  {therapist?.fullName}
                </h2>
                {professionName && (
                  <p className="text-sm text-muted-foreground mt-0.5 break-words">
                    {professionName}
                  </p>
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

                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-1">Bio</p>
                  <p className="text-xs text-muted-foreground leading-relaxed break-words">
                    {therapist.bio || 'No bio provided.'}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t space-y-2.5">
                  <div className="flex items-start gap-1.5 text-sm">
                    <Mail className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
                    <span className="break-all min-w-0">{therapist.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-sm">
                    <Phone className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
                    <span className="break-words min-w-0">{therapist.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-sm">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
                    <span className="break-words min-w-0">
                      {formatLocation(therapist.city, therapist.province, therapist.country) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5 text-sm">
                    <Briefcase className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
                    <span className="break-words min-w-0">{therapist.workAt || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Section title="Credentials & Verification" icon={ShieldCheck}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoRow label="Profession" value={professionName} />
              <InfoRow label="Governing Body" value={governingBodyName} icon={Building2} />
              <InfoRow label="License Number" value={therapist.licenseNo} icon={Hash} />
              <InfoRow
                label="Verification Status"
                value={therapist.isVerified ? 'Verified' : 'Pending Review'}
              />
            </div>
          </Section>

          <Section title="Personal Information" icon={UserRound}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoRow label="Full Name" value={therapist.fullName} />
              <InfoRow label="Email" value={therapist.email} icon={Mail} />
              <InfoRow label="Phone" value={therapist.phone} icon={Phone} />
              <InfoRow label="Role" value={therapist.role} />
              <InfoRow label="Works At" value={therapist.workAt} icon={Briefcase} />
              <InfoRow label="Membership" value={therapist.isPremium ? 'Premium' : 'Free'} />
            </div>
          </Section>

          <Section title="Location" icon={MapPin} className="md:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <InfoRow label="Address" value={therapist.location?.address} icon={MapPin} />
              <InfoRow label="City" value={therapist.city} />
              <InfoRow label="Province / State" value={therapist.province} />
              <InfoRow label="Country" value={therapist.country} icon={Globe} />
              <InfoRow
                label="Location Scope"
                value={therapist.locationScope ? therapist.locationScope.toUpperCase() : null}
                icon={Compass}
              />
              <InfoRow
                label="Service Radius"
                value={
                  therapist.location?.radiusInKm != null
                    ? `${therapist.location.radiusInKm} km`
                    : null
                }
                icon={Radius}
              />
              <InfoRow
                label="Coordinates"
                value={
                  latitude != null && longitude != null
                    ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
                    : null
                }
              />
              <InfoRow label="Full Address" value={fullAddress || null} />
            </div>
          </Section>

          <Section title="Areas of Focus" icon={BadgeCheck} className="md:col-span-2">
            {expertiseItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No areas of focus selected.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {expertiseItems.map((item) => (
                  <span
                    key={item._id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium"
                  >
                    {item.icon && (
                      <img
                        src={item.icon}
                        alt=""
                        className="h-4 w-4 rounded object-cover"
                      />
                    )}
                    <span className="break-words">{item.name ?? item._id}</span>
                  </span>
                ))}
              </div>
            )}
          </Section>

          <Section title="Account & Activity" icon={CalendarClock} className="md:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <InfoRow label="User ID" value={therapist._id} icon={Hash} />
              <InfoRow label="Total Posts" value={therapist.totalPost} icon={MessageSquare} />
              <InfoRow
                label="Account Status"
                value={therapist.isBlocked ? 'Blocked' : 'Active'}
              />
              <InfoRow
                label="Joined"
                value={therapist.joined || formatUsDate(therapist.createdAt)}
                icon={CalendarClock}
              />
              <InfoRow label="Created At" value={formatUsDateTime(therapist.createdAt)} />
              <InfoRow label="Last Updated" value={formatUsDateTime(therapist.updatedAt)} />
            </div>
          </Section>

          <Card className="md:col-span-2">
            <CardContent className="w-full">
              <CardTitle className="text-sm font-medium mb-3">Actions</CardTitle>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                  onClick={handleEmailClick}
                >
                  <Mail className="w-3 h-3 mr-1.5" />
                  Email
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => setConfirmModal('verify')}
                  disabled={therapist.isVerified || isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                      Verifying...
                    </>
                  ) : therapist.isVerified ? (
                    <>
                      <Check className="w-3 h-3 mr-1.5 text-green-600" />
                      Verified
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3 h-3 mr-1.5" />
                      Verify
                    </>
                  )}
                </Button>
                <Button
                  variant={therapist.isBlocked ? "outline" : "destructive"}
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => setConfirmModal(therapist.isBlocked ? 'unblock' : 'block')}
                  disabled={isBlocking}
                >
                  {isBlocking ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                      {therapist.isBlocked ? 'Unblocking...' : 'Blocking...'}
                    </>
                  ) : therapist.isBlocked ? (
                    <>
                      <ShieldCheck className="w-3 h-3 mr-1.5 text-green-600" />
                      Unblock
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-3 h-3 mr-1.5" />
                      Block
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={!!confirmModal} onOpenChange={(open) => !open && setConfirmModal(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmModal === 'verify' && 'Verify Therapist'}
              {confirmModal === 'block' && 'Block Therapist'}
              {confirmModal === 'unblock' && 'Unblock Therapist'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmModal === 'verify' &&
                `Are you sure you want to verify ${therapist.fullName || 'this therapist'}? This will mark their profile as verified.`}
              {confirmModal === 'block' &&
                `Are you sure you want to block ${therapist.fullName || 'this therapist'}? They will be restricted from platform activities.`}
              {confirmModal === 'unblock' &&
                `Are you sure you want to unblock ${therapist.fullName || 'this therapist'}? Their access will be restored.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isVerifying || isBlocking}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className={
                confirmModal === 'block'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : ''
              }
              disabled={isVerifying || isBlocking}
              onClick={(e) => {
                e.preventDefault()
                if (confirmModal === 'verify') handleConfirmVerify()
                else if (confirmModal === 'block' || confirmModal === 'unblock') handleConfirmBlockToggle()
              }}
            >
              {(isVerifying || isBlocking) && (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              )}
              {confirmModal === 'verify' && (isVerifying ? 'Verifying...' : 'Confirm Verification')}
              {confirmModal === 'block' && (isBlocking ? 'Blocking...' : 'Confirm Block')}
              {confirmModal === 'unblock' && (isBlocking ? 'Unblocking...' : 'Confirm Unblock')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

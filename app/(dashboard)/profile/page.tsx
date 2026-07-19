"use client"

import { useGetMyProfileQuery, useUpdateMyProfileMutation } from "@/app/redux-query/services/profileApis"
import { PageHeader } from "@/components/dashboard/page-header"
import { ChangePasswordDialog, EditProfileDialog, ProfileFormValues } from "@/components/dashboard/profile/profile-dialogs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Calendar, CheckCircle2, Key, Mail, MapPin, Phone, RefreshCw, ShieldCheck, UserRound } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()
}

function joinedDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(value))
}

export default function ProfilePage() {
  const [editOpen, setEditOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const { data, isLoading, isFetching, isError, refetch } = useGetMyProfileQuery()
  const [updateProfile, { isLoading: isUpdating }] = useUpdateMyProfileMutation()
  const profile = data?.data

  async function handleProfileUpdate(values: ProfileFormValues) {
    const formData = new FormData()
    formData.append("fullName", values.fullName)
    if (values.profileImage) formData.append("profileImage", values.profileImage)
    formData.append("location", JSON.stringify(values.location))

    try {
      const response = await updateProfile(formData).unwrap() as { message?: string }
      toast.success(response.message || "Profile updated successfully")
      setEditOpen(false)
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || "Unable to update profile")
    }
  }

  if (isLoading) return <><PageHeader title="Profile" description="Manage your account settings and preferences." /><div className="grid gap-6 lg:grid-cols-3"><div className="h-96 animate-pulse rounded-xl bg-muted" /><div className="h-96 animate-pulse rounded-xl bg-muted lg:col-span-2" /></div></>

  if (isError || !profile) return <><PageHeader title="Profile" description="Manage your account settings and preferences." /><Card><CardContent className="flex flex-col items-center p-12 text-center"><p className="font-medium text-destructive">Unable to load your profile</p><p className="mt-1 text-sm text-muted-foreground">Check your connection and try again.</p><Button variant="outline" className="mt-4" disabled={isFetching} onClick={() => refetch()}><RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />Try again</Button></CardContent></Card></>

  const displayLocation = profile.location.address || [profile.city, profile.country].filter(Boolean).join(", ") || "Not provided"

  return <>
    <PageHeader title="Profile" description="View your account information and status."><Button onClick={() => setEditOpen(true)}>Edit Profile</Button></PageHeader>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card><CardContent className="p-6"><div className="flex flex-col items-center text-center">
        <Avatar className="mb-4 h-24 w-24"><AvatarImage src={profile.profileImage ?? undefined} alt={profile.fullName} /><AvatarFallback className="text-2xl">{initials(profile.fullName)}</AvatarFallback></Avatar>
        <h2 className="text-xl font-semibold">{profile.fullName}</h2><p className="text-sm text-muted-foreground">{profile.email}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2"><Badge className="capitalize">{profile.role}</Badge>{profile.isVerified && <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700"><CheckCircle2 className="mr-1 h-3 w-3" />Verified</Badge>}<Badge variant="outline" className={profile.isActive ? "border-emerald-200 text-emerald-700" : "border-red-200 text-red-700"}>{profile.isActive ? "Active" : "Inactive"}</Badge></div>
        <Separator className="my-6" />
        <div className="w-full space-y-4 text-left text-sm"><p className="flex items-center gap-3"><Mail className="h-4 w-4 shrink-0 text-muted-foreground" /><span className="truncate">{profile.email}</span></p><p className="flex items-center gap-3"><Phone className="h-4 w-4 shrink-0 text-muted-foreground" /><span>{profile.phone || "Not provided"}</span></p><p className="flex items-center gap-3"><MapPin className="h-4 w-4 shrink-0 text-muted-foreground" /><span>{displayLocation}</span></p><p className="flex items-center gap-3"><Calendar className="h-4 w-4 shrink-0 text-muted-foreground" /><span>Joined {joinedDate(profile.createdAt)}</span></p></div>
      </div></CardContent></Card>

      <div className="space-y-6 lg:col-span-2">
        <Card><CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="fullName">Full Name</Label><Input id="fullName" value={profile.fullName} readOnly /></div><div className="space-y-2"><Label htmlFor="email">Email Address</Label><Input id="email" type="email" value={profile.email} readOnly /></div></div>
          <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="phone">Phone Number</Label><Input id="phone" value={profile.phone || "Not provided"} readOnly /></div><div className="space-y-2"><Label htmlFor="license">License Number</Label><Input id="license" value={profile.licenseNo || "Not provided"} readOnly /></div></div>
          <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="city">City</Label><Input id="city" value={profile.city || "Not provided"} readOnly /></div><div className="space-y-2"><Label htmlFor="country">Country</Label><Input id="country" value={profile.country || "Not provided"} readOnly /></div></div>
          <div className="space-y-2"><Label>Bio</Label><div className="min-h-20 rounded-md border bg-muted/20 p-3 text-sm text-muted-foreground">{profile.bio || "No bio has been added."}</div></div>
        </CardContent></Card>

        <Card><CardHeader><CardTitle className="text-base">Account & Security</CardTitle></CardHeader><CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-lg border p-4"><UserRound className="mb-2 h-4 w-4 text-muted-foreground" /><p className="text-xs text-muted-foreground">Account role</p><p className="mt-1 font-medium capitalize">{profile.role}</p></div><div className="rounded-lg border p-4"><ShieldCheck className="mb-2 h-4 w-4 text-muted-foreground" /><p className="text-xs text-muted-foreground">Account status</p><p className="mt-1 font-medium">{profile.isBlocked ? "Blocked" : "In good standing"}</p></div><div className="rounded-lg border p-4"><MapPin className="mb-2 h-4 w-4 text-muted-foreground" /><p className="text-xs text-muted-foreground">Search radius</p><p className="mt-1 font-medium">{profile.location.radiusInKm != null ? `${profile.location.radiusInKm} km` : "Not set"}</p></div></div>
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4"><div className="flex items-center gap-3"><span className="rounded-lg bg-background p-2"><Key className="h-4 w-4" /></span><div><p className="text-sm font-medium">Password</p><p className="text-xs text-muted-foreground">Keep your account password secure.</p></div></div><Button variant="outline" size="sm" onClick={() => setPasswordOpen(true)}>Change</Button></div>
        </CardContent></Card>
      </div>
    </div>
    <EditProfileDialog key={`${profile.updatedAt}-${editOpen}`} open={editOpen} profile={profile} saving={isUpdating} onClose={() => setEditOpen(false)} onSubmit={handleProfileUpdate} />
    <ChangePasswordDialog open={passwordOpen} onClose={() => setPasswordOpen(false)} />
  </>
}

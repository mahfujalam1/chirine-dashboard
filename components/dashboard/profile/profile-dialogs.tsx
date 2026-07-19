"use client"

import { useChangePasswordMutation } from "@/app/redux-query/services/authApis"
import { MyProfile } from "@/app/redux-query/services/profileApis"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export interface ProfileFormValues {
  fullName: string
  profileImage?: File
  location: { address: string; coordinates: [number, number]; radiusInKm: number }
}

export function EditProfileDialog({ open, profile, saving, onClose, onSubmit }: {
  open: boolean
  profile: MyProfile
  saving: boolean
  onClose: () => void
  onSubmit: (values: ProfileFormValues) => Promise<void>
}) {
  const [fullName, setFullName] = useState(profile.fullName)
  const [profileImage, setProfileImage] = useState<File>()
  const [preview, setPreview] = useState(profile.profileImage ?? "")
  const [address, setAddress] = useState(profile.location.address ?? "")
  const [longitude, setLongitude] = useState(String(profile.location.coordinates[0]))
  const [latitude, setLatitude] = useState(String(profile.location.coordinates[1]))
  const [radius, setRadius] = useState(String(profile.location.radiusInKm ?? ""))

  useEffect(() => () => { if (preview.startsWith("blob:")) URL.revokeObjectURL(preview) }, [preview])

  function handleImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) { event.target.value = ""; return toast.error("Please select an image file") }
    if (file.size > 5 * 1024 * 1024) { event.target.value = ""; return toast.error("Profile image must be 5 MB or smaller") }
    setProfileImage(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const coordinates: [number, number] = [Number(longitude), Number(latitude)]
    const radiusInKm = Number(radius)
    if (coordinates.some((value) => !Number.isFinite(value))) return toast.error("Enter valid longitude and latitude")
    if (!Number.isFinite(radiusInKm) || radiusInKm < 0) return toast.error("Enter a valid search radius")
    await onSubmit({ fullName: fullName.trim(), profileImage, location: { address: address.trim(), coordinates, radiusInKm } })
  }

  return <Dialog open={open} onOpenChange={(value) => !value && onClose()}><DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto"><DialogHeader><DialogTitle>Edit Profile</DialogTitle><DialogDescription>Update your name, photo, and location details.</DialogDescription></DialogHeader><form onSubmit={handleSubmit} className="space-y-5">
    <div className="space-y-2"><Label>Profile Image</Label>{preview && <img src={preview} alt="Profile preview" className="h-32 w-32 rounded-full border object-cover" />}<Input type="file" accept="image/*" onChange={handleImage} /><p className="text-xs text-muted-foreground">Optional JPEG, PNG, or WebP; maximum 5 MB.</p></div>
    <div className="space-y-2"><Label htmlFor="profile-name">Full Name</Label><Input id="profile-name" value={fullName} onChange={(event) => setFullName(event.target.value)} required /></div>
    <div className="space-y-2"><Label htmlFor="profile-address">Address</Label><Input id="profile-address" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="123 New Street" required /></div>
    <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="longitude">Longitude</Label><Input id="longitude" type="number" step="any" min={-180} max={180} value={longitude} onChange={(event) => setLongitude(event.target.value)} required /></div><div className="space-y-2"><Label htmlFor="latitude">Latitude</Label><Input id="latitude" type="number" step="any" min={-90} max={90} value={latitude} onChange={(event) => setLatitude(event.target.value)} required /></div></div>
    <div className="space-y-2"><Label htmlFor="radius">Radius (km)</Label><Input id="radius" type="number" min={0} step="0.1" value={radius} onChange={(event) => setRadius(event.target.value)} required /></div>
    <DialogFooter><Button type="button" variant="outline" disabled={saving} onClick={onClose}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button></DialogFooter>
  </form></DialogContent></Dialog>
}

export function ChangePasswordDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [changePassword, { isLoading: isLoadingChangePassword }] = useChangePasswordMutation()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const oldPassword = String(formData.get("oldPassword") ?? "")
    const newPassword = String(formData.get("newPassword") ?? "")
    const confirmNewPassword = String(formData.get("confirmNewPassword") ?? "")
    if (newPassword !== confirmNewPassword) return toast.error("New passwords do not match")
    try {
      const response = await changePassword({ oldPassword, newPassword, confirmNewPassword }).unwrap()
      toast.success(response?.message || "Password changed successfully")
      onClose()
    } catch (error: any) { toast.error(error?.data?.message || error?.message || "Unable to change password") }
  }

  return <Dialog open={open} onOpenChange={(value) => !value && onClose()}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>Change Password</DialogTitle><DialogDescription>Enter your current password and choose a new one.</DialogDescription></DialogHeader><form onSubmit={handleSubmit} className="space-y-4"><div className="space-y-2"><Label htmlFor="old-password">Current Password</Label><Input id="old-password" name="oldPassword" type="password" required /></div><div className="space-y-2"><Label htmlFor="new-password">New Password</Label><Input id="new-password" name="newPassword" type="password" minLength={6} required /></div><div className="space-y-2"><Label htmlFor="confirm-new-password">Confirm New Password</Label><Input id="confirm-new-password" name="confirmNewPassword" type="password" minLength={6} required /></div><DialogFooter><Button type="button" variant="outline" disabled={isLoadingChangePassword} onClick={onClose}>Cancel</Button><Button type="submit" disabled={isLoadingChangePassword}>{isLoadingChangePassword ? "Changing..." : "Change Password"}</Button></DialogFooter></form></DialogContent></Dialog>
}

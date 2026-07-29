"use client";

import { useChangePasswordMutation } from "@/app/redux-query/services/authApis";
import { MyProfile } from "@/app/redux-query/services/profileApis";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface ProfileFormValues {
  fullName: string;
  profileImage?: File;
}

export function EditProfileDialog({
  open,
  profile,
  saving,
  onClose,
  onSubmit,
}: {
  open: boolean;
  profile: MyProfile;
  saving: boolean;
  onClose: () => void;
  onSubmit: (values: ProfileFormValues) => Promise<void>;
}) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [profileImage, setProfileImage] = useState<File>();
  const [preview, setPreview] = useState(profile.profileImage ?? "");

  useEffect(
    () => () => {
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  function handleImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      event.target.value = "";
      return toast.error("Please select an image file");
    }
    if (file.size > 5 * 1024 * 1024) {
      event.target.value = "";
      return toast.error("Profile image must be 5 MB or smaller");
    }
    setProfileImage(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      fullName: fullName.trim(),
      profileImage,
    });
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your name, photo, and location details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Profile Image</Label>
            {preview && (
              <img
                src={preview}
                alt="Profile preview"
                className="h-32 w-32 rounded-full border object-cover"
              />
            )}
            <Input type="file" accept="image/*" onChange={handleImage} />
            <p className="text-xs text-muted-foreground">
              Optional JPEG, PNG, or WebP; maximum 5 MB.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-name">Full Name</Label>
            <Input
              id="profile-name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ChangePasswordDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [changePassword, { isLoading: isLoadingChangePassword }] =
    useChangePasswordMutation();

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!open) {
      setShowOldPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
  }, [open]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const oldPassword = String(formData.get("oldPassword") ?? "");
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmNewPassword = String(formData.get("confirmNewPassword") ?? "");
    if (newPassword !== confirmNewPassword)
      return toast.error("New passwords do not match");
    try {
      const response = await changePassword({
        oldPassword,
        newPassword,
        confirmNewPassword,
      }).unwrap();
      toast.success(response?.message || "Password changed successfully");
      onClose();
    } catch (error: any) {
      toast.error(
        error?.data?.message || error?.message || "Unable to change password",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new one.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="old-password">Current Password</Label>
            <div className="relative flex items-center">
              <Input
                id="old-password"
                name="oldPassword"
                type={showOldPassword ? "text" : "password"}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword((prev) => !prev)}
                className="absolute right-3 text-muted-foreground hover:text-foreground focus:outline-none transition-colors p-1"
                title={showOldPassword ? "Hide password" : "Show password"}
                aria-label={
                  showOldPassword ? "Hide password" : "Show password"
                }
              >
                {showOldPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative flex items-center">
              <Input
                id="new-password"
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                minLength={6}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-3 text-muted-foreground hover:text-foreground focus:outline-none transition-colors p-1"
                title={showNewPassword ? "Hide password" : "Show password"}
                aria-label={
                  showNewPassword ? "Hide password" : "Show password"
                }
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-new-password">Confirm New Password</Label>
            <div className="relative flex items-center">
              <Input
                id="confirm-new-password"
                name="confirmNewPassword"
                type={showConfirmPassword ? "text" : "password"}
                minLength={6}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 text-muted-foreground hover:text-foreground focus:outline-none transition-colors p-1"
                title={showConfirmPassword ? "Hide password" : "Show password"}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isLoadingChangePassword}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoadingChangePassword}>
              {isLoadingChangePassword ? "Changing..." : "Change Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

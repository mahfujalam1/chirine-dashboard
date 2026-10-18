"use client";

import { Expertise, UpdateExpertisePayload } from "@/lib/redux/services/expertiseApis";
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
import { ImagePlus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ExpertiseFormDialogProps {
  open: boolean;
  isSaving: boolean;
  expertise?: Expertise | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdateExpertisePayload) => Promise<void>;
}

export function ExpertiseFormDialog({
  open,
  isSaving,
  expertise,
  onOpenChange,
  onSubmit,
}: ExpertiseFormDialogProps) {
  const isEditing = !!expertise;
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(expertise?.name ?? "");
    setIcon(null);
    setPreview(expertise?.icon ?? "");
  }, [open, expertise]);

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleIconChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      event.target.value = "";
      toast.error("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      event.target.value = "";
      toast.error("The icon must be 5 MB or smaller.");
      return;
    }

    setIcon(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isEditing && !icon) {
      toast.error("Please select an icon.");
      return;
    }

    await onSubmit({ name: name.trim(), icon });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Update Area of Focus" : "Add Area of Focus"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Change the name or upload a new icon for this expertise option."
              : "Create an expertise option that therapists can use for their area of focus."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="expertise-name">Name</Label>
            <Input
              id="expertise-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="ADHD & Neurodiversity"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expertise-icon">
              Icon{" "}
              {isEditing ? (
                <span className="text-xs font-normal text-muted-foreground">
                  (optional)
                </span>
              ) : (
                <span className="text-destructive">*</span>
              )}
            </Label>

            {preview ? (
              <div className="flex items-center gap-4 rounded-lg border bg-muted/20 p-3">
                <img
                  src={preview}
                  alt="Area of focus icon preview"
                  className="h-20 w-20 rounded-lg border bg-background object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {icon?.name ?? expertise?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {icon ? "New icon preview" : "Current icon"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex h-28 items-center justify-center rounded-lg border border-dashed bg-muted/20 text-muted-foreground">
                <div className="text-center">
                  <ImagePlus className="mx-auto mb-2 h-6 w-6" />
                  <p className="text-xs">Select an icon to preview it</p>
                </div>
              </div>
            )}

            <Input
              key={`${expertise?._id ?? "new"}-${String(open)}`}
              id="expertise-icon"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              required={!isEditing}
              onChange={handleIconChange}
            />
            <p className="text-xs text-muted-foreground">
              PNG, JPEG, SVG, or WebP; maximum 5 MB.
              {isEditing ? " Leave empty to keep the current icon." : ""}
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || !name.trim() || (!isEditing && !icon)}
            >
              {isEditing
                ? isSaving
                  ? "Updating..."
                  : "Update Area of Focus"
                : isSaving
                  ? "Creating..."
                  : "Create Area of Focus"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

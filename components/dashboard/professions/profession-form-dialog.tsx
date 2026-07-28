"use client"

import { Profession, ProfessionInput } from "@/app/redux-query/services/professionApis"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface ProfessionFormDialogProps {
  open: boolean
  profession: Profession | null
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ProfessionInput) => Promise<void>
}

export function ProfessionFormDialog({
  open,
  profession,
  isSaving,
  onOpenChange,
  onSubmit,
}: ProfessionFormDialogProps) {
  const [name, setName] = useState(profession?.name ?? "")
  const [icon, setIcon] = useState<File>()
  const [preview, setPreview] = useState(profession?.icon ?? "")

  useEffect(() => {
    if (!open) return
    setName(profession?.name ?? "")
    setIcon(undefined)
    setPreview(profession?.icon ?? "")
  }, [open, profession])

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview)
    }
  }, [preview])

  function handleIconChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      event.target.value = ""
      toast.error("Please select an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      event.target.value = ""
      toast.error("Icon must be 5 MB or smaller")
      return
    }

    setIcon(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit({ name: name.trim(), icon })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{profession ? "Edit Profession" : "Create Profession"}</DialogTitle>
          <DialogDescription>
            {profession
              ? "Update the profession name or replace its icon."
              : "Add a profession for governing body organization."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="profession-name">Profession Name</Label>
            <Input
              id="profession-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Registered Psychotherapist"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profession-icon">
              Icon {!profession && <span className="text-destructive">*</span>}
            </Label>
            {preview && (
              <img
                src={preview}
                alt="Profession icon preview"
                className="h-20 w-20 rounded-xl border bg-muted object-cover"
              />
            )}
            <Input
              key={`${profession?._id ?? "create"}-${open}`}
              id="profession-icon"
              type="file"
              accept="image/*"
              required={!profession}
              onChange={handleIconChange}
            />
            <p className="text-xs text-muted-foreground">
              PNG, JPEG, SVG, or WebP; maximum 5 MB.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isSaving} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : profession ? "Save Changes" : "Create Profession"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

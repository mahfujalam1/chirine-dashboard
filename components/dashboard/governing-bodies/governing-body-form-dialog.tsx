"use client"

import { GoverningBody, GoverningBodyInput } from "@/lib/redux/services/governingBodyApis"
import { Profession } from "@/lib/redux/services/professionApis"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"

interface GoverningBodyFormDialogProps {
  open: boolean
  governingBody: GoverningBody | null
  professions: Profession[]
  defaultProfessionId: string
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: GoverningBodyInput) => Promise<void>
}

export function GoverningBodyFormDialog({
  open,
  governingBody,
  professions,
  defaultProfessionId,
  isSaving,
  onOpenChange,
  onSubmit,
}: GoverningBodyFormDialogProps) {
  const [name, setName] = useState(governingBody?.name ?? "")
  const [parentId, setParentId] = useState(governingBody?.profession._id ?? defaultProfessionId)

  useEffect(() => {
    if (!open) return
    setName(governingBody?.name ?? "")
    setParentId(governingBody?.profession._id ?? defaultProfessionId)
  }, [open, governingBody, defaultProfessionId])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit({ name: name.trim(), parentId })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{governingBody ? "Edit Governing Body" : "Create Governing Body"}</DialogTitle>
          <DialogDescription>
            {governingBody
              ? "Update the governing body name or linked profession."
              : "Add a governing body under a profession."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="governing-body-name">Governing Body Name</Label>
            <Input
              id="governing-body-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Therapy Medical Council"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Profession</Label>
            <Select value={parentId} onValueChange={setParentId} required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select profession" />
              </SelectTrigger>
              <SelectContent>
                {professions.map((profession) => (
                  <SelectItem key={profession._id} value={profession._id}>
                    {profession.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isSaving} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || !parentId}>
              {isSaving ? "Saving..." : governingBody ? "Save Changes" : "Create Governing Body"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

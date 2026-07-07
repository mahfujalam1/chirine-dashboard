"use client"

import { useCreateAssetsMutation } from '@/app/redux-query/services/chatassetsApis'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  Upload,
  X
} from "lucide-react"
import Image from 'next/image'
import { useRef, useState } from "react"
import { toast } from 'sonner'

// ─── Types ────────────────────────────────────────────────────────────────────

type AssetType = "gif" | "image"

interface Asset {
  _id: string,
  label: string,
  url: string,
  type: AssetType,
  tags: string[],
  isActive: boolean,
  createdAt: string,
  updatedAt: string,
  __v: number
}

const TYPE_STYLES: Record<AssetType, string> = {
  gif: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800",
  image: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
}

interface AssetFormState {
  label: string
  tagInput: string
  tags: string[]
  previewUrl: string
  file: File | null
  type: AssetType
  uploading: boolean
  error: string
  uploadProgress: number
}

const EMPTY_FORM: AssetFormState = {
  label: "",
  tagInput: "",
  tags: [],
  previewUrl: "",
  file: null,
  type: "gif",
  uploading: false,
  error: "",
  uploadProgress: 0,
}

// ─── Asset Upload Form ────────────────────────────────────────────────────────

interface AssetFormProps {
  onCancel: () => void
}

function AssetForm({ onCancel }: AssetFormProps) {
  const [createAssets] = useCreateAssetsMutation()
  const [form, setForm] = useState<AssetFormState>(EMPTY_FORM)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  function set<K extends keyof AssetFormState>(key: K, value: AssetFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // ── File validation ──
  const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

  function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Only PNG, JPG, WEBP, or GIF files are supported."
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File size must be less than 2 MB."
    }
    return null
  }

  // ── File picking ──
  function handleFile(file: File) {
    // Reset error
    set("error", "")

    // Validate file
    const validationError = validateFile(file)
    if (validationError) {
      set("error", validationError)
      return
    }

    const isGif = file.type === "image/gif"
    const reader = new FileReader()
    reader.onload = (e) => {
      set("previewUrl", e.target?.result as string)
    }
    reader.onerror = () => {
      set("error", "Failed to read file. Please try again.")
    }
    reader.readAsDataURL(file)

    setForm((prev) => ({
      ...prev,
      file,
      type: isGif ? "gif" : "image",
      error: "",
    }))
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset input to allow selecting the same file again
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.currentTarget.classList.add('border-primary', 'bg-primary/5')
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    e.currentTarget.classList.remove('border-primary', 'bg-primary/5')
  }

  // ── Tag management ──
  function addTag() {
    const tag = form.tagInput.trim().toLowerCase()
    if (!tag) return
    if (form.tags.includes(tag)) {
      set("error", "Tag already exists")
      return
    }
    if (form.tags.length >= 10) {
      set("error", "Maximum 10 tags allowed")
      return
    }
    setForm((prev) => ({ ...prev, tags: [...prev.tags, tag], tagInput: "" }))
    set("error", "")
  }

  function removeTag(tag: string) {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag()
    }
    if (e.key === "Backspace" && !form.tagInput && form.tags.length) {
      removeTag(form.tags[form.tags.length - 1])
    }
  }

  // ── Submit ──
  async function handleSubmit() {
    // Validation
    if (!form.file) {
      set("error", "Please select a file.")
      return
    }
    if (!form.label.trim()) {
      set("error", "Please enter a label.")
      return
    }
    if (form.label.trim().length > 50) {
      set("error", "Label must be less than 50 characters.")
      return
    }

    set("uploading", true)
    set("uploadProgress", 0)
    set("error", "")

    try {
      // Create FormData with proper field names
      const formData = new FormData()

      // Append the file - make sure the field name matches what the API expects
      formData.append("chat_asset", form.file)

      // Append other fields as strings
      formData.append("label", form.label.trim())
      formData.append("type", form.type)

      // Tags should be sent as a JSON string
      formData.append("tags", JSON.stringify(form.tags))

      // Log the form data for debugging (remove in production)
      console.log("Uploading asset:", {
        label: form.label.trim(),
        type: form.type,
        tags: form.tags,
        fileName: form.file.name,
        fileSize: form.file.size,
        fileType: form.file.type
      })

      // Make the API call
      const res = await createAssets(formData).unwrap()

      if (res?.success) {
        toast.success(res?.message || "Asset uploaded successfully!")
        // Reset form before closing
        setForm(EMPTY_FORM)
        onCancel()
      } else {
        throw new Error(res?.message || "Upload failed")
      }
    } catch (error: any) {
      console.error("Upload error:", error)

      // Handle different error types
      let errorMessage = "Upload failed. Please try again."

      if (error?.status === 413) {
        errorMessage = "File too large. Please compress and try again."
      } else if (error?.status === 400) {
        errorMessage = error?.data?.message || "Invalid file or data. Please check your input."
      } else if (error?.status === 401 || error?.status === 403) {
        errorMessage = "You don't have permission to upload assets."
      } else if (error?.status === 500) {
        errorMessage = "Server error. Please try again later."
      }

      set("error", errorMessage)
      toast.error(errorMessage)
    } finally {
      set("uploading", false)
      set("uploadProgress", 0)
    }
  }

  // ── Reset form ──
  function handleCancel() {
    setForm(EMPTY_FORM)
    onCancel()
  }

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      <div
        ref={dropRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !form.previewUrl && fileInputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-xl transition-all duration-200",
          form.previewUrl
            ? "border-transparent p-0"
            : "border-border hover:border-foreground/40 bg-muted/30 cursor-pointer p-8",
          form.error && !form.previewUrl && "border-destructive bg-destructive/5"
        )}
      >
        {form.previewUrl ? (
          <div className="relative rounded-xl overflow-hidden group">
            <Image
              width={200}
              height={200}
              src={form.previewUrl}
              alt="Asset preview"
              className="w-full h-52 object-cover rounded-xl"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setForm((prev) => ({
                  ...prev,
                  previewUrl: "",
                  file: null,
                  type: "gif",
                  error: ""
                }))
              }}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="absolute bottom-2 left-2 flex gap-2">
              <Badge variant="outline" className={`text-xs ${TYPE_STYLES[form.type]}`}>
                {form.type.toUpperCase()}
              </Badge>
              {form.file && (
                <Badge variant="outline" className="text-xs bg-black/50 text-white border-black/50">
                  {(form.file.size / 1024).toFixed(0)} KB
                </Badge>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center pointer-events-none">
            <div className="p-3 rounded-full bg-muted">
              <Upload className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Drop your file here</p>
              <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG, WEBP, GIF — max 2 MB</p>
            </div>
            <Button type="button" variant="outline" size="sm" className="mt-1 pointer-events-auto">
              Browse file
            </Button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={handleFileInput}
        />
      </div>

      {/* Label */}
      <div className="space-y-1.5">
        <Label htmlFor="asset-label">
          Label <span className="text-destructive">*</span>
        </Label>
        <Input
          id="asset-label"
          placeholder="e.g. Happy Dance"
          value={form.label}
          onChange={(e) => set("label", e.target.value)}
          maxLength={50}
          disabled={form.uploading}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Required</span>
          <span>{form.label.length}/50</span>
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-1.5">
        <Label>Tags</Label>
        <div
          className={cn(
            "flex flex-wrap gap-1.5 min-h-[2.5rem] px-3 py-2 rounded-md border border-input bg-background",
            "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0 transition-shadow",
            form.tags.length >= 10 && "border-yellow-500"
          )}
          onClick={() => document.getElementById("tag-input")?.focus()}
        >
          {form.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-xs bg-muted text-foreground px-2 py-0.5 rounded-full"
            >
              #{tag}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeTag(tag) }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            id="tag-input"
            className="flex-1 min-w-[120px] text-sm bg-transparent outline-none placeholder:text-muted-foreground"
            placeholder={form.tags.length === 0 ? "Type a tag and press Enter…" : ""}
            value={form.tagInput}
            onChange={(e) => set("tagInput", e.target.value)}
            onKeyDown={handleTagKeyDown}
            disabled={form.uploading}
          />
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Press Enter or comma to add a tag</span>
          <span className={cn(
            form.tags.length >= 10 ? "text-yellow-500" : "text-muted-foreground"
          )}>
            {form.tags.length}/10
          </span>
        </div>
      </div>

      {/* Error message */}
      {form.error && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{form.error}</p>
        </div>
      )}

      {/* Upload progress (optional) */}
      {form.uploading && form.uploadProgress > 0 && (
        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${form.uploadProgress}%` }}
          />
        </div>
      )}

      <DialogFooter className="pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={form.uploading}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={form.uploading || !form.file || !form.label.trim()}
          className="bg-(--color-primary) min-w-[110px]"
        >
          {form.uploading ? (
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Uploading…
            </span>
          ) : (
            "Upload Asset"
          )}
        </Button>
      </DialogFooter>
    </div>
  )
}

export default AssetForm;
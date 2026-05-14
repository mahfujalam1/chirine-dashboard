"use client"

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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
import { cn } from "@/lib/utils"
import {
  ImageIcon,
  LayoutGrid,
  LayoutList,
  Plus,
  Search,
  Tag,
  Trash2,
  Upload,
  X
} from "lucide-react"
import { useMemo, useRef, useState } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

type AssetType = "gif" | "image"

interface Asset {
  id: string
  url: string
  type: AssetType
  label: string
  tags: string[]
  createdAt: string
  /** file size in KB — populated from the upload response */
  sizeKb?: number
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_ASSETS: Asset[] = [
  {
    id: "1",
    url: "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExeGlkcnhzYTBxZjdldTQ4Mzkxc214dDgyaWllcWl4Njh6ZGtybHBudyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/hr4Ljjyj0L9RYlihLr/giphy.gif",
    type: "gif",
    label: "Happy Dance",
    tags: ["happy", "dance", "celebration"],
    createdAt: "2025-10-01",
  },
  {
    id: "2",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOG5vZXFrZGx6czk4dnRha3F5Y2NrZjl1MThtZTJvcjFibnNydmpsbyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/sPBKhpcsVvhg9OmF3J/giphy.gif",
    type: "gif",
    label: "Thumbs Up",
    tags: ["thumbs", "approve", "reaction"],
    createdAt: "2025-10-03",
  },
  {
    id: "3",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3RqbDc5M3FjY25lcTZpNWVwMDlzM3IydXdlM2hmeGU3MXU2MDJlYSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Y4z9olnoVl5QI/giphy.gif",
    type: "gif",
    label: "Mind Blown",
    tags: ["wow", "surprised", "reaction"],
    createdAt: "2025-10-05",
  },
  {
    id: "4",
    url: "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbTQ0NzJ1dTZ6eGVpYnBuM29pY2Nwem94d3R4MndmdHdkdjQ5ajIzcCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/6Q3M4BIK0lX44/giphy.gif",
    type: "gif",
    label: "LOL Cat",
    tags: ["funny", "cat", "laugh"],
    createdAt: "2025-10-07",
  },
  {
    id: "5",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3RqbDc5M3FjY25lcTZpNWVwMDlzM3IydXdlM2hmeGU3MXU2MDJlYSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l1KVaj5UcbHwrBMqI/giphy.gif",
    type: "gif",
    label: "Walking Away",
    tags: ["cool", "reaction", "bye"],
    createdAt: "2025-10-09",
  },
  {
    id: "6",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWRva2Jzaml0MG04MmdlcGhmczhlNHFxNWd0Ymo4bW5tdzlxaHdxdyZlcD12MV9naWZzX3RyZW5kaW5nJmN0PWc/5Nle87WgNwDbsj3P4Y/giphy.gif",
    type: "gif",
    label: "Fist Bump",
    tags: ["fist", "bump", "celebration"],
    createdAt: "2025-10-11",
  },
  {
    id: "7",
    url: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExN21vcDY1dnE5djQzaXZ6dHZkMmdsajViempsbjZxbGd0cTNjZGV2OSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Hsz2YZ9iBxvIztWpkd/giphy.gif",
    type: "gif",
    label: "Clapping",
    tags: ["clap", "applause", "celebration"],
    createdAt: "2025-10-13",
  },
  {
    id: "8",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdWR4ZWV4NjkyNm5vMzg0YXI4YTFtMHFuMW9ubTBicmxza3JkNDNkdCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/6602xh0FysvcKpyvMk/giphy.gif",
    type: "gif",
    label: "High Five",
    tags: ["high five", "happy", "reaction"],
    createdAt: "2025-10-15",
  },
]

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_TAGS = Array.from(new Set(SEED_ASSETS.flatMap((a) => a.tags))).sort()

const TYPE_STYLES: Record<AssetType, string> = {
  gif: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800",
  image: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
}

// ─── Upload Form State ────────────────────────────────────────────────────────

interface AssetFormState {
  label: string
  tagInput: string
  tags: string[]
  /** preview URL — either from FileReader (before upload) or the final CDN URL */
  previewUrl: string
  /** the actual file the user picked — sent to your upload endpoint */
  file: File | null
  type: AssetType
  uploading: boolean
  error: string
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
}

// ─── Asset Upload Form ────────────────────────────────────────────────────────

interface AssetFormProps {
  onSubmit: (url: string, label: string, tags: string[], type: AssetType) => void
  onCancel: () => void
}

function AssetForm({ onSubmit, onCancel }: AssetFormProps) {
  const [form, setForm] = useState<AssetFormState>(EMPTY_FORM)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  function set<K extends keyof AssetFormState>(key: K, value: AssetFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // ── File picking ──
  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      set("error", "Only image or GIF files are supported.")
      return
    }
    const isGif = file.type === "image/gif"
    const reader = new FileReader()
    reader.onload = (e) => {
      set("previewUrl", e.target?.result as string)
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
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  // ── Tag management ──
  function addTag() {
    const tag = form.tagInput.trim().toLowerCase()
    if (!tag || form.tags.includes(tag)) return
    setForm((prev) => ({ ...prev, tags: [...prev.tags, tag], tagInput: "" }))
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
  // In production: replace the fake timeout with your real upload call.
  // e.g.:
  //   const formData = new FormData()
  //   formData.append("file", form.file)
  //   const res = await fetch("/api/assets/upload", { method: "POST", body: formData })
  //   const { url } = await res.json()
  async function handleSubmit() {
    if (!form.file) { set("error", "Please select a file."); return }
    if (!form.label.trim()) { set("error", "Please enter a label."); return }

    set("uploading", true)

    try {
      // ─ Replace this block with your real upload ─────────────────────────────
      await new Promise((r) => setTimeout(r, 1200)) // simulate network
      const mockUrl = form.previewUrl                // pretend backend returned this
      // ────────────────────────────────────────────────────────────────────────

      onSubmit(mockUrl, form.label.trim(), form.tags, form.type)
    } catch {
      set("error", "Upload failed. Please try again.")
      set("uploading", false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      <div
        ref={dropRef}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !form.previewUrl && fileInputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-xl transition-colors",
          form.previewUrl
            ? "border-transparent p-0"
            : "border-border hover:border-foreground/40 bg-muted/30 cursor-pointer p-8"
        )}
      >
        {form.previewUrl ? (
          <div className="relative rounded-xl overflow-hidden">
            <img
              src={form.previewUrl}
              alt="preview"
              className="w-full h-52 object-cover rounded-xl"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setForm((prev) => ({ ...prev, previewUrl: "", file: null }))
              }}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="absolute bottom-2 left-2">
              <Badge variant="outline" className={`text-xs ${TYPE_STYLES[form.type]}`}>
                {form.type.toUpperCase()}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center pointer-events-none">
            <div className="p-3 rounded-full bg-muted">
              <Upload className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Drop your file here</p>
              <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG, WEBP, GIF — max 10 MB</p>
            </div>
            <Button type="button" variant="outline" size="sm" className="mt-1 pointer-events-auto">
              Browse file
            </Button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.gif"
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
        />
      </div>

      {/* Tags */}
      <div className="space-y-1.5">
        <Label>Tags</Label>
        <div
          className={cn(
            "flex flex-wrap gap-1.5 min-h-[2.5rem] px-3 py-2 rounded-md border border-input bg-background",
            "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0 transition-shadow"
          )}
          onClick={() => document.getElementById("tag-input")?.focus()}
        >
          {form.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-xs bg-muted text-foreground px-2 py-0.5 rounded-full"
            >
              {tag}
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
            onBlur={addTag}
          />
        </div>
        <p className="text-xs text-muted-foreground">Press Enter or comma to add a tag</p>
      </div>

      {form.error && (
        <p className="text-sm text-destructive">{form.error}</p>
      )}

      <DialogFooter className="pt-1">
        <Button type="button" variant="outline" onClick={onCancel} disabled={form.uploading}>
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

// ─── Asset Card ───────────────────────────────────────────────────────────────

interface AssetCardProps {
  asset: Asset
  onDelete: (asset: Asset) => void
  view: "grid" | "list"
}

function AssetCard({ asset, onDelete, view }: AssetCardProps) {
  if (view === "list") {
    return (
      <div className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors group">
        <div className="h-16 w-16 rounded-lg overflow-hidden shrink-0 bg-muted">
          <img src={asset.url} alt={asset.label} className="h-full w-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground truncate">{asset.label}</p>
            <Badge variant="outline" className={`text-[10px] shrink-0 ${TYPE_STYLES[asset.type]}`}>
              {asset.type.toUpperCase()}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {asset.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <p className="text-xs text-muted-foreground hidden sm:block">{asset.createdAt}</p>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onDelete(asset)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative group rounded-xl overflow-hidden border border-border bg-card">
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={asset.url}
          alt={asset.label}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3">
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate leading-tight">{asset.label}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {asset.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
              {asset.tags.length > 3 && (
                <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-full">
                  +{asset.tags.length - 3}
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20 shrink-0"
            onClick={(e) => { e.stopPropagation(); onDelete(asset) }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {/* Type badge — always visible */}
      <div className="absolute top-2 left-2">
        <Badge variant="outline" className={`text-[10px] backdrop-blur-sm ${TYPE_STYLES[asset.type]}`}>
          {asset.type.toUpperCase()}
        </Badge>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ChatAssets() {
  const [assets, setAssets] = useState<Asset[]>(SEED_ASSETS)
  const [search, setSearch] = useState("")
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<AssetType | null>(null)
  const [view, setView] = useState<"grid" | "list">("grid")
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null)

  // All unique tags derived from current assets
  const allTags = useMemo(
    () => Array.from(new Set(assets.flatMap((a) => a.tags))).sort(),
    [assets]
  )

  // Filtered assets
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return assets.filter((a) => {
      if (typeFilter && a.type !== typeFilter) return false
      if (activeTag && !a.tags.includes(activeTag)) return false
      if (q) {
        const matchLabel = a.label.toLowerCase().includes(q)
        const matchTag = a.tags.some((t) => t.includes(q))
        if (!matchLabel && !matchTag) return false
      }
      return true
    })
  }, [assets, search, activeTag, typeFilter])

  // ── Handlers ──
  function handleCreate(url: string, label: string, tags: string[], type: AssetType) {
    const newAsset: Asset = {
      id: String(Date.now()),
      url,
      label,
      tags,
      type,
      createdAt: new Date().toISOString().split("T")[0],
    }
    setAssets((prev) => [newAsset, ...prev])
    setCreateOpen(false)
  }

  function handleDelete(id: string) {
    setAssets((prev) => prev.filter((a) => a.id !== id))
    setDeleteTarget(null)
  }

  const counts = {
    all: assets.length,
    gif: assets.filter((a) => a.type === "gif").length,
    image: assets.filter((a) => a.type === "image").length,
  }

  return (
    <>
      <Card className="border border-border bg-card">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-base font-semibold text-foreground">Chat Assets</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Manage preset GIFs and images users can send in chat.
              </p>
            </div>
            <Button
              className="bg-(--color-primary) flex items-center gap-2 text-sm shrink-0"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Add Asset
            </Button>
          </div>

          {/* ── Controls row ── */}
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search by label or tag…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 bg-background"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Type filter */}
            <div className="flex items-center gap-1.5 bg-muted rounded-lg p-1">
              {([null, "gif", "image"] as (AssetType | null)[]).map((t) => (
                <button
                  key={String(t)}
                  onClick={() => setTypeFilter(t)}
                  className={cn(
                    "px-3 h-7 rounded-md text-xs font-medium transition-colors",
                    typeFilter === t
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t === null ? `All (${counts.all})` : t === "gif" ? `GIF (${counts.gif})` : `Image (${counts.image})`}
                </button>
              ))}
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <button
                onClick={() => setView("grid")}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  view === "grid" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  view === "list" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Tag pills ── */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Tag className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <button
                onClick={() => setActiveTag(null)}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-full border transition-colors",
                  activeTag === null
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                )}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag((prev) => (prev === tag ? null : tag))}
                  className={cn(
                    "text-xs px-2.5 py-1 rounded-full border transition-colors",
                    activeTag === tag
                      ? "bg-foreground text-background border-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                  )}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="p-4 rounded-full bg-muted mb-3">
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No assets found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {search || activeTag || typeFilter
                  ? "Try adjusting your search or filters."
                  : "Add your first asset to get started."}
              </p>
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filtered.map((asset) => (
                <AssetCard key={asset.id} asset={asset} onDelete={setDeleteTarget} view="grid" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((asset) => (
                <AssetCard key={asset.id} asset={asset} onDelete={setDeleteTarget} view="list" />
              ))}
            </div>
          )}

          {/* Result count */}
          {filtered.length > 0 && (
            <p className="text-xs text-muted-foreground text-right mt-4">
              {filtered.length} of {assets.length} assets
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Create Dialog ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Asset</DialogTitle>
            <DialogDescription>
              Upload a GIF or image. After upload, the file URL will be stored automatically.
            </DialogDescription>
          </DialogHeader>
          <AssetForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this asset?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">"{deleteTarget?.label}"</span> will be
              permanently removed and users will no longer be able to send it in chat. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
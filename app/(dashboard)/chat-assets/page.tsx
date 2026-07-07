"use client"

import { useDeleteAssetsMutation, useGetChatAssetsQuery } from '@/app/redux-query/services/chatassetsApis'
import AssetCard from '@/components/dashboard/AssetForm/AssetCard'
import AssetForm from '@/components/dashboard/AssetForm/AssetForm'
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
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  LayoutGrid,
  LayoutList,
  Loader2,
  Plus,
  Search,
  Tag,
  X
} from "lucide-react"
import { useState } from "react"
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

// ─── Skeleton Components ─────────────────────────────────────────────────────

function SkeletonCard({ view }: { view: "grid" | "list" }) {
  if (view === "list") {
    return (
      <div className="flex items-center gap-4 p-3 rounded-lg border border-border bg-card animate-pulse">
        <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-muted rounded w-3/4 mb-2" />
          <div className="flex gap-1.5">
            <div className="h-5 bg-muted rounded w-12" />
            <div className="h-5 bg-muted rounded w-12" />
            <div className="h-5 bg-muted rounded w-12" />
          </div>
        </div>
        <div className="flex gap-1.5">
          <div className="w-8 h-8 bg-muted rounded" />
          <div className="w-8 h-8 bg-muted rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="group relative rounded-xl overflow-hidden border border-border bg-card animate-pulse">
      <div className="aspect-square bg-muted" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="flex gap-1.5">
          <div className="h-5 bg-muted rounded w-12" />
          <div className="h-5 bg-muted rounded w-12" />
        </div>
      </div>
    </div>
  )
}

function SkeletonGrid({ view, count = 12 }: { view: "grid" | "list", count?: number }) {
  return (
    <>
      {view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard key={i} view={view} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
            <SkeletonCard key={i} view={view} />
          ))}
        </div>
      )}
    </>
  )
}

function SkeletonTagPills() {
  return (
    <div className="flex items-center gap-2 mt-3 flex-wrap animate-pulse">
      <Tag className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <div className="h-7 w-12 bg-muted rounded-full" />
      <div className="h-7 w-16 bg-muted rounded-full" />
      <div className="h-7 w-20 bg-muted rounded-full" />
      <div className="h-7 w-14 bg-muted rounded-full" />
      <div className="h-7 w-24 bg-muted rounded-full" />
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ChatAssets() {
  const [search, setSearch] = useState("")
  const [activeTag, setActiveTag] = useState<string>("")
  const [typeFilter, setTypeFilter] = useState<AssetType | null>(null)
  const [view, setView] = useState<"grid" | "list">("grid")
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null)

  const [filterQuery, setFilterQuery] = useState({
    ...(activeTag && { tag: activeTag }),
    ...(search && { search: search }),
    ...(typeFilter && { type: typeFilter }),
    limit: 10,
    page: 1,
  })
  const { data, isLoading, isFetching, isSuccess } = useGetChatAssetsQuery(filterQuery)
  const [deleteChatAsset, { isLoading: deleteLoading }] = useDeleteAssetsMutation()

  // Handle filter changes
  const handleTypeFilter = (type: AssetType | null) => {
    setTypeFilter(type)
    setFilterQuery(prev => ({
      ...prev,
      ...(type && { type }),
      ...(!type && { type: undefined })
    }))
  }

  const handleTagFilter = (tag: string) => {
    setActiveTag(tag)
    setFilterQuery(prev => ({
      ...prev,
      ...(tag && { tag }),
      ...(!tag && { tag: undefined })
    }))
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setFilterQuery(prev => ({
      ...prev,
      ...(value && { search: value }),
      ...(!value && { search: undefined })
    }))
  }

  async function handleDelete(id: string) {
    setDeleteTarget(null)
    try {
      const res = await deleteChatAsset(id).unwrap()
      if (!res?.success) {
        throw new Error(res?.message || "Failed to delete asset")
      }
      toast.success(res?.message)
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || "Failed to delete asset")
    }
  }

  // Show loading screen only for initial load
  if (isLoading) {
    return <LoadingScreen message="Loading Assets..." />
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
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 h-9 bg-background"
                disabled={isFetching}
              />
              {search && (
                <button
                  onClick={() => handleSearch("")}
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
                  onClick={() => handleTypeFilter(t)}
                  className={cn(
                    "px-3 h-7 rounded-md text-xs font-medium transition-colors",
                    typeFilter === t
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  disabled={isFetching}
                >
                  {t === null ? `All (${data?.data?.counts?.all || 0})` : t === "gif" ? `GIF (${data?.data?.counts?.gif || 0})` : `Image (${data?.data?.counts?.image || 0})`}
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
                disabled={isFetching}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  view === "list" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
                disabled={isFetching}
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Tag pills ── */}
          {isFetching && !isSuccess ? (
            <SkeletonTagPills />
          ) : data?.data?.tags?.length > 0 ? (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Tag className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <button
                onClick={() => handleTagFilter("")}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-full border transition-colors",
                  activeTag === ""
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                )}
                disabled={isFetching}
              >
                All
              </button>
              {data?.data?.tags?.map((tag: string) => (
                <button
                  key={tag}
                  onClick={() => handleTagFilter(tag)}
                  className={cn(
                    "text-xs px-2.5 py-1 rounded-full border transition-colors",
                    activeTag === tag
                      ? "bg-foreground text-background border-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                  )}
                  disabled={isFetching}
                >
                  #{tag}
                </button>
              ))}
            </div>
          ) : null}
        </CardHeader>

        <CardContent>
          {/* Show skeleton while fetching after initial load */}
          {isFetching && isSuccess ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Refreshing assets...</span>
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <SkeletonGrid view={view} count={view === "grid" ? 12 : 6} />
            </div>
          ) : data?.data?.result?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 rounded-full bg-muted mb-4">
                <Tag className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No assets found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                {search || activeTag || typeFilter
                  ? "Try adjusting your filters or search terms"
                  : "Upload your first GIF or image to get started"}
              </p>
              {(search || activeTag || typeFilter) && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearch("")
                    setActiveTag("")
                    setTypeFilter(null)
                    setFilterQuery({ limit: 10, page: 1 })
                  }}
                >
                  Clear all filters
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Show asset count */}
              <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
                <span>
                  Showing {data?.data?.result?.length || 0} of {data?.data?.counts?.all || 0} assets
                </span>
                {isFetching && (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Updating...
                  </span>
                )}
              </div>

              {/* Asset grid/list */}
              {view === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {data?.data?.result?.map((asset: any) => (
                    <AssetCard key={asset?._id} asset={asset} onDelete={setDeleteTarget} view="grid" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {data?.data?.result?.map((asset: any) => (
                    <AssetCard key={asset?._id} asset={asset} onDelete={setDeleteTarget} view="list" />
                  ))}
                </div>
              )}
            </>
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
          <AssetForm onCancel={() => setCreateOpen(false)} />
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
              onClick={() => deleteTarget && handleDelete(deleteTarget._id)}
              disabled={deleteLoading}
            >
              {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
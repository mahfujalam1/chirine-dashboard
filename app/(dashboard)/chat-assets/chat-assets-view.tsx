"use client"

import { useDeleteAssetsMutation, useGetChatAssetsQuery } from '@/lib/redux/services/chatassetsApis'
import AssetCard from '@/components/dashboard/AssetForm/AssetCard'
import AssetForm from '@/components/dashboard/AssetForm/AssetForm'
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
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/dashboard/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import {
  CheckSquare,
  FileImage,
  FolderOpen,
  Plus,
  RefreshCw,
  Search,
  Square,
  Trash2,
  X,
} from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import { useMemo, useState } from "react"
import { toast } from 'sonner'

export default function ChatAssetsClientView() {
  const [selectedFolder, setSelectedFolder] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const deferredSearchQuery = useDebounce(searchQuery, 300)
  const [selectedTag, setSelectedTag] = useState<string>("all")
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([])

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<any>(null)
  const [assetToDelete, setAssetToDelete] = useState<any>(null)

  const [deleteAssets, { isLoading: isDeleting }] = useDeleteAssetsMutation()

  const { data: apiData, isLoading, isError, refetch } = useGetChatAssetsQuery(undefined)
  const assets = apiData?.data?.result || []

  const folders = useMemo(() => {
    const set = new Set<string>()
    assets.forEach((item: any) => {
      if (item?.folderName) set.add(item.folderName)
    })
    return Array.from(set)
  }, [assets])

  const tags = useMemo(() => {
    const set = new Set<string>()
    assets.forEach((item: any) => {
      item?.tags?.forEach((t: string) => set.add(t))
    })
    return Array.from(set)
  }, [assets])

  const filteredAssets = useMemo(() => {
    return assets.filter((asset: any) => {
      if (selectedFolder !== "all" && asset.folderName !== selectedFolder) return false;
      if (selectedTag !== "all" && !asset.tags?.includes(selectedTag)) return false;
      if (deferredSearchQuery.trim()) {
        const q = deferredSearchQuery.toLowerCase()
        const matchLabel = asset.label?.toLowerCase().includes(q)
        const matchFolder = asset.folderName?.toLowerCase().includes(q)
        const matchTags = asset.tags?.some((t: string) => t.toLowerCase().includes(q))
        if (!matchLabel && !matchFolder && !matchTags) return false
      }
      return true
    })
  }, [assets, selectedFolder, selectedTag, deferredSearchQuery])

  const isAllSelected =
    filteredAssets.length > 0 &&
    filteredAssets.every((a: any) => selectedAssetIds.includes(a._id))

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedAssetIds([])
    } else {
      setSelectedAssetIds(filteredAssets.map((a: any) => a._id))
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedAssetIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSingleDeleteRequest = (asset: any) => {
    setAssetToDelete(asset)
  }

  const handleConfirmSingleDelete = async () => {
    if (!assetToDelete) return
    try {
      await deleteAssets({ ids: [assetToDelete._id] }).unwrap()
      toast.success("Asset deleted successfully")
      setSelectedAssetIds((prev) => prev.filter((id) => id !== assetToDelete._id))
      setAssetToDelete(null)
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete asset")
    }
  }

  const handleConfirmBulkDelete = async () => {
    if (selectedAssetIds.length === 0) return
    try {
      await deleteAssets({ ids: selectedAssetIds }).unwrap()
      toast.success(`${selectedAssetIds.length} assets deleted successfully`)
      setSelectedAssetIds([])
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete assets")
    }
  }

  const handleEditClick = (asset: any) => {
    setEditingAsset(asset)
    setIsFormOpen(true)
  }

  const handleCreateClick = () => {
    setEditingAsset(null)
    setIsFormOpen(true)
  }

  return (
    <>
      <PageHeader
        title="Chat Assets"
        description="Manage images, GIFs, stickers, and multimedia assets for chat."
      >
        <div className="flex items-center gap-2">
          {selectedAssetIds.length > 0 && (
            <AlertDialog>
              <Button
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected ({selectedAssetIds.length})
              </Button>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will permanently delete {selectedAssetIds.length} selected asset(s). This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirmBulkDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Assets
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <Button
            onClick={handleCreateClick}
            className="flex items-center gap-2 bg-[#00ACA7] hover:bg-[#009691] text-white"
          >
            <Plus className="w-4 h-4" />
            Add Asset
          </Button>
        </div>
      </PageHeader>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by label, tag, or folder..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card border-border"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <div className="flex items-center gap-1.5 bg-card border border-border p-1 rounded-lg">
            <FolderOpen className="w-4 h-4 text-muted-foreground ml-2" />
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="bg-transparent text-xs font-medium focus:outline-none pr-4 cursor-pointer"
            >
              <option value="all">All Folders ({folders.length})</option>
              {folders.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-card border border-border p-1 rounded-lg">
            <span className="text-xs text-muted-foreground ml-2">Tag:</span>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="bg-transparent text-xs font-medium focus:outline-none pr-4 cursor-pointer"
            >
              <option value="all">All Tags ({tags.length})</option>
              {tags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredAssets.length > 0 && (
        <div className="flex items-center justify-between mb-4 bg-muted/40 p-3 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 text-xs font-medium cursor-pointer"
            >
              {isAllSelected ? (
                <CheckSquare className="w-4 h-4 text-[#00ACA7]" />
              ) : (
                <Square className="w-4 h-4 text-muted-foreground" />
              )}
              Select All Filtered ({filteredAssets.length})
            </button>
          </div>
          <span className="text-xs text-muted-foreground">
            Showing {filteredAssets.length} of {assets.length} total assets
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="bg-card border-border overflow-hidden">
              <Skeleton className="h-36 w-full" />
              <CardContent className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-xl bg-card">
          <p className="text-muted-foreground mb-4">Failed to load chat assets.</p>
          <Button onClick={() => refetch()} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-xl bg-card">
          <FileImage className="w-12 h-12 text-muted-foreground/50 mb-3" />
          <h3 className="text-base font-semibold mb-1">No Assets Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mb-4">
            No media assets matched your search or filters.
          </p>
          <Button onClick={handleCreateClick} size="sm" className="bg-[#00ACA7] text-white">
            <Plus className="w-4 h-4 mr-1" /> Add New Asset
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredAssets.map((asset: any) => (
            <AssetCard
              key={asset._id}
              asset={asset}
              onDelete={() => handleSingleDeleteRequest(asset)}
              view="grid"
            />
          ))}
        </div>
      )}

      {isFormOpen && (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-xl">
            <AssetForm onCancel={() => setIsFormOpen(false)} />
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={!!assetToDelete} onOpenChange={(open) => !open && setAssetToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Asset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete asset &quot;{assetToDelete?.label}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSingleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

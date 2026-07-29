"use client"

import Image from 'next/image'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Trash2
} from "lucide-react"

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

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_STYLES: Record<AssetType, string> = {
  gif: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800",
  image: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
}


interface AssetCardProps {
  asset: Asset
  onDelete: (asset: Asset) => void
  view: "grid" | "list"
}

function AssetCard({ asset, onDelete, view }: AssetCardProps) {
  if (view === "list") {
    return (
      <div className="flex items-center gap-1 p-3 rounded border border-border bg-card hover:bg-muted/40 transition-colors group">
        <div className="h-16 w-16 rounded overflow-hidden shrink-0 bg-muted">
          <Image width={200} height={200} src={asset?.url} alt={asset?.label} className="h-full w-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground truncate">{asset?.label}</p>
            <Badge variant="outline" className={`text-[10px] shrink-0 ${TYPE_STYLES[asset?.type]}`}>
              {asset?.type.toUpperCase()}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {asset?.tags.map((tag) => (
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
          <p className="text-xs text-muted-foreground hidden sm:block">{asset?.createdAt}</p>
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
    <div className="relative group rounded overflow-hidden border border-border bg-card">
      <div className="aspect-square overflow-hidden bg-muted relative">
        <Image
          src={asset?.url || "/placeholder.svg"}
          alt={asset?.label || "Asset"}
          width={300}
          height={300}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3">
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate leading-tight">{asset?.label}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {asset?.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
              {asset?.tags.length > 3 && (
                <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-full">
                  +{asset?.tags.length - 3}
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
        <Badge variant="outline" className={`text-[10px] backdrop-blur-sm ${TYPE_STYLES[asset?.type]}`}>
          {asset?.type.toUpperCase()}
        </Badge>
      </div>
    </div>
  )
}

export default AssetCard;
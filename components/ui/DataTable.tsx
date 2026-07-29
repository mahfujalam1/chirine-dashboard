"use client";

import { cn } from "@/lib/utils";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import React, { useMemo, useState } from "react";

export type SortOrder = "asc" | "desc" | null;

export interface ColumnDef<T extends object = Record<string, unknown>> {
  title: string;
  key?: keyof T | (keyof T)[];
  renderItem?: (record: T, index: number) => React.ReactNode;
  sortKey?: keyof T;
  align?: "left" | "center" | "right";
  className?: string;
  width?: string;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  page: number;
}

export interface DataTableProps<T extends object = Record<string, unknown>> {
  data: T[];
  columns: ColumnDef<T>[];
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
  onSortChange?: (key: keyof T, order: SortOrder) => void;
  rowKey?: (record: T, index: number) => string | number;
  onRowClick?: (record: T, index: number) => void;
  emptyText?: string;
  loading?: boolean;
  className?: string;
  stickyHeader?: boolean;
}

function getAlignClass(align?: "left" | "center" | "right") {
  return align === "right"
    ? "text-right"
    : align === "center"
      ? "text-center"
      : "text-left";
}

function getCellValue<T extends object>(
  record: T,
  key: keyof T | (keyof T)[],
): string {
  const r = record as Record<keyof T, unknown>;
  if (Array.isArray(key)) {
    return key
      .map((k) => (r[k] != null ? String(r[k]) : ""))
      .filter(Boolean)
      .join(" · ");
  }
  return r[key] != null ? String(r[key]) : "";
}

function SkeletonRow({ colCount }: { colCount: number }) {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: colCount }).map((_, i) => (
        <td key={i} className="py-3 px-3">
          <div
            className="h-4 rounded bg-muted animate-pulse"
            style={{ width: `${60 + Math.random() * 30}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  onChange: (p: number) => void;
}

function Pagination({ page, total, limit, onChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = Math.min((page - 1) * limit + 1, total);
  const to = Math.min(page * limit, total);

  const pages = useMemo<(number | "…")[]>(() => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const arr: (number | "…")[] = [1];
    if (page > 3) arr.push("…");
    for (
      let p = Math.max(2, page - 1);
      p <= Math.min(totalPages - 1, page + 1);
      p++
    )
      arr.push(p);
    if (page < totalPages - 2) arr.push("…");
    arr.push(totalPages);
    return arr;
  }, [page, totalPages]);

  return (
    <div className="flex items-center justify-between gap-1 pt-4 flex-wrap">
      {/* <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{from}–{to}</span> of{" "}
        <span className="font-medium text-foreground">{total}</span> results
      </p> */}
      <div className="flex items-center gap-1">
        {/* First */}
        <PagBtn
          onClick={() => onChange(1)}
          disabled={page === 1}
          title="First page"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </PagBtn>
        {/* Prev */}
        <PagBtn
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          title="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </PagBtn>

        {pages.map((p, i) =>
          p === "…" ? (
            <span
              key={`ellipsis-${i}`}
              className="px-1 text-muted-foreground text-sm select-none"
            >
              …
            </span>
          ) : (
            <PagBtn key={p} onClick={() => onChange(p)} active={p === page}>
              {p}
            </PagBtn>
          ),
        )}

        {/* Next */}
        <PagBtn
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          title="Next page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </PagBtn>
        {/* Last */}
        <PagBtn
          onClick={() => onChange(totalPages)}
          disabled={page === totalPages}
          title="Last page"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </PagBtn>
      </div>
    </div>
  );
}

function PagBtn({
  children,
  onClick,
  disabled,
  active,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "inline-flex items-center justify-center h-8 min-w-[2rem] px-1.5 rounded text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "bg-primary text-primary-foreground "
          : "text-foreground hover:bg-muted",
        disabled && "opacity-40 pointer-events-none",
      )}
    >
      {children}
    </button>
  );
}

function SortIcon({ order }: { order: SortOrder }) {
  if (order === "asc") return <ArrowUp className="h-3.5 w-3.5 text-primary" />;
  if (order === "desc")
    return <ArrowDown className="h-3.5 w-3.5 text-primary" />;
  return <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />;
}

export function DataTable<T extends object>({
  data,
  columns,
  meta,
  onPageChange,
  onSortChange,
  rowKey,
  onRowClick,
  emptyText = "No data found.",
  loading = false,
  className,
  stickyHeader = false,
}: DataTableProps<T>) {
  const [internalPage, setInternalPage] = useState(1);

  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  const isServerPaginated = !!onPageChange;
  const currentPage = meta ? (isServerPaginated ? meta.page : internalPage) : 1;

  const processedData = useMemo(() => {
    let rows = [...data];

    if (!onSortChange && sortKey && sortOrder) {
      rows.sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        const cmp =
          typeof av === "number" && typeof bv === "number"
            ? av - bv
            : String(av ?? "").localeCompare(String(bv ?? ""));
        return sortOrder === "asc" ? cmp : -cmp;
      });
    }

    if (meta && !isServerPaginated) {
      const start = (internalPage - 1) * meta.limit;
      rows = rows.slice(start, start + meta.limit);
    }

    return rows;
  }, [
    data,
    sortKey,
    sortOrder,
    onSortChange,
    meta,
    isServerPaginated,
    internalPage,
  ]);

  function handleSort(col: ColumnDef<T>) {
    if (!col.sortKey) return;
    let next: SortOrder = "asc";
    if (sortKey === col.sortKey) {
      next = sortOrder === "asc" ? "desc" : sortOrder === "desc" ? null : "asc";
    }
    setSortKey(next ? col.sortKey : null);
    setSortOrder(next);
    if (onSortChange) onSortChange(col.sortKey, next);
  }

  function handlePageChange(p: number) {
    if (isServerPaginated) {
      onPageChange!(p);
    } else {
      setInternalPage(p);
    }
  }

  const showPagination = !!meta;
  const effectiveMeta = meta ? { ...meta, page: currentPage } : null;

  return (
    <div className={cn("w-full space-y-0", className)}>
      {/* Table wrapper */}
      <div className={cn("w-full overflow-auto rounded border border-border")}>
        <table className="w-full bg-white caption-bottom text-sm">
          {/* ── Head ── */}
          <thead
            className={cn(
              stickyHeader &&
                "sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60",
            )}
          >
            <tr className="border-b border-border bg-muted/40">
              {columns.map((col, ci) => {
                const isSorted = col.sortKey && sortKey === col.sortKey;
                return (
                  <th
                    key={ci}
                    className={cn(
                      "py-3 px-3 font-medium text-muted-foreground whitespace-nowrap",
                      getAlignClass(col.align),
                      col.width,
                      col.sortKey &&
                        "cursor-pointer select-none hover:text-foreground transition-colors",
                    )}
                    onClick={() => handleSort(col)}
                  >
                    <div
                      className={cn(
                        "inline-flex items-center gap-1.5",
                        col.align === "right" && "flex-row-reverse",
                      )}
                    >
                      {col.title}
                      {col.sortKey && (
                        <SortIcon order={isSorted ? sortOrder : null} />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* ── Body ── */}
          <tbody>
            {loading ? (
              Array.from({ length: meta?.limit ?? 5 }).map((_, i) => (
                <SkeletonRow key={i} colCount={columns.length} />
              ))
            ) : processedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-16 text-center text-muted-foreground"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              processedData.map((record, rowIndex) => {
                const key = rowKey ? rowKey(record, rowIndex) : rowIndex;
                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick?.(record, rowIndex)}
                    className={cn(
                      "border-b border-border last:border-0 transition-colors",
                      onRowClick && "cursor-pointer hover:bg-muted/50",
                    )}
                  >
                    {columns.map((col, ci) => (
                      <td
                        key={ci}
                        className={cn(
                          "py-3 px-3 align-middle",
                          getAlignClass(col.align),
                          col.className,
                        )}
                      >
                        {col.renderItem
                          ? col.renderItem(record, rowIndex)
                          : col.key
                            ? getCellValue(record, col.key)
                            : null}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {showPagination && effectiveMeta && (
        <Pagination
          page={effectiveMeta.page}
          total={effectiveMeta.total}
          limit={effectiveMeta.limit}
          onChange={handlePageChange}
        />
      )}
    </div>
  );
}

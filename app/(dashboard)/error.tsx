"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-8 rounded-xl border border-destructive/20 bg-destructive/5 text-center my-6 space-y-4">
      <div className="mx-auto size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
        <AlertCircle className="size-6" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">
          Error Loading Dashboard Content
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {error.message || "Failed to load data for this view."}
        </p>
      </div>
      <Button onClick={() => reset()} variant="outline" size="sm">
        Retry Section
      </Button>
    </div>
  );
}

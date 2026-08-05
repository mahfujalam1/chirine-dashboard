import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Area Of Focus",
  description: "Manage area of focus items.",
};

export const dynamic = "force-dynamic";

export default function AreaOfFocusPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Area Of Focus
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage area of focus options.
        </p>
      </div>
    </div>
  );
}

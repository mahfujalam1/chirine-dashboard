import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground text-center">
      <div className="size-16 rounded-full bg-teal-100 dark:bg-teal-950 flex items-center justify-center mb-4 text-[#00ACA7]">
        <FileQuestion className="size-8" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight mb-2">404</h1>
      <h2 className="text-xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-muted-foreground max-w-md mb-6 text-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Button asChild variant="default">
        <Link href="/">Return to Dashboard</Link>
      </Button>
    </div>
  );
}

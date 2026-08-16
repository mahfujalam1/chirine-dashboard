"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/utils";
import { AlertCircle, RefreshCw, RotateCcw, Save } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const JoditComponent = dynamic(
  () => import("@/components/dashboard/JoditComponent"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[500px] w-full" />,
  },
);

interface WebContentEditorProps {
  title: string;
  description: string;
  documentLabel: string;
  content?: string;
  updatedAt?: string;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isSaving: boolean;
  refetch: () => void;
  onSave: (description: string) => Promise<{ message?: string }>;
}

function formatUpdatedAt(value?: string) {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function WebContentEditor({
  title,
  description,
  documentLabel,
  content,
  updatedAt,
  isLoading,
  isFetching,
  isError,
  isSaving,
  refetch,
  onSave,
}: WebContentEditorProps) {
  const [editorContent, setEditorContent] = useState("");
  const [savedContent, setSavedContent] = useState("");

  useEffect(() => {
    if (content === undefined) return;
    setEditorContent(content);
    setSavedContent(content);
  }, [content]);

  const hasChanges = editorContent !== savedContent;

  async function handleSave() {
    if (!editorContent.trim()) {
      toast.error(`${documentLabel} cannot be empty`);
      return;
    }

    try {
      const response = await onSave(editorContent);
      setSavedContent(editorContent);
      toast.success(response.message || `${documentLabel} updated successfully`);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, `Unable to update ${documentLabel.toLowerCase()}`));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description}>
        <Button
          variant="outline"
          onClick={refetch}
          disabled={isFetching || isSaving}
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </PageHeader>

      {isError ? (
        <Card className="border-destructive/30">
          <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
            <AlertCircle className="h-9 w-9 text-destructive" />
            <div>
              <p className="font-medium">Unable to load {documentLabel.toLowerCase()}</p>
              <p className="text-sm text-muted-foreground">
                Please check your connection and try again.
              </p>
            </div>
            <Button variant="outline" onClick={refetch} disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Edit {documentLabel}</CardTitle>
            <CardDescription>
              Use the editor below to format the content shown to users. Last updated: {isLoading ? "Loading..." : formatUpdatedAt(updatedAt)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {isLoading ? (
              <Skeleton className="h-[500px] w-full" />
            ) : (
              <JoditComponent
                content={editorContent}
                setContent={setEditorContent}
              />
            )}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={!hasChanges || isSaving}
                onClick={() => setEditorContent(savedContent)}
              >
                <RotateCcw className="h-4 w-4" />
                Discard changes
              </Button>
              <Button
                type="button"
                className="bg-[#00ACA7] hover:bg-[#009c98]"
                disabled={!hasChanges || isSaving || isLoading}
                onClick={handleSave}
              >
                {isSaving ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

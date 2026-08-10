"use client";

import { ExpertiseFormDialog } from "@/components/dashboard/area-of-focus/expertise-form-dialog";
import { ExpertiseTable } from "@/components/dashboard/area-of-focus/expertise-table";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  CreateExpertisePayload,
  Expertise,
  useCreateExpertiseMutation,
  useDeleteExpertiseMutation,
  useGetAdminExpertiseQuery,
} from "@/lib/redux/services/expertiseApis";
import { getErrorMessage } from "@/lib/utils";
import { Plus, RefreshCw, Search, Target } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function AreaOfFocusClientView() {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Expertise | null>(null);

  const expertiseQuery = useGetAdminExpertiseQuery();
  const [createExpertise, createState] = useCreateExpertiseMutation();
  const [deleteExpertise, deleteState] = useDeleteExpertiseMutation();

  const expertise = useMemo(
    () => expertiseQuery.data?.data ?? [],
    [expertiseQuery.data],
  );

  const filteredExpertise = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return expertise;
    return expertise.filter((item) =>
      item.name.toLowerCase().includes(normalizedSearch),
    );
  }, [expertise, search]);

  async function handleCreate(input: CreateExpertisePayload) {
    try {
      const response = await createExpertise(input).unwrap();
      toast.success(response.message || "Area of focus created successfully.");
      setFormOpen(false);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to create area of focus."));
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      const response = await deleteExpertise(deleteTarget._id).unwrap();
      toast.success(response.message || "Area of focus deleted successfully.");
      setDeleteTarget(null);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to delete area of focus."));
    }
  }

  return (
    <>
      <PageHeader
        title="Area of Focus"
        description="Manage expertise options available throughout the platform."
      >
        <Button
          className="bg-[#00ACA7] text-white hover:bg-[#009691]"
          onClick={() => setFormOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Area of Focus
        </Button>
      </PageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border bg-card">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Total Areas of Focus
              </p>
              <p className="mt-1 text-2xl font-bold">{expertise.length}</p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-teal-500/10 text-[#00ACA7]">
              <Target className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Expertise Options</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Add or remove the focus areas shown to users and therapists.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search area of focus..."
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {expertiseQuery.isError ? (
            <div className="flex flex-col items-center rounded-lg border border-destructive/30 bg-destructive/5 p-10 text-center">
              <p className="text-sm font-medium text-destructive">
                Unable to load areas of focus.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Check your connection and try again.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                disabled={expertiseQuery.isFetching}
                onClick={() => expertiseQuery.refetch()}
              >
                <RefreshCw
                  className={`mr-2 size-4 ${expertiseQuery.isFetching ? "animate-spin" : ""}`}
                />
                Try again
              </Button>
            </div>
          ) : (
            <ExpertiseTable
              expertise={filteredExpertise}
              loading={expertiseQuery.isLoading || expertiseQuery.isFetching}
              onDelete={setDeleteTarget}
            />
          )}
        </CardContent>
      </Card>

      <ExpertiseFormDialog
        open={formOpen}
        isSaving={createState.isLoading}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this area of focus?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleteTarget?.name}” will be permanently removed. This may affect
              users or therapists currently associated with it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteState.isLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={deleteState.isLoading}
              onClick={handleDelete}
            >
              {deleteState.isLoading ? "Deleting..." : "Delete Area of Focus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

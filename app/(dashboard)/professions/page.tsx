"use client"

import {
  Profession,
  ProfessionInput,
  useCreateProfessionMutation,
  useDeleteProfessionMutation,
  useGetProfessionsQuery,
  useUpdateProfessionMutation,
} from "@/app/redux-query/services/professionApis"
import { PageHeader } from "@/components/dashboard/page-header"
import { ProfessionFormDialog } from "@/components/dashboard/professions/profession-form-dialog"
import { ProfessionsTable } from "@/components/dashboard/professions/professions-table"
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
import { Card, CardContent } from "@/components/ui/card"
import { Plus, RefreshCw } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error !== "object" || error === null) return fallback
  const apiError = error as { data?: { message?: string }; message?: string }
  return apiError.data?.message || apiError.message || fallback
}

export default function ProfessionsPage() {
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Profession | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Profession | null>(null)
  const limit = 999

  const professionsQuery = useGetProfessionsQuery({ page, limit })
  const [createProfession, createState] = useCreateProfessionMutation()
  const [updateProfession, updateState] = useUpdateProfessionMutation()
  const [deleteProfession, deleteState] = useDeleteProfessionMutation()
  const isSaving = createState.isLoading || updateState.isLoading

  function openCreateDialog() {
    setEditTarget(null)
    setFormOpen(true)
  }

  function openEditDialog(profession: Profession) {
    setEditTarget(profession)
    setFormOpen(true)
  }

  async function handleSave(input: ProfessionInput) {
    try {
      const response = editTarget
        ? await updateProfession({ id: editTarget._id, data: input }).unwrap()
        : await createProfession(input).unwrap()

      toast.success(response.message || `Profession ${editTarget ? "updated" : "created"} successfully`)
      setFormOpen(false)
      setEditTarget(null)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to save profession"))
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return

    try {
      const response = await deleteProfession(deleteTarget._id).unwrap()
      toast.success(response.message || "Profession deleted successfully")
      setDeleteTarget(null)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to delete profession"))
    }
  }

  const responseData = professionsQuery.data?.data

  return (
    <>
      <PageHeader title="Professions" description="Manage professions used to organize governing bodies.">
        <Button className="bg-[#00ACA7] text-white" onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Profession
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="p-5">
          {professionsQuery.isError ? (
            <div className="flex flex-col items-center rounded-lg border border-destructive/30 bg-destructive/5 p-10">
              <p className="text-sm text-destructive">Unable to load professions.</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => professionsQuery.refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try again
              </Button>
            </div>
          ) : (
            <ProfessionsTable
              professions={responseData?.result ?? []}
              loading={professionsQuery.isLoading || professionsQuery.isFetching}
              meta={{
                total: responseData?.meta.total ?? 0,
                page: responseData?.meta.page ?? page,
                limit: responseData?.meta.limit ?? limit,
              }}
              onPageChange={setPage}
              onEdit={openEditDialog}
              onDelete={setDeleteTarget}
            />
          )}
        </CardContent>
      </Card>

      <ProfessionFormDialog
        key={editTarget?._id ?? "create"}
        open={formOpen}
        profession={editTarget}
        isSaving={isSaving}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditTarget(null)
        }}
        onSubmit={handleSave}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this profession?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleteTarget?.name}” will be permanently deleted. Governing bodies may depend on it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteState.isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={deleteState.isLoading}
              onClick={handleDelete}
            >
              {deleteState.isLoading ? "Deleting..." : "Delete profession"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

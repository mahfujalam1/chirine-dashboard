"use client"

import {
  GoverningBody,
  GoverningBodyInput,
  useCreateGoverningBodyMutation,
  useDeleteGoverningBodyMutation,
  useGetGoverningBodiesByProfessionQuery,
  useUpdateGoverningBodyMutation,
} from "@/lib/redux/services/governingBodyApis"
import { useGetProfessionsQuery } from "@/lib/redux/services/professionApis"
import { GoverningBodiesTable } from "@/components/dashboard/governing-bodies/governing-bodies-table"
import { GoverningBodyFormDialog } from "@/components/dashboard/governing-bodies/governing-body-form-dialog"
import { PageHeader } from "@/components/dashboard/page-header"
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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, RefreshCw } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error !== "object" || error === null) return fallback
  const apiError = error as { data?: { message?: string }; message?: string }
  return apiError.data?.message || apiError.message || fallback
}

export default function GoverningBodiesClientView() {
  const [professionId, setProfessionId] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<GoverningBody | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<GoverningBody | null>(null)

  const professionsQuery = useGetProfessionsQuery({ page: 1, limit: 100 })
  const professions = useMemo(
    () => professionsQuery.data?.data.result ?? [],
    [professionsQuery.data],
  )

  useEffect(() => {
    if (professionsQuery.isLoading) return

    setProfessionId((currentId) => {
      if (!professions.length) return ""
      const currentProfessionExists = professions.some((profession) => profession._id === currentId)
      return currentProfessionExists ? currentId : professions[0]._id
    })
  }, [professions, professionsQuery.isLoading])

  const governingBodiesQuery = useGetGoverningBodiesByProfessionQuery(professionId, {
    skip: !professionId,
  })
  const [createGoverningBody, createState] = useCreateGoverningBodyMutation()
  const [updateGoverningBody, updateState] = useUpdateGoverningBodyMutation()
  const [deleteGoverningBody, deleteState] = useDeleteGoverningBodyMutation()
  const isSaving = createState.isLoading || updateState.isLoading

  function openCreateDialog() {
    setEditTarget(null)
    setFormOpen(true)
  }

  function openEditDialog(governingBody: GoverningBody) {
    setEditTarget(governingBody)
    setFormOpen(true)
  }

  async function handleSave(input: GoverningBodyInput) {
    try {
      const response = editTarget
        ? await updateGoverningBody({ id: editTarget._id, data: input }).unwrap()
        : await createGoverningBody(input).unwrap()

      toast.success(response.message || `Governing body ${editTarget ? "updated" : "created"} successfully`)
      setProfessionId(input.parentId)
      setFormOpen(false)
      setEditTarget(null)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to save governing body"))
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return

    try {
      const response = await deleteGoverningBody(deleteTarget._id).unwrap()
      toast.success(response.message || "Governing body deleted successfully")
      setDeleteTarget(null)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to delete governing body"))
    }
  }

  const hasError = professionsQuery.isError || governingBodiesQuery.isError
  const isLoading = professionsQuery.isLoading
    || governingBodiesQuery.isLoading
    || governingBodiesQuery.isFetching

  return (
    <>
      <PageHeader
        title="Governing Bodies"
        description="Manage professional governing bodies and their professions."
      >
        <Button
          className="bg-[#00ACA7] text-white"
          disabled={!professions.length}
          onClick={openCreateDialog}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Governing Body
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="p-5">
          <div className="mb-5 max-w-sm space-y-2">
            <Label>Filter by Profession</Label>
            <Select
              value={professionId}
              onValueChange={setProfessionId}
              disabled={professionsQuery.isLoading || !professions.length}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select profession" />
              </SelectTrigger>
              <SelectContent>
                {professions.map((profession) => (
                  <SelectItem key={profession._id} value={profession._id}>
                    {profession.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!professionsQuery.isLoading && !professions.length && (
              <p className="text-xs text-muted-foreground">
                Create a profession before adding governing bodies.
              </p>
            )}
          </div>

          {hasError ? (
            <div className="flex flex-col items-center rounded-lg border border-destructive/30 bg-destructive/5 p-10">
              <p className="text-sm text-destructive">Unable to load governing bodies.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => {
                  professionsQuery.refetch()
                  if (professionId) governingBodiesQuery.refetch()
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try again
              </Button>
            </div>
          ) : (
            <GoverningBodiesTable
              governingBodies={governingBodiesQuery.data?.data ?? []}
              loading={isLoading}
              onEdit={openEditDialog}
              onDelete={setDeleteTarget}
            />
          )}
        </CardContent>
      </Card>

      <GoverningBodyFormDialog
        key={editTarget?._id ?? `create-${professionId}`}
        open={formOpen}
        governingBody={editTarget}
        professions={professions}
        defaultProfessionId={professionId}
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
            <AlertDialogTitle>Delete this governing body?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleteTarget?.name}” will be permanently deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteState.isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={deleteState.isLoading}
              onClick={handleDelete}
            >
              {deleteState.isLoading ? "Deleting..." : "Delete governing body"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

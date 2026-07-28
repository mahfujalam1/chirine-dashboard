import { GoverningBody } from "@/app/redux-query/services/governingBodyApis"
import { Button } from "@/components/ui/button"
import { ColumnDef, DataTable } from "@/components/ui/DataTable"
import { Pencil, Trash2 } from "lucide-react"

interface GoverningBodiesTableProps {
  governingBodies: GoverningBody[]
  loading: boolean
  onEdit: (governingBody: GoverningBody) => void
  onDelete: (governingBody: GoverningBody) => void
}

export function GoverningBodiesTable({
  governingBodies,
  loading,
  onEdit,
  onDelete,
}: GoverningBodiesTableProps) {
  const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" })

  const columns: ColumnDef<GoverningBody>[] = [
    { title: "Governing Body", key: "name" },
    { title: "Profession", renderItem: (item) => item.profession.name },
    { title: "Created", renderItem: (item) => dateFormatter.format(new Date(item.createdAt)) },
    { title: "Updated", renderItem: (item) => dateFormatter.format(new Date(item.updatedAt)) },
    {
      title: "Actions",
      align: "right",
      renderItem: (item) => (
        <div className="flex justify-end gap-1">
          <Button size="icon" variant="ghost" title="Edit governing body" onClick={() => onEdit(item)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            title="Delete governing body"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(item)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <DataTable
      data={governingBodies}
      columns={columns}
      rowKey={(item) => item._id}
      loading={loading}
      emptyText="No governing bodies found for this profession."
      meta={{ total: governingBodies.length, page: 1, limit: 10 }}
    />
  )
}

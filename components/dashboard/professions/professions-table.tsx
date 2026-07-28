import { Profession } from "@/app/redux-query/services/professionApis"
import { Button } from "@/components/ui/button"
import { ColumnDef, DataTable } from "@/components/ui/DataTable"
import { Pencil, Trash2 } from "lucide-react"

interface ProfessionsTableProps {
  professions: Profession[]
  loading: boolean
  meta: { total: number; page: number; limit: number }
  onPageChange: (page: number) => void
  onEdit: (profession: Profession) => void
  onDelete: (profession: Profession) => void
}

export function ProfessionsTable({
  professions,
  loading,
  meta,
  onPageChange,
  onEdit,
  onDelete,
}: ProfessionsTableProps) {
  const columns: ColumnDef<Profession>[] = [
    {
      title: "Icon",
      renderItem: (profession) => profession.icon ? (
        <img src={profession.icon} alt="" className="h-10 w-10 rounded-lg border bg-muted object-cover" />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-sm font-semibold">
          {profession.name.charAt(0).toUpperCase()}
        </div>
      ),
    },
    { title: "Profession", key: "name" },
    {
      title: "Created",
      renderItem: (profession) => new Intl.DateTimeFormat("en", { dateStyle: "medium" })
        .format(new Date(profession.createdAt)),
    },
    {
      title: "Actions",
      align: "right",
      renderItem: (profession) => (
        <div className="flex justify-end gap-1">
          <Button size="icon" variant="ghost" title="Edit profession" onClick={() => onEdit(profession)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            title="Delete profession"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(profession)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <DataTable
      data={professions}
      columns={columns}
      rowKey={(profession) => profession._id}
      loading={loading}
      emptyText="No professions found."
      meta={meta}
      onPageChange={onPageChange}
    />
  )
}

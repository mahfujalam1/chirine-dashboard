import { Expertise } from "@/lib/redux/services/expertiseApis";
import { Button } from "@/components/ui/button";
import { ColumnDef, DataTable } from "@/components/ui/DataTable";
import { Edit2, Trash2 } from "lucide-react";

interface ExpertiseTableProps {
  expertise: Expertise[];
  loading: boolean;
  onDelete: (expertise: Expertise) => void;
  onUpdate: (expertise: Expertise) => void;
}

export function ExpertiseTable({
  expertise,
  loading,
  onDelete,
  onUpdate
}: ExpertiseTableProps) {
  const columns: ColumnDef<Expertise>[] = [
    {
      title: "Icon",
      renderItem: (item) => (
        <img
          src={item.icon}
          alt=""
          className="h-11 w-11 rounded-lg border bg-muted object-cover"
        />
      ),
    },
    {
      title: "Area of Focus",
      key: "name",
      renderItem: (item) => (
        <div>
          <p className="font-medium text-foreground">{item.name}</p>
          <p className="text-xs text-muted-foreground">Expertise option</p>
        </div>
      ),
    },
    {
      title: "Actions",
      align: "right",
      renderItem: (item) => (
        <>
          <Button
            size="icon"
            variant="ghost"
            title="Edit area of focus"
            aria-label={`Edit ${item.name}`}
            className="text-[#10C091] hover:text-[#10C091]"
            onClick={() => onUpdate(item)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            title="Delete area of focus"
            aria-label={`Delete ${item.name}`}
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(item)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      ),
    },
  ];

  return (
    <DataTable
      data={expertise}
      columns={columns}
      rowKey={(item) => item._id}
      loading={loading}
      emptyText="No areas of focus found."
      meta={{ total: expertise.length, page: 1, limit: 10 }}
    />
  );
}

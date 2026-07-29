import { ReportUser } from "@/lib/redux/services/reportApis"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function ReportUserCell({ user }: { user: ReportUser }) {
  const initials = user.fullName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()
  return <div className="flex min-w-44 items-center gap-2.5">
    <Avatar className="h-8 w-8"><AvatarImage src={user.profileImage ?? undefined} /><AvatarFallback className="text-xs">{initials}</AvatarFallback></Avatar>
    <div className="min-w-0"><p className="truncate text-sm font-medium">{user.fullName}</p><p className="truncate text-xs text-muted-foreground">{user.email}</p></div>
  </div>
}

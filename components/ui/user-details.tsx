import { Avatar, AvatarFallback } from './avatar'

interface UserDetailsProps {
    name: string
    email: string
}

const UserDetails = ({ name, email }: UserDetailsProps) => {
    return (
        <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
                <AvatarFallback>{name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
            </Avatar>
            <div>
                <p className="text-sm font-medium">{name}</p>
                <p className="text-xs text-muted-foreground">{email}</p>
            </div>
        </div>
    )
}

export default UserDetails
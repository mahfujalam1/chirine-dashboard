import { Avatar, AvatarFallback, AvatarImage } from './avatar'

interface UserDetailsProps {
    name: string
    email: string
    image?: string | null
}

const getInitials = (name: string) =>
    name
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "?"

const UserDetails = ({ name, email, image }: UserDetailsProps) => {
    return (
        <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-9 w-9 shrink-0">
                {image && <AvatarImage src={image} alt={name} />}
                <AvatarFallback>{getInitials(name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
                <p className="text-sm font-medium truncate">{name || "Unnamed"}</p>
                <p className="text-xs text-muted-foreground truncate">{email}</p>
            </div>
        </div>
    )
}

export default UserDetails

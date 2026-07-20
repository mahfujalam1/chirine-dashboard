"use client"

import { useGetMyProfileQuery } from '@/app/redux-query/services/profileApis'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import Image from 'next/image'
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Therapists", href: "/therapists" },
  { label: "Events", href: "/events" },
  { label: "Requests", href: "/events-requests" },
  { label: "Reports", href: "/reports" },
  { label: "Chat Management", href: "/chat-management" },
  { label: "Chat Assets", href: "/chat-assets" },
]

export function Header() {
  const pathname = usePathname()
  const { data, isLoading } = useGetMyProfileQuery()
  const profile = data?.data
  const router = useRouter()

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <header className="flex items-center justify-between mb-8">
      <Link href="/" className="flex items-center gap-2">
        <Image src={"/brand.svg"} width={40} height={30} alt='MindShift Peer Connect' />
      </Link>

      <nav className="hidden md:flex items-center bg-card rounded-full px-2 py-1.5 border border-border">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${isActive(item.href)
              ? "bg-[#00ACA7] text-white"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {
        isLoading ? (
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 cursor-pointer">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={"https://static.vecteezy.com/system/resources/previews/042/332/098/non_2x/default-avatar-profile-icon-grey-photo-placeholder-female-no-photo-images-for-unfilled-user-profile-greyscale-illustration-for-socail-media-web-vector.jpg"} />
                    <AvatarFallback>----</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
            </DropdownMenu>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium">...</p>
              <p className="text-xs text-muted-foreground">...</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 cursor-pointer">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={profile?.profileImage || "https://static.vecteezy.com/system/resources/previews/042/332/098/non_2x/default-avatar-profile-icon-grey-photo-placeholder-female-no-photo-images-for-unfilled-user-profile-greyscale-illustration-for-socail-media-web-vector.jpg"} />
                    <AvatarFallback>{profile?.fullName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium">{profile?.fullName}</p>
                    <p className="text-xs text-muted-foreground">Admin</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="text-destructive">
                  <h1 onClick={() => {
                    localStorage.removeItem("accessToken")
                    localStorage.removeItem("refreshToken")
                    localStorage.removeItem("user")
                    router.push("/login")
                  }}>Log out</h1>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      }
    </header>
  )
}

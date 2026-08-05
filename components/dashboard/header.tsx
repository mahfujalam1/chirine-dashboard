"use client";

import {
  Briefcase,
  Building2,
  Calendar,
  ChevronDown,
  FileText,
  FolderKanban,
  GitPullRequest,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Settings,
  Target,
  User,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { removeAuthToken } from "@/lib/actions/auth";
import { useGetMyProfileQuery } from "@/lib/redux/services/profileApis";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Therapists", href: "/therapists", icon: Users },
  { label: "Professions", href: "/professions", icon: Briefcase },
  { label: "Governing Bodies", href: "/governing-bodies", icon: Building2 },
  { label: "Area Of Focus", href: "/area-of-focus", icon: Target },
  { label: "Events", href: "/events", icon: Calendar },
  { label: "Requests", href: "/events-requests", icon: GitPullRequest },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Support", href: "/support", icon: HelpCircle },
  { label: "Chat Management", href: "/chat-management", icon: MessageSquare },
  { label: "Chat Assets", href: "/chat-assets", icon: FolderKanban },
];

const fallbackAvatar =
  "https://static.vecteezy.com/system/resources/previews/042/332/098/non_2x/default-avatar-profile-icon-grey-photo-placeholder-female-no-photo-images-for-unfilled-user-profile-greyscale-illustration-for-socail-media-web-vector.jpg";

function HeaderInner() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { data, isLoading } = useGetMyProfileQuery();
  const profile = data?.data;

  // Split nav items: 6 main items on header, remaining in 3-dots dropdown
  const primaryNavItems = React.useMemo(() => navItems.slice(0, 6), []);
  const overflowNavItems = React.useMemo(() => navItems.slice(6), []);

  // Close mobile drawer on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = React.useCallback(
    (href: string) => {
      if (href === "/") return pathname === "/";
      return pathname === href || pathname.startsWith(`${href}/`);
    },
    [pathname],
  );

  const isOverflowActive = React.useMemo(
    () => overflowNavItems.some((item) => isActive(item.href)),
    [overflowNavItems, isActive],
  );

  const handleLogout = React.useCallback(async () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    await removeAuthToken();
    router.push("/login");
  }, [router]);

  return (
    <header className="flex items-center justify-between mb-6 md:mb-8">
      {/* Brand Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 transition-transform hover:scale-[1.02] focus-visible:outline-none"
      >
        <Image
          src="/brand.svg"
          width={40}
          height={30}
          alt="MindShift Peer Connect"
          priority
          className="h-8 w-auto md:h-10"
        />
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center bg-card rounded-full px-2 py-1.5 border border-border shadow-xs gap-1">
        {primaryNavItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${active
                  ? "bg-[#00ACA7] text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
            >
              {item.label}
            </Link>
          );
        })}

        {/* 3-Dots Dropdown for Overflow Nav Items */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors flex items-center justify-center cursor-pointer outline-none ${isOverflowActive
                  ? "bg-[#00ACA7] text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              aria-label="More navigation options"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {overflowNavItems.map((item) => {
              const active = isActive(item.href);
              const IconComponent = item.icon;
              return (
                <DropdownMenuItem key={item.href} asChild className="cursor-pointer">
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2.5 w-full ${active ? "font-semibold text-[#00ACA7]" : ""
                      }`}
                  >
                    <IconComponent
                      className={`w-4 h-4 ${active ? "text-[#00ACA7]" : "text-muted-foreground"
                        }`}
                    />
                    <span>{item.label}</span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>

      {/* Right Controls & Profile */}
      <div className="flex items-center gap-2">
        {/* User Profile Dropdown */}
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
            <div className="hidden sm:block text-left space-y-1">
              <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              <div className="h-2.5 w-10 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-2 p-1 rounded-full hover:bg-muted/60 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="User menu"
              >
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarImage
                    src={profile?.profileImage || fallbackAvatar}
                    alt={profile?.fullName || "User Avatar"}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                    {profile?.fullName?.charAt(0)?.toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left pr-1">
                  <p className="text-sm font-medium leading-none text-foreground">
                    {profile?.fullName || "Admin User"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Admin</p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <div className="px-2 py-1.5 sm:hidden border-b mb-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {profile?.fullName || "Admin User"}
                </p>
                <p className="text-xs text-muted-foreground">Admin</p>
              </div>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/profile" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                <Link href="/settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <span>Setting</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive cursor-pointer flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Mobile & Tablet Drawer Trigger (< lg screens) */}
        <div className="lg:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border-border bg-card hover:bg-accent"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5 text-foreground" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[85vw] max-w-sm p-0 flex flex-col justify-between"
            >
              <div>
                {/* Mobile Drawer Header */}
                <SheetHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
                  <Link
                    href="/"
                    className="flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Image
                      src="/brand.svg"
                      width={36}
                      height={27}
                      alt="MindShift Peer Connect"
                      className="h-7 w-auto"
                    />
                    <SheetTitle className="text-base font-bold text-foreground">
                      MindShift Admin
                    </SheetTitle>
                  </Link>
                </SheetHeader>

                {/* Profile Card Header in Mobile Menu */}
                {profile && (
                  <div className="p-4 bg-muted/40 border-b border-border flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border shrink-0">
                      <AvatarImage
                        src={profile?.profileImage || fallbackAvatar}
                        alt={profile?.fullName}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {profile?.fullName?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {profile?.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Admin Account
                      </p>
                    </div>
                  </div>
                )}

                {/* Mobile Scrollable Navigation Links */}
                <div className="p-3 space-y-1 max-h-[calc(100vh-220px)] overflow-y-auto">
                  {navItems.map((item) => {
                    const active = isActive(item.href);
                    const IconComponent = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${active
                            ? "bg-[#00ACA7] text-white shadow-xs"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                          }`}
                      >
                        <IconComponent
                          className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-muted-foreground"}`}
                        />
                        <span className="flex-1 truncate">{item.label}</span>
                        {active && (
                          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Drawer Footer Actions */}
              <div className="p-4 border-t border-border bg-card space-y-2">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Profile Settings</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export const Header = React.memo(HeaderInner);

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  PenLine,
  Link2,
  CreditCard,
  Headphones,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import ThemeToggle from "./theme-toggle";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Create Post", href: "/create-post", icon: PenLine },
  { name: "Calendar", href: "/calendar", icon: CalendarDays },
  { name: "Connected Accounts", href: "/connected-accounts", icon: Link2 },
  { name: "Billing", href: "/billing", icon: CreditCard },
];

type ProtectedSidebarProps = {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
};

export default function ProtectedSidebar({
  isCollapsed = false,
  onToggleCollapse,
}: ProtectedSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const handleLogout = async () => {
    await fetch("/api/auth/sign-out", {
      method: "POST",
      credentials: "include",
    });
    router.push("/login");
    router.refresh();
  };

  const renderSidebarContent = (mobile = false) => {
    const collapsed = !mobile && isCollapsed;

    return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className={["flex h-20 items-center px-5", collapsed ? "justify-center" : "gap-3"].join(" ")}>
        <Link href="/dashboard" className={["flex items-center gap-3", collapsed ? "justify-center" : ""].join(" ")}>
          <Image
            src="/amplypost-logo.png"
            alt="Amplypost"
            width={28}
            height={28}
            className="h-7 w-7"
          />
          {!collapsed && (
            <div>
              <p className="text-lg font-bold leading-none">Amplypost</p>
            </div>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className={["flex-1 space-y-1", collapsed ? "px-3" : "px-4"].join(" ")}>
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => mobile && setIsMobileMenuOpen(false)}
              title={collapsed ? item.name : undefined}
              className={[
                "group flex h-12 items-center rounded-2xl text-sm font-medium transition-all",
                collapsed ? "justify-center px-0" : "gap-3 px-4",
                active
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              ].join(" ")}
            >
              <Icon
                className="h-5 w-5 transition"
              />
              {!collapsed && item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className={["flex flex-col gap-2 border-t border-sidebar-border", collapsed ? "items-center p-3" : "p-4"].join(" ")}>
        <Link
          href="/support"
          onClick={() => mobile && setIsMobileMenuOpen(false)}
          title={collapsed ? "Help & Support" : undefined}
          className={[
            "flex items-center rounded-2xl py-3 text-sm font-medium text-muted-foreground transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed ? "h-12 w-12 justify-center px-0" : "gap-3 px-4",
          ].join(" ")}
        >
          <Headphones className="h-5 w-5" />
          {!collapsed && "Help & Support"}
        </Link>

        <div className={collapsed ? "flex h-12 w-12 items-center justify-center" : ""}>
          <ThemeToggle showLabel={!collapsed} />
        </div>

        <button
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className={[
            "flex items-center rounded-2xl py-3 text-sm font-medium text-muted-foreground transition hover:bg-red-500/10 hover:text-red-500",
            collapsed ? "h-12 w-12 justify-center px-0" : "w-full gap-3 px-4",
          ].join(" ")}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && "Logout"}
        </button>
      </div>
    </div>
    );
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 flex h-16 items-center border-b border-border bg-background px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="rounded-xl p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <Menu className="h-6 w-6" />
        </button>

        <Link href="/dashboard" className="ml-3 flex items-center gap-2">
          <Image
            src="/amplypost-logo.png"
            alt="Amplypost"
            width={30}
            height={30}
            className="h-8 w-8"
          />
          <span className="text-lg font-bold text-foreground">Amplypost</span>
        </Link>

        <div className="ml-auto min-w-32">
          <ThemeToggle />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className={["fixed inset-y-0 left-0 z-40 hidden border-r border-sidebar-border bg-sidebar transition-[width] duration-200 lg:block", isCollapsed ? "w-20" : "w-72"].join(" ")}>
        {renderSidebarContent()}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="absolute -right-4 top-6 z-50 flex h-8 w-8 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-muted-foreground shadow-sm transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </aside>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative h-full w-80 max-w-[85%] border-r border-sidebar-border">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute right-4 top-4 z-10 rounded-xl p-2 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            {renderSidebarContent(true)}
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Images,
  Upload,
  FolderSync,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/review", label: "Review Queue", icon: CheckSquare },
  { href: "/assets", label: "Asset Library", icon: Images },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/dropbox", label: "Dropbox Sync", icon: FolderSync },
  { href: "/metrics", label: "Metrics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm">
          FRE
        </div>
        <div>
          <h1 className="text-sm font-semibold">Asset Tagger</h1>
          <p className="text-xs text-muted-foreground">Brand Asset Engine</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="rounded-md bg-muted p-3">
          <p className="text-xs font-medium">Operating Mode</p>
          <p className="text-xs text-muted-foreground">Mode 1: Calibration</p>
          <p className="text-xs text-muted-foreground mt-1">100% review</p>
        </div>
      </div>
    </aside>
  );
}

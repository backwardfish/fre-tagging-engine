"use client";

import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/review": "Review Queue",
  "/assets": "Asset Library",
  "/upload": "Upload Assets",
  "/dropbox": "Dropbox Sync",
  "/metrics": "Metrics & Analytics",
  "/settings": "Settings",
};

export function Header() {
  const pathname = usePathname();
  const title =
    pageTitles[pathname] ||
    Object.entries(pageTitles).find(([key]) =>
      pathname.startsWith(key) && key !== "/"
    )?.[1] ||
    "FRE Asset Tagger";

  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="text-xs">
          Calibration Mode
        </Badge>
      </div>
    </header>
  );
}

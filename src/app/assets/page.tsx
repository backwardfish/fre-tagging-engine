"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfidenceBadge } from "@/components/review/confidence-badge";
import { TagGroup } from "@/components/review/tag-chips";
import { Skeleton } from "@/components/ui/skeleton";
import { REVIEW_STATUS_OPTIONS } from "@/lib/constants";
import type { SelectAsset } from "@/db/schema";
import { Search, FileImage, FileVideo, FileText, File } from "lucide-react";
import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS, DOCUMENT_EXTENSIONS } from "@/lib/constants";

function getFileIcon(format: string) {
  const ext = format.replace(".", "").toLowerCase();
  if ((IMAGE_EXTENSIONS as readonly string[]).includes(ext)) return FileImage;
  if ((VIDEO_EXTENSIONS as readonly string[]).includes(ext)) return FileVideo;
  if ((DOCUMENT_EXTENSIONS as readonly string[]).includes(ext)) return FileText;
  return File;
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<SelectAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "24",
        sortBy: "dateIndexed",
        sortOrder: "desc",
      });
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/assets?${params}`);
      const data = await res.json();
      setAssets(data.assets || []);
      setTotalPages(data.pagination?.totalPages ?? 0);
      setTotal(data.pagination?.total ?? 0);
    } catch {
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {REVIEW_STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="secondary">{total} total</Badge>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">
            No assets found. Upload some assets to get started.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assets.map((asset) => {
              const FileIcon = getFileIcon(asset.fileFormat);
              return (
                <Card key={asset.id} className="overflow-hidden">
                  <div className="flex h-32 items-center justify-center bg-muted">
                    {asset.thumbnailUrl ? (
                      <img
                        src={asset.thumbnailUrl}
                        alt={asset.fileName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FileIcon className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-medium truncate flex-1">
                        {asset.fileName}
                      </h3>
                      <ConfidenceBadge
                        score={asset.confidenceScore ?? 0}
                        className="ml-2"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge
                        variant={
                          asset.reviewStatus === "Approved" ||
                          asset.reviewStatus === "Auto-Approved"
                            ? "default"
                            : asset.reviewStatus === "Pending Review"
                              ? "secondary"
                              : asset.reviewStatus === "Rejected"
                                ? "destructive"
                                : "outline"
                        }
                        className="text-xs"
                      >
                        {asset.reviewStatus}
                      </Badge>
                      {asset.assetType && (
                        <Badge variant="outline" className="text-xs">
                          {asset.assetType}
                        </Badge>
                      )}
                    </div>
                    {asset.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {asset.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="flex items-center text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

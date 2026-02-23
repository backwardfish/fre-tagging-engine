"use client";

import { useEffect, useState, useCallback } from "react";
import { ReviewCard } from "@/components/review/review-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { SelectAsset } from "@/db/schema";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

export default function ReviewPage() {
  const [assets, setAssets] = useState<SelectAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/review?page=${page}&limit=20`);
      const data = await res.json();
      setAssets(data.assets || []);
      setTotal(data.pagination?.total ?? 0);
    } catch {
      toast.error("Failed to load review queue");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const handleAction = async (
    assetId: number,
    action: string,
    editedTags?: Record<string, unknown>,
    correctionNote?: string
  ) => {
    try {
      const res = await fetch(`/api/review/${assetId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, editedTags, correctionNote }),
      });

      if (!res.ok) throw new Error("Failed");

      toast.success(
        action === "approve"
          ? "Asset approved"
          : action === "edit"
            ? "Tags updated"
            : action === "reject"
              ? "Asset rejected"
              : "Skipped"
      );

      // Remove the reviewed asset from the list
      setAssets((prev) => prev.filter((a) => a.id !== assetId));
      setTotal((prev) => prev - 1);
    } catch {
      toast.error("Failed to process review");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Pending Review</h2>
          <Badge variant="secondary">{total} assets</Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchQueue}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground">
            No assets pending review. Upload some assets to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {assets.map((asset) => (
            <ReviewCard
              key={asset.id}
              asset={asset}
              onApprove={(id) => handleAction(id, "approve")}
              onEdit={(id, tags, note) => handleAction(id, "edit", tags, note)}
              onReject={(id) => handleAction(id, "reject")}
              onSkip={(id) => handleAction(id, "skip")}
            />
          ))}

          {total > 20 && (
            <div className="flex justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={assets.length < 20}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

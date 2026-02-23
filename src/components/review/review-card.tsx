"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfidenceBadge } from "./confidence-badge";
import { TagGroup } from "./tag-chips";
import { TagEditForm } from "./tag-edit-form";
import type { SelectAsset } from "@/db/schema";
import { Check, Pencil, X, SkipForward, FileImage, FileVideo, FileText, File } from "lucide-react";
import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS, DOCUMENT_EXTENSIONS } from "@/lib/constants";

interface ReviewCardProps {
  asset: SelectAsset;
  onApprove: (id: number) => void;
  onEdit: (id: number, tags: Record<string, unknown>, note: string) => void;
  onReject: (id: number) => void;
  onSkip: (id: number) => void;
}

function getFileIcon(format: string) {
  const ext = format.replace(".", "").toLowerCase();
  if ((IMAGE_EXTENSIONS as readonly string[]).includes(ext)) return FileImage;
  if ((VIDEO_EXTENSIONS as readonly string[]).includes(ext)) return FileVideo;
  if ((DOCUMENT_EXTENSIONS as readonly string[]).includes(ext)) return FileText;
  return File;
}

export function ReviewCard({
  asset,
  onApprove,
  onEdit,
  onReject,
  onSkip,
}: ReviewCardProps) {
  const [editing, setEditing] = useState(false);
  const FileIcon = getFileIcon(asset.fileFormat);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          {/* Thumbnail / Icon */}
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-md bg-muted">
            {asset.thumbnailUrl ? (
              <img
                src={asset.thumbnailUrl}
                alt={asset.fileName}
                className="h-full w-full rounded-md object-cover"
              />
            ) : (
              <FileIcon className="h-8 w-8 text-muted-foreground" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-medium truncate">
                  {asset.fileName}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {asset.dropboxPath || asset.fileFormat.toUpperCase()}
                  {asset.fileSizeKB
                    ? ` · ${(asset.fileSizeKB / 1024).toFixed(1)} MB`
                    : ""}
                  {asset.dimensions ? ` · ${asset.dimensions}` : ""}
                </p>
              </div>
              <ConfidenceBadge score={asset.confidenceScore ?? 0} />
            </div>

            {editing ? (
              <TagEditForm
                asset={asset}
                onSubmit={(tags, note) => {
                  onEdit(asset.id, tags, note);
                  setEditing(false);
                }}
                onCancel={() => setEditing(false)}
              />
            ) : (
              <>
                <TagGroup asset={asset} />
                {asset.description && (
                  <p className="text-xs italic text-muted-foreground">
                    {asset.description}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="default"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => onApprove(asset.id)}
                  >
                    <Check className="mr-1 h-3 w-3" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditing(true)}
                  >
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit Tags
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onReject(asset.id)}
                  >
                    <X className="mr-1 h-3 w-3" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onSkip(asset.id)}
                  >
                    <SkipForward className="mr-1 h-3 w-3" />
                    Skip
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

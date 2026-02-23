"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ConfidenceBadge } from "@/components/review/confidence-badge";
import { TagGroup } from "@/components/review/tag-chips";
import { toast } from "sonner";
import { Upload, FileUp, CheckCircle, Loader2 } from "lucide-react";
import type { SelectAsset } from "@/db/schema";

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<SelectAsset[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (newFiles: FileList | File[]) => {
    setFiles(Array.from(newFiles));
    setResults([]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setProgress(10);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      setProgress(30);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      setProgress(80);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      const data = await res.json();
      setProgress(100);
      setResults(data.assets || []);
      setFiles([]);
      toast.success(`${data.count} asset(s) uploaded and tagged`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Upload failed"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload Brand Assets</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Drop Zone */}
          <div
            className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
              dragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input
              id="file-input"
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleFiles(e.target.files);
              }}
              accept="image/*,.pdf,.psd,.ai,.pptx,.docx,.xlsx,.mp4,.mov"
            />
            <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium">
              Drag and drop files here, or click to browse
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Images, videos, documents, and design files supported
            </p>
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {files.length} file(s) selected
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFiles([])}
                >
                  Clear
                </Button>
              </div>
              <div className="space-y-1">
                {files.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded bg-muted px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <FileUp className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{file.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(0)} KB
                    </span>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading & Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload & Tag with AI
                  </>
                )}
              </Button>

              {uploading && <Progress value={progress} className="h-2" />}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Tagged Assets ({results.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.map((asset) => (
              <div
                key={asset.id}
                className="rounded-lg border p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">{asset.fileName}</h3>
                  <div className="flex items-center gap-2">
                    <ConfidenceBadge score={asset.confidenceScore ?? 0} />
                    <Badge variant="outline" className="text-xs">
                      {asset.reviewStatus}
                    </Badge>
                  </div>
                </div>
                <TagGroup asset={asset} />
                {asset.description && (
                  <p className="text-xs italic text-muted-foreground">
                    {asset.description}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

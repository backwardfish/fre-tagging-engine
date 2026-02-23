"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  FolderSync,
  Plus,
  Trash2,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface MonitoredFolder {
  id: number;
  dropboxPath: string;
  displayName: string;
  isActive: boolean;
  lastSyncAt: string | null;
  totalFilesSynced: number;
}

export default function DropboxPage() {
  const [folders, setFolders] = useState<MonitoredFolder[]>([]);
  const [newPath, setNewPath] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [adding, setAdding] = useState(false);

  const fetchFolders = async () => {
    try {
      const res = await fetch("/api/dropbox/folders");
      const data = await res.json();
      setFolders(Array.isArray(data) ? data : []);
    } catch {
      setFolders([]);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  const addFolder = async () => {
    if (!newPath.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/dropbox/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dropboxPath: newPath.trim() }),
      });
      if (!res.ok) throw new Error();
      setNewPath("");
      toast.success("Folder added");
      fetchFolders();
    } catch {
      toast.error("Failed to add folder");
    } finally {
      setAdding(false);
    }
  };

  const removeFolder = async (id: number) => {
    try {
      const res = await fetch("/api/dropbox/folders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId: id }),
      });
      if (!res.ok) throw new Error();
      toast.success("Folder removed");
      fetchFolders();
    } catch {
      toast.error("Failed to remove folder");
    }
  };

  const syncNow = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/dropbox/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");
      toast.success(
        `Sync complete: ${data.newFilesFound} new files found, ${data.filesTagged} tagged`
      );
      fetchFolders();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Sync failed"
      );
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <FolderSync className="h-4 w-4" />
            Monitored Folders
          </CardTitle>
          <Button
            size="sm"
            onClick={syncNow}
            disabled={syncing || folders.length === 0}
          >
            {syncing ? (
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-3 w-3" />
            )}
            Sync All
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Folder */}
          <div className="flex gap-2">
            <Input
              placeholder="/FRE Brand Assets"
              value={newPath}
              onChange={(e) => setNewPath(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addFolder()}
            />
            <Button onClick={addFolder} disabled={adding || !newPath.trim()}>
              <Plus className="mr-1 h-3 w-3" />
              Add
            </Button>
          </div>

          {/* Folder List */}
          {folders.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <AlertCircle className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No folders configured. Add a Dropbox folder path to start
                monitoring.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Make sure your DROPBOX_ACCESS_TOKEN is set in environment
                variables.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{folder.displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {folder.dropboxPath}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {folder.totalFilesSynced || 0} files
                      </Badge>
                      {folder.lastSyncAt && (
                        <span className="text-xs text-muted-foreground">
                          Last sync:{" "}
                          {new Date(folder.lastSyncAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={folder.isActive} disabled />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFolder(folder.id)}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. Go to the Dropbox App Console and create a new app</p>
          <p>2. Generate an access token for your app</p>
          <p>
            3. Set the <code className="text-xs bg-muted px-1 rounded">DROPBOX_ACCESS_TOKEN</code>{" "}
            environment variable in your Netlify project settings
          </p>
          <p>
            4. Add the Dropbox folder paths you want to monitor (e.g.,{" "}
            <code className="text-xs bg-muted px-1 rounded">/FRE Brand Assets</code>)
          </p>
          <p>5. Click &quot;Sync All&quot; to scan and tag assets</p>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { OPERATING_MODES } from "@/lib/constants";
import { toast } from "sonner";
import { Save } from "lucide-react";

interface Settings {
  operatingMode: string;
  confidenceThresholdAuto: number;
  confidenceThresholdReview: number;
  correctionPatterns: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    operatingMode: "Calibration",
    confidenceThresholdAuto: 85,
    confidenceThresholdReview: 60,
    correctionPatterns: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operating_mode: settings.operatingMode,
          confidence_threshold_auto: settings.confidenceThresholdAuto.toString(),
          confidence_threshold_review:
            settings.confidenceThresholdReview.toString(),
          correction_patterns: settings.correctionPatterns,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Operating Mode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {OPERATING_MODES.map((mode) => (
            <div
              key={mode.value}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                settings.operatingMode === mode.value
                  ? "border-primary bg-primary/5"
                  : "hover:bg-muted"
              }`}
              onClick={() =>
                setSettings({ ...settings, operatingMode: mode.value })
              }
            >
              <div
                className={`h-4 w-4 rounded-full border-2 ${
                  settings.operatingMode === mode.value
                    ? "border-primary bg-primary"
                    : "border-muted-foreground"
                }`}
              />
              <div>
                <p className="text-sm font-medium">{mode.label}</p>
                <p className="text-xs text-muted-foreground">
                  {mode.description}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Confidence Thresholds</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Auto-Approve Threshold</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={settings.confidenceThresholdAuto}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    confidenceThresholdAuto: parseInt(e.target.value) || 0,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Assets above this score are auto-approved in Modes 2-3
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Low Confidence Threshold</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={settings.confidenceThresholdReview}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    confidenceThresholdReview: parseInt(e.target.value) || 0,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Below this score, assets are flagged as low confidence
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Badge className="bg-green-100 text-green-800 border-green-200">
              High: {settings.confidenceThresholdAuto}+
            </Badge>
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
              Medium: {settings.confidenceThresholdReview}-
              {settings.confidenceThresholdAuto - 1}
            </Badge>
            <Badge className="bg-red-100 text-red-800 border-red-200">
              Low: &lt;{settings.confidenceThresholdReview}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Correction Patterns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            These patterns are injected into the AI system prompt to improve
            tagging accuracy over time. Add patterns in plain English based on
            recurring corrections.
          </p>
          <Textarea
            rows={8}
            placeholder={`Example patterns:
- Files in /FRE Events & Partnerships/PBR/ should ALWAYS be tagged as Partnership + Event
- The word "sweet" in a file name refers to the FRE flavor "Sweet" ONLY if alongside other FRE indicators
- Files with dimensions 1080x1920 are almost always Social Assets (Instagram Stories)`}
            value={settings.correctionPatterns}
            onChange={(e) =>
              setSettings({ ...settings, correctionPatterns: e.target.value })
            }
          />
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving}>
        <Save className="mr-2 h-4 w-4" />
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}

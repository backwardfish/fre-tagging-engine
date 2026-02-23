"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  CheckCircle,
  Pencil,
  XCircle,
  Target,
} from "lucide-react";

interface Metrics {
  totalAssets: number;
  pendingReview: number;
  approved: number;
  corrected: number;
  accuracyRate: number;
  recentActivity: { id: number; fileName: string; action: string }[];
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    fetch("/api/metrics")
      .then((r) => r.json())
      .then(setMetrics)
      .catch(() =>
        setMetrics({
          totalAssets: 0,
          pendingReview: 0,
          approved: 0,
          corrected: 0,
          accuracyRate: 0,
          recentActivity: [],
        })
      );
  }, []);

  if (!metrics) return null;

  const reviewed = metrics.approved + metrics.corrected;
  const modeRecommendation =
    metrics.accuracyRate >= 90
      ? { label: "Ready for Mode 3 (Autonomous)", color: "text-green-600" }
      : metrics.accuracyRate >= 80
        ? {
            label: "Ready for Mode 2 (Confidence-Based)",
            color: "text-blue-600",
          }
        : metrics.accuracyRate >= 70
          ? { label: "Stay in Mode 1, improving", color: "text-yellow-600" }
          : { label: "Mode 1 - Needs calibration", color: "text-red-600" };

  return (
    <div className="space-y-6">
      {/* Accuracy Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4" />
            Accuracy Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">
                {metrics.accuracyRate.toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">
                Overall tagging accuracy
              </p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-medium ${modeRecommendation.color}`}>
                {modeRecommendation.label}
              </p>
              <p className="text-xs text-muted-foreground">
                Based on {reviewed} reviews
              </p>
            </div>
          </div>
          <Progress value={metrics.accuracyRate} className="h-3" />

          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-xl font-bold">{metrics.approved}</span>
              </div>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-yellow-600">
                <Pencil className="h-4 w-4" />
                <span className="text-xl font-bold">{metrics.corrected}</span>
              </div>
              <p className="text-xs text-muted-foreground">Corrected</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <XCircle className="h-4 w-4" />
                <span className="text-xl font-bold">
                  {metrics.totalAssets - metrics.approved - metrics.corrected - metrics.pendingReview}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mode Transition Criteria */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mode Transition Criteria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Mode 1 → Mode 2</p>
                <p className="text-xs text-muted-foreground">
                  Accuracy &gt; 80% over 100+ reviews, 2+ weeks
                </p>
              </div>
              <Badge
                variant={
                  metrics.accuracyRate >= 80 && reviewed >= 100
                    ? "default"
                    : "secondary"
                }
              >
                {metrics.accuracyRate >= 80 && reviewed >= 100
                  ? "Ready"
                  : `${reviewed}/100 reviews, ${metrics.accuracyRate.toFixed(0)}%/80%`}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Mode 2 → Mode 3</p>
                <p className="text-xs text-muted-foreground">
                  Accuracy &gt; 90% sustained over 30 days
                </p>
              </div>
              <Badge
                variant={metrics.accuracyRate >= 90 ? "default" : "secondary"}
              >
                {metrics.accuracyRate >= 90
                  ? "Eligible"
                  : `${metrics.accuracyRate.toFixed(0)}%/90%`}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Review Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Review Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.recentActivity.length > 0 ? (
            <div className="space-y-2">
              {metrics.recentActivity.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="truncate">{a.fileName}</span>
                  <Badge
                    variant={
                      a.action === "approve"
                        ? "default"
                        : a.action === "edit"
                          ? "outline"
                          : "destructive"
                    }
                    className="ml-2 text-xs"
                  >
                    {a.action}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

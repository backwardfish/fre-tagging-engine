"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Images,
  Clock,
  CheckCircle,
  TrendingUp,
  Upload,
  CheckSquare,
} from "lucide-react";

interface DashboardStats {
  totalAssets: number;
  pendingReview: number;
  approved: number;
  accuracyRate: number;
  recentActivity: {
    id: number;
    fileName: string;
    action: string;
    createdAt: string;
  }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/metrics")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {
        setStats({
          totalAssets: 0,
          pendingReview: 0,
          approved: 0,
          accuracyRate: 0,
          recentActivity: [],
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Assets",
      value: stats?.totalAssets ?? 0,
      icon: Images,
      color: "text-blue-600",
    },
    {
      title: "Pending Review",
      value: stats?.pendingReview ?? 0,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: "Approved",
      value: stats?.approved ?? 0,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Accuracy Rate",
      value: stats?.accuracyRate ? `${stats.accuracyRate.toFixed(1)}%` : "N/A",
      icon: TrendingUp,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/upload">
              <Button className="w-full justify-start gap-2" variant="outline">
                <Upload className="h-4 w-4" />
                Upload New Assets
              </Button>
            </Link>
            <Link href="/review" className="block mt-2">
              <Button className="w-full justify-start gap-2" variant="outline">
                <CheckSquare className="h-4 w-4" />
                Review Queue
                {(stats?.pendingReview ?? 0) > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {stats?.pendingReview}
                  </Badge>
                )}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {stats.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate font-medium">
                      {activity.fileName}
                    </span>
                    <Badge variant="outline" className="ml-2 shrink-0">
                      {activity.action}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No activity yet. Upload some assets to get started.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

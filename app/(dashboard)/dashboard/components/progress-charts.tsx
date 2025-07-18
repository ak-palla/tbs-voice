"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Clock,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

interface ProgressMetrics {
  overall_progress: number;
  completion_rate: number;
  setup_progress: number;
  strategic_progress: number;
  operational_progress: number;
  insights: string[];
}

interface ProgressChartsProps {
  metrics: ProgressMetrics;
}

export function ProgressCharts({ metrics }: ProgressChartsProps) {
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressVariant = (progress: number): "default" | "secondary" | "destructive" => {
    if (progress >= 80) return 'default';
    if (progress >= 60) return 'secondary';
    return 'destructive';
  };

  const progressItems = [
    {
      label: "Setup Progress",
      value: metrics.setup_progress,
      icon: Activity,
      color: "text-blue-500",
      description: "Initial configuration"
    },
    {
      label: "Strategic Progress", 
      value: metrics.strategic_progress,
      icon: Target,
      color: "text-green-500",
      description: "Long-term planning"
    },
    {
      label: "Operational Progress",
      value: metrics.operational_progress,
      icon: CheckCircle2,
      color: "text-orange-500", 
      description: "Day-to-day execution"
    },
    {
      label: "Completion Rate",
      value: metrics.completion_rate,
      icon: Clock,
      color: "text-purple-500",
      description: "Task completion"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Progress Ring */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Overall Business Health</CardTitle>
          <CardDescription>
            Combined score across all business areas
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            {/* This would ideally be a circular progress bar component */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getProgressColor(metrics.overall_progress)}`}>
                  {metrics.overall_progress}%
                </div>
                <div className="text-sm text-muted-foreground">Overall</div>
              </div>
            </div>
            {/* Simplified circular progress representation */}
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="2"
              />
              <path
                d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                fill="none"
                stroke={metrics.overall_progress >= 80 ? "#16a34a" : metrics.overall_progress >= 60 ? "#eab308" : "#dc2626"}
                strokeWidth="2"
                strokeDasharray={`${metrics.overall_progress}, 100`}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </CardContent>
      </Card>

      {/* Progress Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Breakdown</CardTitle>
          <CardDescription>
            Detailed view of each business area
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {progressItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${item.color}`} />
                    <div>
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={getProgressVariant(item.value)}>
                      {item.value}%
                    </Badge>
                  </div>
                </div>
                <Progress value={item.value} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Progress Trend Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Indicators</CardTitle>
          <CardDescription>
            Quick visual indicators of business health
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="font-medium text-green-700">Strong Areas</p>
              <p className="text-2xl font-bold text-green-600">
                {progressItems.filter(item => item.value >= 70).length}
              </p>
              <p className="text-xs text-green-600">out of {progressItems.length}</p>
            </div>

            <div className="text-center p-4 rounded-lg bg-red-50 border border-red-200">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="font-medium text-red-700">Needs Attention</p>
              <p className="text-2xl font-bold text-red-600">
                {progressItems.filter(item => item.value < 50).length}
              </p>
              <p className="text-xs text-red-600">areas below 50%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
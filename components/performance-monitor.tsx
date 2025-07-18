"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PerformanceMetrics {
  totalTime: string;
  processingTime?: string;
  cacheHits: number;
  timestamp: number;
}

interface PerformanceMonitorProps {
  show?: boolean;
  onToggle?: () => void;
}

export function PerformanceMonitor({ show = false, onToggle }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [averageTime, setAverageTime] = useState<number>(0);
  const [cacheHitRate, setCacheHitRate] = useState<number>(0);

  useEffect(() => {
    if (metrics.length > 0) {
      const times = metrics.map(m => parseFloat(m.totalTime));
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      setAverageTime(avg);

      const totalRequests = metrics.length;
      const totalCacheHits = metrics.reduce((sum, m) => sum + m.cacheHits, 0);
      setCacheHitRate((totalCacheHits / (totalRequests * 2)) * 100); // Assuming max 2 cache hits per request
    }
  }, [metrics]);

  const addMetric = (metric: Omit<PerformanceMetrics, 'timestamp'>) => {
    setMetrics(prev => [...prev.slice(-9), { ...metric, timestamp: Date.now() }]);
  };

  const clearMetrics = () => {
    setMetrics([]);
    setAverageTime(0);
    setCacheHitRate(0);
  };

  // Expose addMetric function globally for API calls to use
  useEffect(() => {
    (window as any).addPerformanceMetric = addMetric;
    return () => {
      delete (window as any).addPerformanceMetric;
    };
  }, []);

  if (!show) {
    return (
      <Button
        onClick={onToggle}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50"
      >
        📊 Performance
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 z-50 max-h-96 overflow-auto">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Performance Monitor</CardTitle>
          <div className="flex gap-2">
            <Button onClick={clearMetrics} variant="ghost" size="sm">
              Clear
            </Button>
            <Button onClick={onToggle} variant="ghost" size="sm">
              ✕
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-blue-50 rounded">
            <div className="font-semibold">Avg Response</div>
            <div className="text-blue-600">{averageTime.toFixed(0)}ms</div>
          </div>
          <div className="p-2 bg-green-50 rounded">
            <div className="font-semibold">Cache Hit Rate</div>
            <div className="text-green-600">{cacheHitRate.toFixed(0)}%</div>
          </div>
        </div>

        {/* Recent Metrics */}
        <div className="space-y-1">
          <div className="text-xs font-semibold">Recent Requests</div>
          {metrics.length === 0 ? (
            <div className="text-xs text-gray-500">No requests yet</div>
          ) : (
            metrics.slice(-5).map((metric, index) => {
              const time = parseFloat(metric.totalTime);
              const isSlow = time > 3000;
              const isFast = time < 1000;
              
              return (
                <div key={metric.timestamp} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={isSlow ? "destructive" : isFast ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {metric.totalTime}ms
                    </Badge>
                    {metric.cacheHits > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {metric.cacheHits} cache hits
                      </Badge>
                    )}
                  </div>
                  <div className="text-gray-500">
                    {new Date(metric.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Performance Tips */}
        {averageTime > 3000 && (
          <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <div className="font-semibold text-yellow-800">⚠️ Slow Response</div>
            <div className="text-yellow-700">Average response time is high. Consider optimizing queries.</div>
          </div>
        )}

        {cacheHitRate < 20 && metrics.length > 3 && (
          <div className="p-2 bg-orange-50 border border-orange-200 rounded text-xs">
            <div className="font-semibold text-orange-800">📊 Low Cache Efficiency</div>
            <div className="text-orange-700">Cache hit rate is low. Consider increasing cache TTL.</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/loading-spinner';
import { 
  Brain, 
  RefreshCw, 
  Lightbulb,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ExternalLink 
} from 'lucide-react';
import Link from 'next/link';

interface AIInsightsProps {
  className?: string;
}

interface InsightItem {
  insight: string;
  howTo: string;
  relevantPages: string[];
}

interface InsightData {
  type: string;
  insights: InsightItem[];
  context: string;
  timestamp: string;
}

export default function AIInsights({ className = '' }: AIInsightsProps) {
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInsights = async () => {
    try {
      setError(null);
      
      const response = await fetch('/api/ai-dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: 'en-GB' // Specify UK English for AI responses
        })
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch insights');
      }
      
      setInsights(data);
    } catch (err) {
      console.error('Error fetching AI insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to load insights');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInsights();
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const getInsightIcon = (index: number) => {
    const icons = [
      <TrendingUp className="h-10 w-10 bg-blue-100 text-blue-600 rounded p-2.5" />,
      <CheckCircle className="h-10 w-10 bg-green-100 text-green-600 rounded p-2.5" />,
      <AlertCircle className="h-10 w-10 bg-purple-100 text-purple-600 rounded p-2.5" />
    ];
    return icons[index % icons.length];
  };

  const getInsightBgColor = (index: number) => {
    const colors = [
      'bg-gray-50 border-gray-200',
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-blue-600" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Skeleton loading state */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-2 border rounded-lg">
              <div className="flex items-start gap-2">
                <div className="h-4 w-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-full"></div>
                  <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-blue-600" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600 mb-3">{error}</p>
            <Button 
              onClick={handleRefresh} 
              size="sm" 
              variant="outline"
              disabled={refreshing}
            >
              {refreshing ? (
                <>
                  <LoadingSpinner />
                  <span className="ml-2">Retrying...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights || !insights.insights || insights.insights.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-blue-600" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Brain className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-3">No insights available yet</p>
            <p className="text-xs text-gray-400">Complete more activities to generate insights</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-blue-600" />
            AI Insights
          </CardTitle>
          <Button 
            onClick={handleRefresh} 
            size="sm" 
            variant="ghost"
            disabled={refreshing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        {insights.context && (
          <p className="text-xs text-gray-500 mt-1">
            Based on your current business data
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {insights.insights.map((insightItem, index) => (
          <div 
            key={index} 
            className={`relative p-2 border rounded-lg ${getInsightBgColor(index)} transition-all hover:shadow-sm group`}
          >
                        <div className="flex items-start gap-2">
              <div className="flex-shrink-0 mt-0">
                {getInsightIcon(index)}
              </div>
              <p className="text-xs text-gray-700 leading-relaxed pr-6">
                  {insightItem.insight}
                </p>
                
                {/* Lightbulb icon in corner with hover tooltip */}
                <div className="absolute top-1 right-1 group/tooltip">
                                  <Lightbulb className="h-3 w-3 text-yellow-500 cursor-help hover:text-yellow-600 transition-colors" />
                
                {/* Tooltip on hover */}
                                  <div className="absolute right-0 top-5 w-80 p-3 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-50">
                  <div className="text-xs font-semibold text-gray-900 mb-2">How to implement this:</div>
                  <div className="text-xs text-gray-700 mb-3 leading-relaxed">
                    {insightItem.howTo}
                  </div>
                  
                  {/* Relevant page links */}
                  {insightItem.relevantPages && insightItem.relevantPages.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-gray-900">Quick Links:</div>
                      {insightItem.relevantPages.map((page, pageIndex) => (
                        <Link 
                          key={pageIndex}
                          href={page}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {page.replace('/', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Dashboard'}
                        </Link>
                      ))}
                    </div>
                  )}
                  
                  {/* Arrow pointing to lightbulb */}
                  <div className="absolute top-[-4px] right-4 w-2 h-2 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {insights.timestamp && (
          <div className="text-xs text-gray-400 text-center pt-2">
            Last updated: {new Date(insights.timestamp).toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
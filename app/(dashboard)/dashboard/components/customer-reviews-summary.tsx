"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { 
  Star, 
  MessageSquare, 
  RefreshCw, 
  AlertCircle,
  Brain,
  Sparkles,
  Settings,
  CheckCircle,
  TrendingUp,
  TrendingDown
} from "lucide-react";

interface GoogleReview {
  id: string;
  author_name: string;
  rating: number;
  text: string;
  time: string;
  relative_time_description: string;
}

interface ReviewsSummary {
  overall_rating: number;
  total_reviews: number;
  rating_distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  recent_reviews: GoogleReview[];
  ai_summary: string;
  sentiment_analysis: {
    positive_highlights: string[];
    areas_for_improvement: string[];
    key_themes: string[];
  };
  last_updated: string;
}

interface CustomerReviewsSummaryProps {
  businessName: string;
  googleReviewLink?: string | null;
}

export default function CustomerReviewsSummary({ businessName, googleReviewLink }: CustomerReviewsSummaryProps) {
  const [reviewsData, setReviewsData] = useState<ReviewsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const supabase = createClient();

  const fetchReviews = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

<<<<<<< HEAD
      // First, try to get cached reviews data
      const { data: cachedData, error: cacheError } = await supabase
        .from('reviews_cache')
        .select('*')
        .eq('business_name', businessName)
        .order('last_updated', { ascending: false })
        .limit(1);

      // Check if we have recent cached data (less than 24 hours old)
      const now = new Date();
      const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      
      if (cachedData && cachedData.length > 0 && !isRefresh) {
        const lastUpdated = new Date(cachedData[0].last_updated);
        if (now.getTime() - lastUpdated.getTime() < cacheExpiry) {
          setReviewsData(cachedData[0].summary_data);
          setLoading(false);
          setRefreshing(false);
          return;
        }
      }

      // If no cached data or expired, fetch new data
=======
      // If refreshing, skip cache and force fresh data
      if (!isRefresh) {
        // First, try to get cached reviews data
        const { data: cachedData, error: cacheError } = await supabase
          .from('reviews_cache')
          .select('*')
          .eq('business_name', businessName)
          .order('last_updated', { ascending: false })
          .limit(1);

        // Check if we have recent cached data (less than 24 hours old)
        const now = new Date();
        const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        
        if (cachedData && cachedData.length > 0) {
          const lastUpdated = new Date(cachedData[0].last_updated);
          if (now.getTime() - lastUpdated.getTime() < cacheExpiry) {
            setReviewsData(cachedData[0].summary_data);
            setLoading(false);
            return;
          }
        }
      }

      // Fetch fresh data from API (this will include AI analysis)
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
      const response = await fetch('/api/reviews/google-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName: businessName,
          googleReviewLink: googleReviewLink,
<<<<<<< HEAD
          forceRefresh: isRefresh
=======
          forceRefresh: true, // Always force refresh to get fresh data and AI analysis
          language: 'en-GB' // Specify UK English for AI responses
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();
      setReviewsData(data);

      // Cache the new data
<<<<<<< HEAD
=======
      const now = new Date();
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
      await supabase
        .from('reviews_cache')
        .upsert({
          business_name: businessName,
          summary_data: data,
          last_updated: now.toISOString()
        });

    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (businessName) {
      fetchReviews();
    }
  }, [businessName, googleReviewLink]);

  const handleRefresh = () => {
    fetchReviews(true);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 4.0) return "text-blue-600";
    if (rating >= 3.5) return "text-yellow-600";
    if (rating >= 3.0) return "text-orange-600";
    return "text-red-600";
  };

  // Function to convert AI summary to bullet points
  const formatAISummaryAsPoints = (summary: string) => {
    // Split by sentences and clean up
    const sentences = summary
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10); // Filter out very short fragments
    
    // Take first 3-4 meaningful sentences
    return sentences.slice(0, 4);
  };

  // Show setup prompt if no Google review link is provided
  if (!googleReviewLink) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 h-full">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Your Google Reviews</h3>
            <p className="text-sm text-gray-600 mb-4">
              Add your Google review link to get AI-powered insights and analysis of customer feedback.
            </p>
            <Link href="/profile">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Settings className="w-4 h-4 mr-2" />
                Add Review Link in Profile
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="bg-white border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
            <span className="ml-2 text-gray-600">Loading reviews...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-center py-8">
            <div>
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
              <p className="text-red-600 text-sm mb-3">{error}</p>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!reviewsData) {
    return (
      <Card className="bg-white border border-gray-200">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No reviews data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const aiSummaryPoints = formatAISummaryAsPoints(reviewsData.ai_summary);

  return (
<<<<<<< HEAD
    <Card className="bg-white border border-gray-200 h-full">
=======
    <Card className="bg-white border border-gray-200">
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Customer Reviews
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              AI-powered analysis • {reviewsData.total_reviews} reviews
            </CardDescription>
          </div>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Overall Rating */}
        <div className="">
          <div className="flex items-center justify-start gap-2 mb-2">
            <Star className="w-6 h-6 text-yellow-500 fill-current" />
            <span className={`text-2xl font-bold ${getRatingColor(reviewsData.overall_rating)}`}>
              {reviewsData.overall_rating.toFixed(1)}
            </span>
          </div>
          <div className="flex items-center justify-center gap-1 mb-1 hidden">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(reviewsData.overall_rating)
                    ? 'text-yellow-500 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-600 hidden">
            {reviewsData.total_reviews} reviews
          </p>
        </div>

        {/* AI Summary as Bullet Points */}
        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-purple-600" />
            <h4 className="font-semibold text-sm text-gray-900">AI Summary</h4>
            
          </div>
          <div className="space-y-2">
            {aiSummaryPoints.map((point, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 text-purple-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-700 leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Key Insights in two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 hidden">
          {/* What Customers Love */}
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <h4 className="font-semibold text-xs text-gray-900">What Customers Love</h4>
            </div>
            <div className="space-y-1">
              {reviewsData.sentiment_analysis.positive_highlights.slice(0, 2).map((highlight, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <p className="text-xs text-gray-700 leading-relaxed">{highlight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Areas to Improve */}
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-amber-600" />
              <h4 className="font-semibold text-xs text-gray-900">Areas to Improve</h4>
            </div>
            <div className="space-y-1">
              {reviewsData.sentiment_analysis.areas_for_improvement.length > 0 ? (
                reviewsData.sentiment_analysis.areas_for_improvement.slice(0, 2).map((area, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <p className="text-xs text-gray-700 leading-relaxed">{area}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500 italic">No significant issues identified</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
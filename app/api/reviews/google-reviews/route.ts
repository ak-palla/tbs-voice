import { NextRequest, NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';
import { GoogleGenerativeAI } from '@google/generative-ai';
<<<<<<< HEAD
import { responseQualityOptimizer } from '@/lib/response-quality-optimizer';
=======
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a

// Initialize Gemini AI (matching the SOP route pattern)
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("NEXT_PUBLIC_GEMINI_API_KEY is not set in the environment variables.");
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

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

// Enhanced Google Reviews fetching using Apify API
async function fetchGoogleReviews(businessName: string, googleReviewLink?: string): Promise<GoogleReview[]> {
  console.log('🔄 Fetching reviews for:', businessName);
  console.log('🔗 Google Review Link:', googleReviewLink);
  
  // Only try to fetch real reviews if we have both the link and API key
  if (!googleReviewLink) {
    console.log('❌ No Google review link provided - cannot fetch reviews');
    return [];
  }

  if (!process.env.APIFY_TOKEN) {
    console.log('❌ APIFY_TOKEN not configured - cannot fetch reviews');
    return [];
  }

  try {
    console.log('🔄 Attempting to fetch real Google reviews with Apify...');
    
    // Validate the Google Maps URL
    try {
      const parsedUrl = new URL(googleReviewLink);
      if (!parsedUrl.hostname.includes('google.com') && !parsedUrl.hostname.includes('maps.google.com')) {
        console.log('❌ URL must be a valid Google Maps URL');
        return [];
      }
    } catch (error) {
      console.log('❌ Invalid URL format:', error);
      return [];
    }

    // Initialize the ApifyClient with API token
    const client = new ApifyClient({
      token: process.env.APIFY_TOKEN,
    });

    // Prepare Actor input for Google Maps Reviews Scraper
    const input = {
      startUrls: [
        {
          url: googleReviewLink
        }
      ],
      maxReviews: 50, // Limit to 50 reviews for performance
      reviewsSort: "newest", // Get newest reviews first
      language: "en",
      reviewsOrigin: "all",
      personalData: true // Include reviewer names
    };

    console.log('🔄 Calling Apify Google Maps Reviews Scraper...');
    console.log('📋 Input:', JSON.stringify(input, null, 2));

    try {
      // Run the Actor and wait for it to finish
      const run = await client.actor("compass~google-maps-reviews-scraper").call(input);

      // Fetch results from the run's dataset
      const { items } = await client.dataset(run.defaultDatasetId).listItems();
      
      console.log('📡 Apify API response length:', items?.length || 0);
      
      if (!items || items.length === 0) {
        console.log('⚠️ No review data returned from Apify API');
        return [];
      }

      // Log the structure to debug
      console.log('📊 First item structure:', Object.keys(items[0] || {}));
      
      // Transform Apify response to our GoogleReview format
      const reviews: GoogleReview[] = [];
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        // Log individual item structure for debugging
        if (i === 0) {
          console.log('🔍 Sample item:', JSON.stringify(item, null, 2));
        }
        
        // Extract reviews from the item (Apify returns place data + reviews)
        if (item.reviews && Array.isArray(item.reviews)) {
          console.log('✅ Found', item.reviews.length, 'reviews in item', i);
          
          item.reviews.forEach((review: any, reviewIndex: number) => {
            try {
              const transformedReview: GoogleReview = {
                id: `apify_review_${i}_${reviewIndex}`,
                author_name: (review?.name || review?.author_name || review?.reviewerName || 'Anonymous') as string,
                rating: (review?.stars || review?.rating || 5) as number,
                text: (review?.text || review?.reviewText || review?.comment || '') as string,
                time: (review?.publishedAtDate || review?.time || review?.date || new Date().toISOString()) as string,
                relative_time_description: review?.publishedAtDate ? 
                  formatRelativeTime(review.publishedAtDate as string) : 'Recently'
              };
              
              // Only add reviews with text content
              if (transformedReview.text && transformedReview.text.trim().length > 0) {
                reviews.push(transformedReview);
              }
            } catch (reviewError) {
              console.error('❌ Error processing review:', reviewError);
            }
          });
        } else if (item?.name && item?.stars) {
          // If the item itself is a review (alternative structure)
          const transformedReview: GoogleReview = {
            id: `apify_review_${i}`,
            author_name: (item?.name || item?.author_name || 'Anonymous') as string,
            rating: (item?.stars || item?.rating || 5) as number,
            text: (item?.text || item?.reviewText || '') as string,
            time: (item?.publishedAtDate || item?.time || new Date().toISOString()) as string,
            relative_time_description: item?.publishedAtDate ? 
              formatRelativeTime(item.publishedAtDate as string) : 'Recently'
          };
          
          if (transformedReview.text && transformedReview.text.trim().length > 0) {
            reviews.push(transformedReview);
          }
        }
      }

      console.log('✅ Successfully processed', reviews.length, 'reviews from Apify');
      return reviews;

    } catch (error) {
      console.error('❌ Apify API error:', error);
      return [];
    }

  } catch (error) {
    console.error('❌ Error fetching real Google reviews:', error);
    return [];
  }
}

// Helper function to format relative time
function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffInDays / 365)} year${Math.floor(diffInDays / 365) > 1 ? 's' : ''} ago`;
  } catch (error) {
    return 'Recently';
  }
}

// Enhanced AI Summary generation (matching SOP route pattern)
<<<<<<< HEAD
async function generateAISummary(reviews: GoogleReview[]): Promise<{
=======
async function generateAISummary(reviews: GoogleReview[], language: string = 'en'): Promise<{
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  ai_summary: string;
  sentiment_analysis: {
    positive_highlights: string[];
    areas_for_improvement: string[];
    key_themes: string[];
  };
}> {
  // Check if Gemini AI is available
  if (!genAI) {
    console.warn('⚠️ NEXT_PUBLIC_GEMINI_API_KEY not found, using fallback analysis');
    return getFallbackAnalysis(reviews);
  }

  try {
    console.log('🤖 Generating AI summary with Gemini...');
    
    // Use the same model as SOP route
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-001" });

    const reviewTexts = reviews
      .filter(review => review.text && review.text.trim().length > 0)
      .map(review => `Rating: ${review.rating}/5 - "${review.text}"`)
      .join('\n\n');

    if (!reviewTexts.trim()) {
      console.log('⚠️ No review texts found, using fallback');
      return getFallbackAnalysis(reviews);
    }

<<<<<<< HEAD
    const prompt = `
      **Objective:** Analyze Google reviews for a business and extract key insights.
      
      **Business Name:** ${businessName}
      **Business Type:** ${businessType}
      
      **Reviews to Analyze:**
      ${reviews.map((r, i) => `Review ${i + 1} (${r.rating}/5): "${r.text}"`).join('\n')}
      
      **Analysis Required:**
      1.  **Sentiment Analysis:** Overall sentiment (Positive, Negative, Mixed) with a brief justification.
      2.  **Key Themes:** Identify the top 3-5 recurring themes (e.g., "Customer Service", "Pricing", "Quality of Work").
      3.  **Actionable Insights:** Suggest 2-3 specific, actionable steps the business can take based on the feedback.
      4.  **Positive Highlights:** Extract 2-3 standout positive quotes for marketing.
    `;
    
    const qualityEnhancement = responseQualityOptimizer.getPromptEnhancement('review-analysis', 'google reviews analysis', 'text');
    const generationConfig = responseQualityOptimizer.getGenerationConfig('review-analysis', 'text');

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt + qualityEnhancement }] }],
      generationConfig,
    });
    
    const analysis = result.response.text();

    return {
      ai_summary: analysis,
      sentiment_analysis: {
        positive_highlights: [],
        areas_for_improvement: [],
        key_themes: []
      }
    };
=======
    const languageInstruction = language === 'en-GB' 
      ? '\n\nIMPORTANT: Please respond in UK English using British spelling, terminology, and conventions (e.g., use "colour" not "color", "realise" not "realize", "whilst" not "while", etc.).'
      : '';

    const prompt = `Analyse the following customer reviews and provide a comprehensive summary:

${reviewTexts}

Please provide a response in the following JSON format:
{
  "ai_summary": "A comprehensive 3 sentence summary of the overall customer sentiment and experience",
  "positive_highlights": ["3-5 specific positive aspects customers love about the business"],
  "areas_for_improvement": ["3-4 areas where the business could improve based on feedback"],
  "key_themes": ["4-6 key themes or topics that appear frequently in reviews"]
}

Focus on being specific and actionable. Extract the most valuable insights that would help the business understand their strengths and areas for improvement.${languageInstruction}`;

    console.log('🤖 Sending request to Gemini AI...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('🤖 Gemini AI response received:', text);

    // Try to parse the JSON response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResponse = JSON.parse(jsonMatch[0]);
        console.log('✅ Successfully parsed AI response');
        return {
          ai_summary: parsedResponse.ai_summary || "AI analysis completed successfully.",
          sentiment_analysis: {
            positive_highlights: parsedResponse.positive_highlights || [],
            areas_for_improvement: parsedResponse.areas_for_improvement || [],
            key_themes: parsedResponse.key_themes || []
          }
        };
      }
    } catch (parseError) {
      console.error('❌ Error parsing AI response:', parseError);
    }

    // Fallback if JSON parsing fails
    console.log('⚠️ Failed to parse AI response, using fallback');
    return getFallbackAnalysis(reviews);
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a

  } catch (error) {
    console.error('❌ Error generating AI summary:', error);
    return getFallbackAnalysis(reviews);
  }
}

function getFallbackAnalysis(reviews: GoogleReview[]) {
  console.log('📊 Using fallback analysis for', reviews.length, 'reviews');
  
  if (reviews.length === 0) {
    return {
      ai_summary: "No reviews found. Please check your Google review link and ensure your Google Places API key is configured correctly.",
      sentiment_analysis: {
        positive_highlights: [],
        areas_for_improvement: ["Set up Google review integration to gather customer feedback"],
        key_themes: []
      }
    };
  }
  
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  
  return {
    ai_summary: `Based on ${reviews.length} customer reviews with an average rating of ${averageRating.toFixed(1)}/5, customers generally appreciate the professional service and business results delivered. The feedback indicates strong satisfaction with service quality and team expertise.`,
    sentiment_analysis: {
      positive_highlights: [
        "Professional and knowledgeable team",
        "Excellent service quality and results",
        "Good communication and responsiveness",
        "Value for money and ROI"
      ],
      areas_for_improvement: [
        "Response time could be faster",
        "More detailed analysis in consultations",
        "Better time management during sessions"
      ],
      key_themes: [
        "Professional service",
        "Business improvement",
        "Communication",
        "Results delivery",
        "Value proposition"
      ]
    }
  };
}

function calculateReviewsStatistics(reviews: GoogleReview[]) {
  const totalReviews = reviews.length;
  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let totalRating = 0;

  reviews.forEach(review => {
    const rating = Math.round(review.rating) as keyof typeof ratingDistribution;
    if (rating >= 1 && rating <= 5) {
      ratingDistribution[rating]++;
    }
    totalRating += review.rating;
  });

  const overallRating = totalReviews > 0 ? totalRating / totalReviews : 0;

  return {
    overall_rating: Math.round(overallRating * 10) / 10, // Round to 1 decimal place
    total_reviews: totalReviews,
    rating_distribution: ratingDistribution
  };
}

export async function POST(request: NextRequest) {
  try {
<<<<<<< HEAD
    // Read request body only once to prevent "Response body object should not be disturbed or locked" error
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (bodyError) {
      console.error('❌ [Google Reviews] Error reading request body:', bodyError);
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { businessName, googleReviewLink, forceRefresh, businessType } = requestBody;
=======
    const { businessName, googleReviewLink, forceRefresh, language } = await request.json();
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a

    console.log('📊 Google Reviews API called:', { businessName, hasGoogleLink: !!googleReviewLink, forceRefresh });

    if (!businessName) {
      return NextResponse.json(
        { error: 'Business name is required' },
        { status: 400 }
      );
    }

    // Fetch reviews from Google Places API or use mock data
    const reviews = await fetchGoogleReviews(businessName, googleReviewLink);

    if (!reviews || reviews.length === 0) {
      console.log('⚠️ No reviews found, returning empty state');
      return NextResponse.json({
        overall_rating: 0,
        total_reviews: 0,
        rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        recent_reviews: [],
        ai_summary: "No reviews available for this business yet.",
        sentiment_analysis: {
          positive_highlights: [],
          areas_for_improvement: [],
          key_themes: []
        },
        last_updated: new Date().toISOString()
      });
    }

    // Calculate statistics
    const statistics = calculateReviewsStatistics(reviews);
    console.log('📊 Calculated statistics:', statistics);

    // Generate AI summary
<<<<<<< HEAD
    const aiAnalysis = await generateAISummary(reviews);
=======
    const aiAnalysis = await generateAISummary(reviews, language);
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a

    // Sort reviews by date (most recent first)
    const sortedReviews = reviews.sort((a, b) => 
      new Date(b.time).getTime() - new Date(a.time).getTime()
    );

    const reviewsSummary: ReviewsSummary = {
      ...statistics,
      recent_reviews: sortedReviews.slice(0, 10), // Get top 10 most recent reviews
      ai_summary: aiAnalysis.ai_summary,
      sentiment_analysis: aiAnalysis.sentiment_analysis,
      last_updated: new Date().toISOString()
    };

    console.log('✅ Returning reviews summary with', reviewsSummary.total_reviews, 'reviews');
    return NextResponse.json(reviewsSummary);

  } catch (error) {
    console.error('❌ Error in google-reviews API:', error);
    return NextResponse.json(
<<<<<<< HEAD
      { error: 'Failed to fetch and analyze reviews' },
=======
      { error: 'Failed to fetch and analyse reviews' },
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const testUrl = searchParams.get('testUrl');
  
  if (testUrl) {
    // Test URL validation endpoint
    console.log('🧪 Testing URL validation for:', testUrl);
    
    let isValidUrl = false;
    let errorMessage = '';
    
    try {
      const parsedUrl = new URL(testUrl);
      if (parsedUrl.hostname.includes('google.com') || parsedUrl.hostname.includes('maps.google.com')) {
        isValidUrl = true;
      } else {
        errorMessage = 'URL must be a valid Google Maps URL';
      }
    } catch (error) {
      errorMessage = 'Invalid URL format';
    }
    
    return NextResponse.json({
      test_url: testUrl,
      is_valid_google_maps_url: isValidUrl,
      error_message: errorMessage,
      apify_token_configured: !!process.env.APIFY_TOKEN,
      apify_token_length: process.env.APIFY_TOKEN?.length || 0
    });
  }
  
  return NextResponse.json({
    message: 'Google Reviews API - Use POST to fetch reviews or GET with ?testUrl= to test URL validation',
    apify_token_configured: !!process.env.APIFY_TOKEN,
    supported_url_formats: [
      'https://maps.google.com/maps/place/Business+Name/@lat,lng,zoom/data=...',
      'https://www.google.com/maps/place/Business+Name/@lat,lng,zoom/data=...',
      'Any valid Google Maps business URL with reviews'
    ]
  });
} 
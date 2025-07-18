# Customer Reviews Summary Setup Guide

## Overview
The Customer Reviews Summary feature automatically fetches Google reviews for your business and uses Google's Gemini AI to provide intelligent analysis and insights.

## Required Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Google Gemini AI API Key (required for AI analysis)
GEMINI_API_KEY=your_gemini_api_key_here

# Google Places API Key (optional - for real Google reviews fetching)
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
```

## Getting API Keys

### 1. Gemini AI API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key and add it to your environment variables

### 2. Google Places API Key (Optional)
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Places API
4. Create credentials (API Key)
5. Copy the key and add it to your environment variables

## Database Setup

Run the following command to create the required database table:

```bash
npx supabase db push
```

This will create the `reviews_cache` table for storing cached review data.

## Features

- **Automatic Review Fetching**: Fetches Google reviews for your business
<<<<<<< HEAD
- **AI-Powered Analysis**: Uses Gemini AI to analyze sentiment and extract insights
=======
- **AI-Powered Analysis**: Uses Gemini AI to Analyse sentiment and extract insights
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
- **Smart Caching**: Reviews are cached for 24 hours to improve performance
- **Beautiful UI**: Modern, responsive design that matches your dashboard
- **Real-time Updates**: Refresh button to get the latest reviews

## Current Implementation

The feature currently includes:
- ✅ Mock data for demonstration
- ✅ AI analysis using Gemini
- ✅ Beautiful responsive UI
- ✅ Caching system
- ⏳ Real Google Reviews API integration (ready for implementation)

## To Enable Real Google Reviews

1. Get a Google Places API key (see above)
2. Update the `fetchGoogleReviews` function in `/app/api/reviews/google-reviews/route.ts`
3. Implement Google Places API calls to replace the mock data

## UI Features

The Customer Reviews Summary section includes:
- Overall rating with star display
- Rating distribution chart
- AI-generated summary
- Sentiment analysis (positive highlights, areas for improvement)
- Key themes extraction
- Recent reviews display
- Refresh functionality

## Location in Dashboard

The Customer Reviews Summary appears between the "Business Health Overview" and "Priority Tasks" sections in your dashboard. 
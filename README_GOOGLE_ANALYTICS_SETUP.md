# Google Analytics OAuth Setup Guide

## Overview
This guide will help you set up Google Analytics 4 (GA4) OAuth integration with your Next.js application. Each user will connect their own Google Analytics account to view their personalized analytics data.

## Prerequisites
- Google Account
- Access to Google Analytics
- Google Cloud Console access (for OAuth setup)

## Step 1: Create Google Analytics 4 Property (For Users)

Users will need their own GA4 property:

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click "Start measuring" or create a new property
3. Follow the setup wizard:
   - Enter your account name
   - Choose your property settings
   - Select your business information
4. Copy your **Measurement ID** (format: G-XXXXXXXXXX) - users will need this for tracking
5. Note your **Property ID** (numeric ID from the property settings) - this will be automatically detected

## Step 2: Set Up Google OAuth Application

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Analytics Reporting API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Analytics Reporting API"
   - Click "Enable"
4. Configure OAuth consent screen:
   - Go to "APIs & Services" > "OAuth consent screen"
   - Choose "External" user type
   - Fill in application information
   - Add your domain to authorized domains
   - Add scopes: `https://www.googleapis.com/auth/analytics.readonly`
5. Create OAuth credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/google/callback` (for development)
     - `https://yourdomain.com/api/auth/google/callback` (for production)
6. Download the OAuth client configuration

## Step 3: Environment Variables Setup

Add the following environment variables to your `.env.local` file:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

# Google Analytics Configuration (Optional - for website tracking)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Environment Variables Explained:

- **GOOGLE_CLIENT_ID**: Your OAuth 2.0 Client ID from Google Cloud Console
- **GOOGLE_CLIENT_SECRET**: Your OAuth 2.0 Client Secret from Google Cloud Console  
- **NEXT_PUBLIC_GA_MEASUREMENT_ID**: (Optional) Your GA4 Measurement ID for website tracking

### Getting OAuth Credentials:

1. In Google Cloud Console, go to your OAuth 2.0 Client ID
2. Copy the "Client ID" and "Client secret" values
3. Add them to your environment variables

## Step 4: Testing the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/new-dashboard` in your browser

3. Click "Connect Google Analytics" to test the OAuth flow

4. Authorize the application in the Google OAuth screen

5. Verify that the connection shows as "Connected" after redirect

## Features Included

### Analytics Dashboard Components:
- **Key Metrics Cards**: Total users, sessions, page views, session duration
- **Bounce Rate Analysis**: With performance indicators
- **Device Breakdown**: Desktop, mobile, tablet usage
- **Top Pages**: Most visited pages with traffic percentages
- **Geographic Data**: Users by country
- **Daily Trends**: 30-day user activity chart

### Tracking Features:
- **Page View Tracking**: Automatic page view tracking
- **Event Tracking**: Custom event tracking capabilities
- **Real-time Data**: Live analytics data fetching

## API Endpoints

The setup includes the following API endpoints:

- `GET /api/analytics`: Fetch analytics data with optional date range
- `POST /api/analytics`: Fetch analytics data with custom property ID

### API Usage Examples:

```javascript
// Fetch last 30 days data
const response = await fetch('/api/analytics');
const data = await response.json();

// Fetch custom date range
const response = await fetch('/api/analytics?startDate=7daysAgo&endDate=today');
const data = await response.json();

// Custom property ID
const response = await fetch('/api/analytics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    propertyId: '123456789',
    startDate: '30daysAgo',
    endDate: 'today'
  })
});
```

## Troubleshooting

### Common Issues:

1. **"Property ID not configured" error**:
   - Ensure `GOOGLE_ANALYTICS_PROPERTY_ID` is set in your environment variables
   - Verify the property ID is correct (numeric value)

2. **"Failed to fetch analytics data" error**:
   - Check that the service account has proper permissions
   - Verify the credentials JSON is properly formatted in the environment variable
   - Ensure the Google Analytics Reporting API is enabled

3. **No data showing**:
   - New GA4 properties may take 24-48 hours to start collecting data
   - Verify your website has the tracking code installed
   - Check that you're looking at the correct date range

4. **Authentication errors**:
   - Verify the service account email is added to your GA4 property
   - Ensure the service account has at least "Viewer" permissions
   - Check that the JSON credentials are complete and valid

### Development Mode:

If you're in development and don't have real GA data yet, the system will automatically show mock data to demonstrate the dashboard functionality.

## Security Notes

- Never commit your service account JSON file to version control
- Keep your environment variables secure
- Use different service accounts for development and production
- Regularly rotate your service account keys

## Next Steps

1. Set up custom events for specific user actions
2. Create custom segments in Google Analytics
3. Set up goals and conversions
4. Configure alerts for important metrics
5. Explore advanced reporting features

## Support

If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify all environment variables are set correctly
3. Test with a simple API call to ensure authentication works
4. Check Google Cloud Console for API quota limits

For additional help, refer to:
- [Google Analytics 4 Documentation](https://support.google.com/analytics/answer/9304153)
- [Google Analytics Reporting API Documentation](https://developers.google.com/analytics/devguides/reporting/data/v1)
- [Google Cloud Service Accounts Documentation](https://cloud.google.com/iam/docs/service-accounts) 
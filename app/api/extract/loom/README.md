# Loom Video Extraction

This API route allows for extracting transcriptions from Loom videos using the Apify API.

## Setup

1. Sign up for an Apify account at [https://apify.com](https://apify.com)
2. Obtain your API token from [https://console.apify.com/account/integrations](https://console.apify.com/account/integrations)
3. Add the API token to your environment variables:

```
APIFY_TOKEN=your-apify-token
```

Add this to your `.env.local` file for local development or to your deployment environment variables.

## Usage

Send a POST request to `/api/extract/loom` with a JSON body containing a Loom video URL:

```json
{
  "url": "https://www.loom.com/share/your-loom-video-id"
}
```

### Example Response

```json
{
  "content": "[00:00] Hi, this is a transcription of the Loom video...",
  "title": "Video Title",
  "description": "Video Description",
  "thumbnailUrl": "https://example.com/thumbnail.jpg",
  "duration": 120,
  "views": 150,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "owner": "John Doe",
  "url": "https://www.loom.com/share/your-loom-video-id",
  "extractionDate": "2023-06-01T12:34:56.789Z"
}
```

## Notes

- The extraction process uses the Apify actor `automation-architech~loom-video-scraper`
- The API has a rate limit and usage quotas depending on your Apify plan
- Make sure your Loom video URLs are publicly accessible 
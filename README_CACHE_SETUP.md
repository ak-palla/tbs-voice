# AI Dashboard Cache Setup

## Overview
The AI Dashboard now uses Supabase for persistent caching instead of in-memory cache. This provides better reliability and persistence across server restarts.

## Setup Instructions

### 1. Create the Cache Table
Run the SQL script in your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the contents of `sql/create_cache_table.sql`
5. Run the query

### 2. Verify Table Creation
After running the SQL script, you should see:
- `app_cache` table created
- Proper indexes for performance
- Row Level Security (RLS) enabled
- Automatic cleanup functions

### 3. Benefits of Supabase Cache

#### ✅ **Persistent Storage**
- Cache survives server restarts and deployments
- No data loss during application updates

#### ✅ **Automatic Cleanup**
- Expired cache entries are automatically removed
- Built-in TTL (time-to-live) functionality

#### ✅ **Security**
- Row Level Security ensures users only access their own cache
- Proper user isolation

#### ✅ **Performance**
- Indexed queries for fast cache lookups
- Efficient JSON storage for complex data

### 4. Cache Behavior

#### AI Dashboard Cache
- **Duration**: 15 minutes
- **Type**: Manual refresh only
- **Storage**: User-specific dashboard analysis data

#### User Data Cache
- **Duration**: 5 minutes
- **Type**: Automatic background refresh
- **Storage**: User business data and settings

#### Global Instructions Cache
- **Duration**: 5 minutes
- **Type**: Shared across all users
- **Storage**: AI prompts and system instructions

### 5. Monitoring Cache

You can monitor cache usage in Supabase:

```sql
-- View cache statistics
SELECT 
  cache_type,
  COUNT(*) as total_entries,
  COUNT(CASE WHEN expires_at > NOW() THEN 1 END) as active_entries,
  COUNT(CASE WHEN expires_at <= NOW() THEN 1 END) as expired_entries
FROM app_cache 
GROUP BY cache_type;

-- View user-specific cache
SELECT 
  cache_key,
  cache_type,
  created_at,
  expires_at,
  expires_at > NOW() as is_active
FROM app_cache 
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC;
```

### 6. Manual Cache Management

```sql
-- Clear all expired cache entries
SELECT cleanup_expired_cache();

-- Clear cache for specific user
DELETE FROM app_cache WHERE user_id = 'USER_ID';

-- Clear specific cache type
DELETE FROM app_cache WHERE cache_type = 'ai_dashboard';

-- Clear all cache (use with caution)
DELETE FROM app_cache;
```

## Troubleshooting

### Cache Not Working
1. Verify the `app_cache` table exists
2. Check RLS policies are properly set
3. Ensure user authentication is working
4. Check server logs for cache errors

### Performance Issues
1. Monitor cache hit rates in logs
2. Check if indexes are being used
3. Consider adjusting cache durations
4. Run cleanup function if needed

### Data Issues
1. Clear specific user cache if data seems stale
2. Check cache expiry times
3. Verify data serialization/deserialization

## Development vs Production

### Development
- Cache may be cleared frequently due to server restarts
- Use shorter cache durations for testing
- Monitor logs for cache behavior

### Production
- Cache provides significant performance benefits
- Set up automated cleanup jobs
- Monitor cache table size and performance 
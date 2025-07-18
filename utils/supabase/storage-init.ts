import { createClient } from '@/utils/supabase/server';

/**
 * Initialize Supabase storage buckets
 * This function creates necessary buckets if they don't exist
 */
export async function initializeSupabaseStorage() {
  try {
    const supabase = await createClient();

    // Create the machines bucket if it doesn't exist
    const { data: machinesBucket, error: machinesBucketError } = await supabase.storage
      .getBucket('machines');

    if (machinesBucketError && machinesBucketError.message.includes('The resource was not found')) {
      // Bucket doesn't exist, create it
      const { error: createError } = await supabase.storage.createBucket('machines', {
        public: true, // Make the bucket public so we can access images without authentication
        fileSizeLimit: 10485760, // 10MB limit
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp', 'image/gif']
      });

      if (createError) {
        // Only log this error once, not on every page load
        if (process.env.NODE_ENV === 'development') {
          console.warn('Could not create machines bucket:', createError.message);
        }
        return { success: false, error: createError };
      }
    } else if (machinesBucketError) {
      // Only log unexpected errors in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Storage bucket check failed:', machinesBucketError.message);
      }
      return { success: false, error: machinesBucketError };
    }

    // Update bucket to be public if it exists but isn't public
    if (!machinesBucketError && machinesBucket) {
      if (!machinesBucket.public) {
        const { error: updateError } = await supabase.storage.updateBucket('machines', {
          public: true,
          fileSizeLimit: 10485760, // 10MB limit
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp', 'image/gif']
        });

        if (updateError && process.env.NODE_ENV === 'development') {
          console.warn('Could not update machines bucket:', updateError.message);
        }
      }
    }
    
    return { success: true };
  } catch (error) {
    // Only log in development to avoid console spam in production
    if (process.env.NODE_ENV === 'development') {
      console.warn('Storage initialization failed:', error);
    }
    return { success: false, error };
  }
} 
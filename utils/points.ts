import { createClient } from "@/utils/supabase/client";

// Point values for different activities - STARTING SIMPLE
export const POINT_VALUES = {
  DAILY_LOGIN: 10,
  TIMELINE_COMPLETION: 500,
  // We'll add more activities one by one after testing
  // SCORECARD_GREEN: 25,
  // BATTLE_PLAN_SECTION: 100,
  // MACHINE_SETUP: 200,
  // etc...
} as const;

// Activity types that correspond to database activity_type field
export const ACTIVITY_TYPES = {
  DAILY_LOGIN: 'daily_login',
  TIMELINE_COMPLETION: 'timeline_completion',
  // We'll add more activities one by one after testing
} as const;

interface PointsService {
  awardPoints: (
    activityType: string,
    activityId: string,
    points: number,
    description?: string
  ) => Promise<boolean>;
  removePoints: (
    activityType: string,
    activityId: string
  ) => Promise<boolean>;
  getUserPoints: () => Promise<any>;
  getLeaderboard: (limit?: number) => Promise<any[]>;
}

export class PointsManager implements PointsService {
  private supabase;
  private userId: string | null = null;

  constructor() {
    this.supabase = createClient();
  }

  private async ensureUser(): Promise<string> {
    if (!this.userId) {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      this.userId = user.id;
    }
    return this.userId;
  }

  /**
   * Award points to the current user for a specific activity
   */
  async awardPoints(
    activityType: string,
    activityId: string,
    points: number,
    description?: string
  ): Promise<boolean> {
    try {
      const userId = await this.ensureUser();
      
      const { data, error } = await this.supabase.rpc('add_user_points', {
        p_user_id: userId,
        p_activity_type: activityType,
        p_activity_id: activityId,
        p_points: points,
        p_description: description
      });

      if (error) {
        console.error('Error awarding points:', error);
        return false;
      }

      // Return true if points were successfully awarded (not a duplicate)
      return data === true;
    } catch (error) {
      console.error('Error in awardPoints:', error);
      return false;
    }
  }

  /**
   * Remove points from the current user for a specific activity
   */
  async removePoints(
    activityType: string,
    activityId: string
  ): Promise<boolean> {
    try {
      const userId = await this.ensureUser();
      
      const { data, error } = await this.supabase.rpc('remove_user_points', {
        p_user_id: userId,
        p_activity_type: activityType,
        p_activity_id: activityId
      });

      if (error) {
        console.error('Error removing points:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Error in removePoints:', error);
      return false;
    }
  }

  /**
   * Get current user's point information
   */
  async getUserPoints() {
    try {
      const userId = await this.ensureUser();
      
      const { data, error } = await this.supabase
        .from('user_points')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data || {
        total_points: 0,
        level: 1,
        weekly_points: 0,
        monthly_points: 0,
        current_streak: 0,
        longest_streak: 0
      };
    } catch (error) {
      console.error('Error fetching user points:', error);
      return null;
    }
  }

  /**
   * Get leaderboard data
   */
  async getLeaderboard(limit: number = 10) {
    try {
      const { data, error } = await this.supabase
        .from('leaderboard_view')
        .select('*')
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }

  /**
   * Track daily login - should be called on dashboard load
   */
  async trackDailyLogin(): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    return this.awardPoints(
      ACTIVITY_TYPES.DAILY_LOGIN,
      `login_${today}`,
      POINT_VALUES.DAILY_LOGIN,
      'Daily platform visit'
    );
  }

  /**
   * Track timeline event completion
   */
  async trackTimelineCompletion(timelineId: string): Promise<boolean> {
    return this.awardPoints(
      ACTIVITY_TYPES.TIMELINE_COMPLETION,
      `timeline_${timelineId}`,
      POINT_VALUES.TIMELINE_COMPLETION,
      'Timeline event completed'
    );
  }

  /**
   * Remove points for timeline event uncompletion
   */
  async removeTimelineCompletion(timelineId: string): Promise<boolean> {
    return this.removePoints(
      ACTIVITY_TYPES.TIMELINE_COMPLETION,
      `timeline_${timelineId}`
    );
  }


}

// Export a singleton instance
export const pointsManager = new PointsManager();

// Helper functions for easy use throughout the app - SIMPLIFIED
export const trackActivity = {
  dailyLogin: () => pointsManager.trackDailyLogin(),
  timelineCompletion: (id: string) => pointsManager.trackTimelineCompletion(id),
  removeTimelineCompletion: (id: string) => pointsManager.removeTimelineCompletion(id),
  // We'll add more activities one by one after testing
};

// Utility to show point celebration/notification
export const celebratePoints = (points: number, activity: string) => {
  // You can integrate with your toast/notification system here
  console.log(`🎉 +${points} points for ${activity}!`);
  
  // Example with a simple toast (you'll need to implement this based on your toast system)
  // toast.success(`🎉 +${points} points for ${activity}!`);
}; 
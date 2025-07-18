"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogPortal } from "@/components/ui/dialog";
import { 
  Trophy, 
  Medal, 
  Crown, 
  Target, 
  TrendingUp, 
  Flame,
  Star,
  Award,
  Info,
  Calendar,
  CheckCircle,
  Zap,
  Gift,
  Users,
  Lightbulb,
  BookOpen
} from "lucide-react";

interface LeaderboardUser {
  user_id: string;
  full_name: string;
  business_name: string;
  profile_picture_url: string | null;
  total_points: number;
  level: number;
  weekly_points: number;
  monthly_points: number;
  current_streak: number;
  longest_streak: number;
  rank: number;
  last_activity_date: string;
}

interface UserStats {
  total_points: number;
  level: number;
  rank: number;
  weekly_points: number;
  monthly_points: number;
  current_streak: number;
}

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all-time");
  const supabase = createClient();

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch leaderboard data
      const { data: leaderboard, error: leaderboardError } = await supabase
        .from("leaderboard_view")
        .select("*")
        .limit(10);

      if (leaderboardError) throw leaderboardError;

      // Find current user's stats
      const currentUserStats = leaderboard?.find(u => u.user_id === user.id);
      
      if (currentUserStats) {
        setUserStats({
          total_points: currentUserStats.total_points,
          level: currentUserStats.level,
          rank: currentUserStats.rank,
          weekly_points: currentUserStats.weekly_points,
          monthly_points: currentUserStats.monthly_points,
          current_streak: currentUserStats.current_streak,
        });
      } else {
        // User not in leaderboard yet, set default stats
        setUserStats({
          total_points: 0,
          level: 1,
          rank: 0,
          weekly_points: 0,
          monthly_points: 0,
          current_streak: 0,
        });
      }

      setLeaderboardData(leaderboard || []);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-medium text-gray-500">#{rank}</span>;
    }
  };

  const getLevelBadgeColor = (level: number) => {
    if (level >= 10) return "bg-purple-100 text-purple-800";
    if (level >= 5) return "bg-blue-100 text-blue-800";
    if (level >= 3) return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-800";
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatPoints = (points: number) => {
    if (points >= 1000000) return `${(points / 1000000).toFixed(1)}M`;
    if (points >= 1000) return `${(points / 1000).toFixed(1)}K`;
    return points.toString();
  };

  if (loading) {
    return (
      <Card className="h-96">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Leaderboard
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Info className="h-4 w-4 text-gray-500" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <Zap className="h-6 w-6 text-blue-500" />
                    How the Gamification System Works
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {/* Loading content placeholder */}
                  <div className="text-center text-gray-500">
                    <LoadingSpinner />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  // Info Dialog Content Component
  const InfoDialogContent = () => (
    <div className="space-y-6 py-4">
      {/* Points System */}
      <div>
        <h3 className="flex items-center gap-2 font-semibold text-lg mb-4">
          <Star className="h-5 w-5 text-yellow-500" />
          Ways to Earn Points
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
            <Calendar className="h-6 w-6 text-blue-500" />
            <div>
              <div className="font-medium text-gray-900">Daily Login</div>
              <div className="text-sm text-gray-600">+10 points (once per day)</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <div>
              <div className="font-medium text-gray-900">Timeline Event</div>
              <div className="text-sm text-gray-600">+50 points per completion</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
            <Target className="h-6 w-6 text-purple-500" />
            <div>
              <div className="font-medium text-gray-900">Business Plan Section</div>
              <div className="text-sm text-gray-600">+100 points per section</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
            <Zap className="h-6 w-6 text-amber-500" />
            <div>
              <div className="font-medium text-gray-900">Machine Setup</div>
              <div className="text-sm text-gray-600">+200 points per machine</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
            <TrendingUp className="h-6 w-6 text-emerald-500" />
            <div>
              <div className="font-medium text-gray-900">Scorecard Achievement</div>
              <div className="text-sm text-gray-600">+25 points (green status)</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
            <Award className="h-6 w-6 text-indigo-500" />
            <div>
              <div className="font-medium text-gray-900">Profile Completion</div>
              <div className="text-sm text-gray-600">+75 points (one-time)</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
            <Users className="h-6 w-6 text-cyan-500" />
            <div>
              <div className="font-medium text-gray-900">Team Member Added</div>
              <div className="text-sm text-gray-600">+30 points per member</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
            <Calendar className="h-6 w-6 text-rose-500" />
            <div>
              <div className="font-medium text-gray-900">Meeting Scheduled</div>
              <div className="text-sm text-gray-600">+40 points per meeting</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
            <Lightbulb className="h-6 w-6 text-yellow-500" />
            <div>
              <div className="font-medium text-gray-900">Innovation Idea</div>
              <div className="text-sm text-gray-600">+60 points per idea</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
            <BookOpen className="h-6 w-6 text-teal-500" />
            <div>
              <div className="font-medium text-gray-900">Playbook Completion</div>
              <div className="text-sm text-gray-600">+150 points per playbook</div>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 border border-gray-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-500 mt-0.5" />
            <div className="text-sm text-gray-700">
              <strong>Note:</strong> Points are removed if you uncomplete activities (e.g., uncheck a timeline event).
            </div>
          </div>
        </div>
      </div>

      {/* Level System */}
      <div>
        <h3 className="flex items-center gap-2 font-semibold text-lg mb-4">
          <Award className="h-5 w-5 text-purple-500" />
          Level System
        </h3>
        <div className="space-y-3">
          <div className="p-4 border border-gray-200 rounded-lg">
          
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="text-center">
                <Badge className="bg-gray-100 text-gray-800 mb-1">Level 1</Badge>
                <div className="text-gray-600">0-999 pts</div>
              </div>
              <div className="text-center">
                <Badge className="bg-gray-100 text-gray-800 mb-1">Level 2</Badge>
                <div className="text-gray-600">1K-1.9K pts</div>
              </div>
              <div className="text-center">
                <Badge className="bg-gray-100 text-gray-800 mb-1">Level 3</Badge>
                <div className="text-gray-600">2K-2.9K pts</div>
              </div>
              <div className="text-center">
                <Badge className="bg-gray-100 text-gray-800 mb-1">Level 4+</Badge>
                <div className="text-gray-600">3K+ pts</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Types */}
      <div>
        <h3 className="flex items-center gap-2 font-semibold text-lg mb-4">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Leaderboard Types
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 border border-gray-200 rounded-lg">
            <div className="font-medium text-gray-900 mb-1">All-Time</div>
            <div className="text-sm text-gray-600">Total points earned since joining</div>
          </div>
          <div className="p-3 border border-gray-200 rounded-lg">
            <div className="font-medium text-gray-900 mb-1">This Month</div>
            <div className="text-sm text-gray-600">Points earned in current month</div>
          </div>
          <div className="p-3 border border-gray-200 rounded-lg">
            <div className="font-medium text-gray-900 mb-1">This Week</div>
            <div className="text-sm text-gray-600">Points earned in current week</div>
          </div>
        </div>
      </div>

      {/* Streaks & Features */}
      <div>
        <h3 className="flex items-center gap-2 font-semibold text-lg mb-4">
          <Flame className="h-5 w-5 text-orange-500" />
          Features
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
            <Flame className="h-6 w-6 text-orange-500" />
            <div>
              <div className="font-medium text-gray-900">Daily Streaks</div>
              <div className="text-sm text-gray-600">Track consecutive days of activity</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
            <Crown className="h-6 w-6 text-yellow-500" />
            <div>
              <div className="font-medium text-gray-900">Rank Icons</div>
              <div className="text-sm text-gray-600">Crown for #1, medals for top 3</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="p-4 border border-gray-200 rounded-lg">
        <h4 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
          <Gift className="h-5 w-5 text-green-500" />
          Pro Tips
        </h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Visit the dashboard daily for consistent points</li>
          <li>• Complete timeline events to boost your rank quickly</li>
          <li>• Focus on high-value activities like machine setups and playbooks</li>
          <li>• Weekly and monthly leaderboards reset, giving everyone a fresh chance</li>
          <li>• Build your team and complete your profile for easy bonus points</li>
        </ul>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Leaderboard
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50">
                <Info className="h-4 w-4 text-gray-500 hover:text-blue-600" />
              </Button>
            </DialogTrigger>
            <DialogPortal>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto !fixed !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2 !z-[9999]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <Zap className="h-6 w-6 text-blue-500" />
                    How the Gamification System Works
                  </DialogTitle>
                </DialogHeader>
                <InfoDialogContent />
              </DialogContent>
            </DialogPortal>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* User Stats Summary */}
        {userStats && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Your Progress</h3>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">{formatPoints(userStats.total_points)} pts</span>
                  </div>
                  <Badge className={`text-xs ${getLevelBadgeColor(userStats.level)}`}>
                    Level {userStats.level}
                  </Badge>
                  {userStats.rank > 0 && (
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Rank #{userStats.rank}</span>
                    </div>
                  )}
                  {userStats.current_streak > 0 && (
                    <div className="flex items-center gap-1">
                      <Flame className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-gray-600">{userStats.current_streak} day streak</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all-time">All Time</TabsTrigger>
            <TabsTrigger value="monthly">This Month</TabsTrigger>
            <TabsTrigger value="weekly">This Week</TabsTrigger>
          </TabsList>

          <TabsContent value="all-time" className="mt-4">
            <div className="space-y-3">
              {leaderboardData.length > 0 ? (
                leaderboardData
                  .sort((a, b) => b.total_points - a.total_points)
                  .map((user, index) => (
                  <div
                    key={user.user_id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      index < 3 
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex-shrink-0 w-8 flex items-center justify-center">
                      {getRankIcon(user.rank)}
                    </div>
                    
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profile_picture_url || ''} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                        {getUserInitials(user.full_name || user.business_name || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 truncate">
                          {user.full_name || user.business_name}
                        </h4>
                        <Badge className={`text-xs ${getLevelBadgeColor(user.level)}`}>
                          Level {user.level}
                        </Badge>
                      </div>
                      {user.business_name && user.full_name && (
                        <p className="text-sm text-gray-500 truncate">{user.business_name}</p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-semibold text-gray-900">
                          {formatPoints(user.total_points)}
                        </span>
                      </div>
                      {user.current_streak > 0 && (
                        <div className="flex items-center gap-1 justify-end mt-1">
                          <Flame className="h-3 w-3 text-orange-500" />
                          <span className="text-xs text-gray-600">{user.current_streak}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No rankings yet. Start completing activities to earn points!</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="mt-4">
            <div className="space-y-3">
              {leaderboardData
                .sort((a, b) => b.monthly_points - a.monthly_points)
                .slice(0, 10)
                .map((user, index) => (
                  <div
                    key={user.user_id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    </div>
                    
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profile_picture_url || ''} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                        {getUserInitials(user.full_name || user.business_name || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {user.full_name || user.business_name}
                      </h4>
                      {user.business_name && user.full_name && (
                        <p className="text-sm text-gray-500 truncate">{user.business_name}</p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="font-semibold text-gray-900">
                          {formatPoints(user.monthly_points)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="mt-4">
            <div className="space-y-3">
              {leaderboardData
                .sort((a, b) => b.weekly_points - a.weekly_points)
                .slice(0, 10)
                .map((user, index) => (
                  <div
                    key={user.user_id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    </div>
                    
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profile_picture_url || ''} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                        {getUserInitials(user.full_name || user.business_name || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {user.full_name || user.business_name}
                      </h4>
                      {user.business_name && user.full_name && (
                        <p className="text-sm text-gray-500 truncate">{user.business_name}</p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <span className="font-semibold text-gray-900">
                          {formatPoints(user.weekly_points)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 
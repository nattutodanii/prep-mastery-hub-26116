
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { X, Flame, Trophy, Star, Award, Target, Zap, Crown, Diamond, Rocket, Medal } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface UserStreak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  streak_freeze_used: boolean;
}

interface StreakPopupProps {
  onClose: () => void;
}

const streakBadges = [
  { streak: 1, icon: Flame, title: "First Step", description: "Started your journey", color: "from-orange-400 to-red-500" },
  { streak: 3, icon: Target, title: "Getting Started", description: "3 days in a row", color: "from-blue-400 to-blue-600" },
  { streak: 7, icon: Star, title: "Week Warrior", description: "7 days strong", color: "from-purple-400 to-purple-600" },
  { streak: 14, icon: Award, title: "Two Week Hero", description: "14 days of dedication", color: "from-green-400 to-green-600" },
  { streak: 21, icon: Trophy, title: "Three Week Champion", description: "21 days of excellence", color: "from-yellow-400 to-orange-500" },
  { streak: 30, icon: Medal, title: "Monthly Master", description: "30 days of consistency", color: "from-indigo-400 to-purple-500" },
  { streak: 50, icon: Zap, title: "Lightning Learner", description: "50 days unstoppable", color: "from-cyan-400 to-blue-500" },
  { streak: 75, icon: Crown, title: "Study Royalty", description: "75 days of mastery", color: "from-yellow-500 to-yellow-600" },
  { streak: 100, icon: Diamond, title: "Century Champion", description: "100 days legendary", color: "from-pink-400 to-rose-500" },
  { streak: 150, icon: Rocket, title: "Streak Superstar", description: "150 days incredible", color: "from-emerald-400 to-teal-500" }
];

export function StreakPopup({ onClose }: StreakPopupProps) {
  const { user } = useAuth();
  const [userStreak, setUserStreak] = useState<UserStreak | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStreak();
  }, [user?.id]);

  const fetchUserStreak = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setUserStreak(data || {
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: null,
        streak_freeze_used: false
      });
    } catch (error) {
      console.error('Error fetching user streak:', error);
      setUserStreak({
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: null,
        streak_freeze_used: false
      });
    } finally {
      setLoading(false);
    }
  };

  const getEarnedBadges = () => {
    if (!userStreak) return [];
    return streakBadges.filter(badge => userStreak.longest_streak >= badge.streak);
  };

  const getNextBadge = () => {
    if (!userStreak) return null;
    return streakBadges.find(badge => userStreak.longest_streak < badge.streak);
  };

  const getBadgeProgress = () => {
    if (!userStreak) return 0;
    const nextBadge = getNextBadge();
    if (!nextBadge) return 100;
    
    const earnedBadges = getEarnedBadges();
    const lastEarnedStreak = earnedBadges.length > 0 ? earnedBadges[earnedBadges.length - 1].streak : 0;
    const progress = ((userStreak.longest_streak - lastEarnedStreak) / (nextBadge.streak - lastEarnedStreak)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">Loading streak data...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const earnedBadges = getEarnedBadges();
  const nextBadge = getNextBadge();
  const progress = getBadgeProgress();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-500" />
            Your Learning Streak
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Current Stats */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white">
              <div className="text-center">
                <div className="text-3xl font-bold">{userStreak?.current_streak || 0}</div>
                <div className="text-sm opacity-90">Days</div>
              </div>
            </div>
            
            <div className="flex justify-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">{userStreak?.longest_streak || 0}</div>
                <div className="text-sm text-muted-foreground">Best Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">{earnedBadges.length}</div>
                <div className="text-sm text-muted-foreground">Badges Earned</div>
              </div>
            </div>
          </div>

          {/* Next Badge Progress */}
          {nextBadge && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Next Achievement</span>
                <Badge variant="outline">{userStreak?.longest_streak || 0}/{nextBadge.streak} days</Badge>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${nextBadge.color} flex items-center justify-center text-white`}>
                  <nextBadge.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium text-sm">{nextBadge.title}</div>
                  <div className="text-xs text-muted-foreground">{nextBadge.description}</div>
                </div>
              </div>
            </div>
          )}

          {/* Achievement Badges Grid */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Achievement Badges</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {streakBadges.map((badge) => {
                const isEarned = earnedBadges.some(earned => earned.streak === badge.streak);
                const IconComponent = badge.icon;
                
                return (
                  <div
                    key={badge.streak}
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      isEarned 
                        ? 'border-primary bg-primary/5 scale-105' 
                        : 'border-muted bg-muted/20'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isEarned 
                          ? `bg-gradient-to-br ${badge.color} text-white shadow-lg` 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      
                      <div className="text-center">
                        <div className={`font-medium text-sm ${isEarned ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {badge.title}
                        </div>
                        <div className={`text-xs ${isEarned ? 'text-muted-foreground' : 'text-muted-foreground/60'}`}>
                          {badge.description}
                        </div>
                        <Badge 
                          variant={isEarned ? "default" : "secondary"} 
                          className="mt-1 text-xs"
                        >
                          {badge.streak} days
                        </Badge>
                      </div>
                    </div>
                    
                    {isEarned && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Trophy className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Motivation Message */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
            <div className="text-center space-y-2">
              <div className="font-medium text-blue-900">Keep Going! 🚀</div>
              <div className="text-sm text-blue-700">
                {userStreak?.current_streak === 0 
                  ? "Start a test today to begin your streak!"
                  : `You're on a ${userStreak?.current_streak} day streak. Take a test within 48 hours to keep it going!`
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

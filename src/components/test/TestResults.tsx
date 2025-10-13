import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Clock, Target, CheckCircle, XCircle, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

interface TestResultsProps {
  results: {
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    skippedQuestions: number;
    totalMarks: number;
    obtainedMarks: number;
    timeTaken: number;
    answers: Record<string, any>;
    bookmarkedQuestions: string[];
  };
  questions: any[];
  testName: string;
  testType: string;
  onReviewAnswers: () => void;
  onReturnToDashboard: () => void;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  total_marks: number;
  time_taken_seconds: number;
  percentage: number;
  user_id: string;
}

export function TestResults({ results, questions, testName, testType, onReviewAnswers, onReturnToDashboard }: TestResultsProps) {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userPercentile, setUserPercentile] = useState<number | null>(null);
  const [totalAttempts, setTotalAttempts] = useState<number>(0);
  const [top2PercentScore, setTop2PercentScore] = useState<number | null>(null);

  const percentage = results.totalMarks > 0 ? (results.obtainedMarks / results.totalMarks) * 100 : 0;

  // Fetch leaderboard data and calculate analytics
  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!user?.id || !profile?.selected_course_id) return;

      const testIdentifier = `${testType}-${testName.toLowerCase().replace(/\s+/g, '-')}`;
      
      try {
        // Get all leaderboard entries with profiles for names
        const { data: allEntries } = await supabase
          .from('test_leaderboard')
          .select(`
            score,
            total_marks,
            percentage,
            time_taken_seconds,
            completed_at,
            user_id,
            profiles(name)
          `)
          .eq('test_identifier', testIdentifier)
          .eq('course_id', profile.selected_course_id);

        if (allEntries) {
          // Group by user_id and get best entry for each user (highest score)
          const latestUserEntries = new Map();
          
          allEntries.forEach(entry => {
            const existing = latestUserEntries.get(entry.user_id);
            if (!existing || entry.score > existing.score || 
                (entry.score === existing.score && new Date(entry.completed_at) < new Date(existing.completed_at))) {
              latestUserEntries.set(entry.user_id, entry);
            }
          });

          // Convert to array and sort by score (desc), then by time (asc), then by completion time (asc)
          const sortedLeaderboard = Array.from(latestUserEntries.values())
            .sort((a, b) => {
              // First by score (descending)
              if (b.score !== a.score) return b.score - a.score;
              
              // Then by time taken in seconds (ascending - faster is better)
              if (a.time_taken_seconds !== b.time_taken_seconds) {
                return a.time_taken_seconds - b.time_taken_seconds;
              }
              
              // Finally by completion time (ascending - earlier is better)
              return new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime();
            });

          // Set total attempts
          setTotalAttempts(sortedLeaderboard.length);

          // Calculate top 2% score
          if (sortedLeaderboard.length > 0) {
            const top2PercentIndex = Math.ceil(sortedLeaderboard.length * 0.02);
            const top2PercentEntry = sortedLeaderboard[top2PercentIndex - 1];
            setTop2PercentScore(top2PercentEntry?.score || sortedLeaderboard[0].score);
          }

          // Create leaderboard for display - top 10 + user if outside top 10
          const leaderboardForDisplay: LeaderboardEntry[] = [];
          const currentUserIndex = sortedLeaderboard.findIndex(entry => entry.user_id === user.id);
          
          // Add top 10
          sortedLeaderboard.slice(0, 10).forEach((entry, index) => {
            leaderboardForDisplay.push({
              rank: index + 1,
              name: entry.profiles?.name || `User ${entry.user_id.slice(-6)}`,
              score: entry.score,
              total_marks: entry.total_marks,
              time_taken_seconds: entry.time_taken_seconds,
              percentage: entry.percentage,
              user_id: entry.user_id
            });
          });

          // If current user is not in top 10, add them as 11th entry with their actual rank
          if (currentUserIndex >= 10 && currentUserIndex < sortedLeaderboard.length) {
            const userEntry = sortedLeaderboard[currentUserIndex];
            leaderboardForDisplay.push({
              rank: currentUserIndex + 1,
              name: userEntry.profiles?.name || `User ${userEntry.user_id.slice(-6)}`,
              score: userEntry.score,
              total_marks: userEntry.total_marks,
              time_taken_seconds: userEntry.time_taken_seconds,
              percentage: userEntry.percentage,
              user_id: userEntry.user_id
            });
          }

          setLeaderboard(leaderboardForDisplay);

          // Find current user's rank and calculate percentile
          if (currentUserIndex !== -1) {
            const rank = currentUserIndex + 1;
            setUserRank(rank);
            
            // Calculate percentile: percentage of users who scored less than the current user
            const belowCount = sortedLeaderboard.filter(entry => entry.score < results.obtainedMarks).length;
            const percentile = sortedLeaderboard.length > 0 ? (belowCount / sortedLeaderboard.length) * 100 : 0;
            setUserPercentile(percentile);
          }
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };

    fetchLeaderboard();
  }, [user?.id, profile?.selected_course_id, testType, testName, results.obtainedMarks]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeFromMinutes = (minutes: number) => {
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceGrade = () => {
    if (top2PercentScore && results.obtainedMarks >= top2PercentScore) {
      return { grade: "Excellent", color: "text-green-600", message: "Top 2% Performance!" };
    }
    if (percentage >= 80) return { grade: "Very Good", color: "text-green-600", message: "Great job!" };
    if (percentage >= 60) return { grade: "Good", color: "text-yellow-600", message: "Keep improving!" };
    if (percentage >= 40) return { grade: "Average", color: "text-orange-600", message: "More practice needed" };
    return { grade: "Below Average", color: "text-red-600", message: "Focus on fundamentals" };
  };

  const performanceGrade = getPerformanceGrade();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Trophy className="h-12 w-12 text-yellow-500" />
            </div>
            <CardTitle className="text-3xl font-bold">Test Completed!</CardTitle>
            <p className="text-gray-600">{testName}</p>
            <Badge variant="outline" className="mt-2">{testType.toUpperCase()}</Badge>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score */}
              <div className="text-center">
                <div className={`text-4xl font-bold ${getPerformanceColor(percentage)}`}>
                  {results.obtainedMarks.toFixed(1)} / {results.totalMarks}
                </div>
                <div className={`text-2xl ${getPerformanceColor(percentage)}`}>
                  {percentage.toFixed(1)}%
                </div>
                <div className={`text-lg font-semibold ${performanceGrade.color} mt-2`}>
                  {performanceGrade.grade}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {performanceGrade.message}
                </div>
                <Progress 
                  value={percentage} 
                  className="mt-2"
                />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{results.correctAnswers}</div>
                  <div className="text-sm text-gray-600">Correct</div>
                </div>
                
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-600">{results.incorrectAnswers}</div>
                  <div className="text-sm text-gray-600">Incorrect</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Minus className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-600">{results.skippedQuestions}</div>
                  <div className="text-sm text-gray-600">Skipped</div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{formatTimeFromMinutes(results.timeTaken)}</div>
                  <div className="text-sm text-gray-600">Time Taken</div>
                </div>
              </div>

              {/* Rank and Percentile */}
              {userRank && userPercentile !== null && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">#{userRank}</div>
                    <div className="text-sm text-gray-600">Your Rank</div>
                  </div>
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">{userPercentile.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Percentile</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Test Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Test Statistics */}
              <div>
                <h4 className="font-semibold mb-3">Test Statistics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <div className="text-lg font-bold text-blue-600">{totalAttempts}</div>
                    <div className="text-xs text-gray-600">Total Attempts</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded">
                    <div className="text-lg font-bold text-green-600">
                      {((results.correctAnswers / results.totalQuestions) * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-600">Your Accuracy</div>
                  </div>
                </div>
              </div>

              {/* Performance Analysis */}
              <div>
                <h4 className="font-semibold mb-3">Performance Analysis</h4>
                <div className="space-y-3">
                  {top2PercentScore && (
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                      <span className="text-sm font-medium">Top 2% Score</span>
                      <span className="font-bold text-yellow-700">{top2PercentScore.toFixed(1)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Your Performance</span>
                    <span className={`font-bold ${top2PercentScore && results.obtainedMarks >= top2PercentScore ? 'text-green-600' : 'text-orange-600'}`}>
                      {top2PercentScore && results.obtainedMarks >= top2PercentScore ? 'Top 2%' : 'Below Top 2%'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Leaderboard Preview */}
              {leaderboard.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    Leaderboard
                    {totalAttempts >= 500 && (
                      <Badge variant="outline" className="text-xs">{totalAttempts} participants</Badge>
                    )}
                  </h4>
                  <div className="space-y-2">
                    {leaderboard.map((entry) => (
                      <div key={entry.user_id} className={`flex items-center justify-between p-2 rounded text-sm ${
                        entry.user_id === user?.id ? 'bg-blue-100 border border-blue-300' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            entry.rank === 1 ? 'bg-amber-100 text-amber-700' :
                            entry.rank === 2 ? 'bg-gray-100 text-gray-700' :
                            entry.rank === 3 ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-50 text-blue-600'
                          }`}>
                            {entry.rank}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="truncate font-medium">
                              {entry.name}
                              {entry.user_id === user?.id && ' (You)'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatTime(entry.time_taken_seconds)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{entry.score.toFixed(1)}</div>
                          <div className="text-xs text-gray-500">{entry.percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={onReviewAnswers} size="lg" className="flex-1 sm:flex-none">
                Review Answers
              </Button>
              <Button onClick={onReturnToDashboard} variant="outline" size="lg" className="flex-1 sm:flex-none">
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

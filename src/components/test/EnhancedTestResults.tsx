import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Clock, Target, CheckCircle, XCircle, Minus, TrendingUp, BarChart3, PieChart, Users, Zap, Star, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

interface EnhancedTestResultsProps {
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
  onDetailedAnalysis: () => void;
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

interface AnalyticsData {
  averageScore: number;
  topScore: number;
  averageTime: number;
  fastestTime: number;
  totalAttempts: number;
  passRate: number;
  difficultyAnalysis: any;
  subjectAnalysis: any;
}

export function EnhancedTestResults({ 
  results, 
  questions, 
  testName, 
  testType, 
  onDetailedAnalysis, 
  onReturnToDashboard 
}: EnhancedTestResultsProps) {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userPercentile, setUserPercentile] = useState<number | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const percentage = results.totalMarks > 0 ? (results.obtainedMarks / results.totalMarks) * 100 : 0;

  useEffect(() => {
    fetchAnalyticsData();
  }, [user?.id, profile?.selected_course_id, testType, testName]);

  const fetchAnalyticsData = async () => {
    if (!user?.id || !profile?.selected_course_id) return;

    const testIdentifier = `${testType}-${testName.toLowerCase().replace(/\s+/g, '-')}`;
    
    try {
      setLoading(true);

      // Fetch leaderboard data
      const { data: allEntries } = await supabase
        .from('test_leaderboard')
        .select('*')
        .eq('test_identifier', testIdentifier)
        .eq('course_id', profile.selected_course_id)
        .order('score', { ascending: false })
        .order('time_taken_seconds', { ascending: true });

      if (allEntries) {
        // Process leaderboard
        const latestUserEntries = new Map();
        
        allEntries.forEach(entry => {
          const existing = latestUserEntries.get(entry.user_id);
          if (!existing || entry.score > existing.score || 
              (entry.score === existing.score && entry.time_taken_seconds < existing.time_taken_seconds)) {
            latestUserEntries.set(entry.user_id, entry);
          }
        });

        const sortedLeaderboard = Array.from(latestUserEntries.values())
          .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            if (a.time_taken_seconds !== b.time_taken_seconds) {
              return a.time_taken_seconds - b.time_taken_seconds;
            }
            return new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime();
          });

        const leaderboardWithRanks = sortedLeaderboard.map((entry, index) => ({
          rank: index + 1,
          name: entry.name || `User ${entry.user_id.slice(-6)}`,
          score: entry.score,
          total_marks: entry.total_marks,
          time_taken_seconds: entry.time_taken_seconds,
          percentage: entry.percentage,
          user_id: entry.user_id
        }));

        setLeaderboard(leaderboardWithRanks);

        // Calculate user rank and percentile
        const currentUserIndex = leaderboardWithRanks.findIndex(entry => entry.user_id === user.id);
        if (currentUserIndex !== -1) {
          const rank = currentUserIndex + 1;
          setUserRank(rank);
          
          // Calculate percentile: percentage of users who scored less than current user
          const belowCount = leaderboardWithRanks.filter(entry => entry.score < results.obtainedMarks).length;
          const percentile = leaderboardWithRanks.length > 0 ? (belowCount / leaderboardWithRanks.length) * 100 : 0;
          setUserPercentile(percentile);
        }

        // Calculate analytics
        const scores = sortedLeaderboard.map(entry => entry.score);
        const times = sortedLeaderboard.map(entry => entry.time_taken_seconds);
        const percentages = sortedLeaderboard.map(entry => entry.percentage);
        
        const analyticsData: AnalyticsData = {
          averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
          topScore: Math.max(...scores, 0),
          averageTime: times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0,
          fastestTime: Math.min(...times, Infinity) === Infinity ? 0 : Math.min(...times),
          totalAttempts: sortedLeaderboard.length,
          passRate: percentages.filter(p => p >= 60).length / percentages.length * 100,
          difficultyAnalysis: calculateDifficultyAnalysis(),
          subjectAnalysis: calculateSubjectAnalysis()
        };

        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDifficultyAnalysis = () => {
    const correct = results.correctAnswers;
    const total = results.totalQuestions;
    const accuracy = total > 0 ? (correct / total) * 100 : 0;
    
    let difficulty = 'Medium';
    if (accuracy >= 80) difficulty = 'Easy';
    else if (accuracy <= 40) difficulty = 'Hard';
    
    return { accuracy, difficulty };
  };

  const calculateSubjectAnalysis = () => {
    // This would ideally come from question metadata
    return {
      'Mathematics': { attempted: 10, correct: 8 },
      'Physics': { attempted: 8, correct: 6 },
      'Chemistry': { attempted: 7, correct: 5 }
    };
  };

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

  const getPerformanceGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-700 bg-green-100' };
    if (percentage >= 80) return { grade: 'A', color: 'text-green-600 bg-green-50' };
    if (percentage >= 70) return { grade: 'B+', color: 'text-blue-600 bg-blue-50' };
    if (percentage >= 60) return { grade: 'B', color: 'text-blue-500 bg-blue-50' };
    if (percentage >= 50) return { grade: 'C', color: 'text-yellow-600 bg-yellow-50' };
    return { grade: 'F', color: 'text-red-600 bg-red-50' };
  };

  const performanceGrade = getPerformanceGrade(percentage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className={`p-3 rounded-full ${performanceGrade.color}`}>
                <Trophy className="h-8 w-8" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">Test Completed!</CardTitle>
            <p className="text-gray-600">{testName}</p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Badge variant="outline" className="text-lg px-4 py-2">{testType.toUpperCase()}</Badge>
              <Badge className={`text-lg px-4 py-2 ${performanceGrade.color}`}>
                Grade: {performanceGrade.grade}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Summary */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className={`text-5xl font-bold ${getPerformanceColor(percentage)} mb-2`}>
                    {results.obtainedMarks.toFixed(1)} / {results.totalMarks}
                  </div>
                  <div className={`text-3xl ${getPerformanceColor(percentage)} mb-4`}>
                    {percentage.toFixed(1)}%
                  </div>
                  <Progress value={percentage} className="h-3" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

                {userRank && userPercentile !== null && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                      <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-purple-600">#{userRank}</div>
                      <div className="text-sm text-gray-600">Your Rank</div>
                    </div>
                    <div className="text-center p-4 bg-indigo-50 rounded-lg border-2 border-indigo-200">
                      <Star className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-indigo-600">{userPercentile.toFixed(1)}%</div>
                      <div className="text-sm text-gray-600">Percentile</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detailed Analytics */}
            {analytics && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Test Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                      <div className="font-bold text-blue-600">{analytics.averageScore.toFixed(1)}</div>
                      <div className="text-xs text-gray-600">Avg Score</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <Trophy className="h-6 w-6 text-green-600 mx-auto mb-1" />
                      <div className="font-bold text-green-600">{analytics.topScore.toFixed(1)}</div>
                      <div className="text-xs text-gray-600">Top Score</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <Clock className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                      <div className="font-bold text-purple-600">{Math.round(analytics.averageTime / 60)}:{(analytics.averageTime % 60).toFixed(0).padStart(2, '0')}</div>
                      <div className="text-xs text-gray-600">Avg Time</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <Zap className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                      <div className="font-bold text-orange-600">{formatTime(analytics.fastestTime)}</div>
                      <div className="text-xs text-gray-600">Fastest</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-gray-600" />
                        <span className="font-semibold">Test Statistics</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Attempts:</span>
                          <span className="font-bold">{analytics.totalAttempts}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pass Rate (≥60%):</span>
                          <span className="font-bold">{analytics.passRate.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Your Performance:</span>
                          <span className={`font-bold ${getPerformanceColor(percentage)}`}>
                            {percentage >= 60 ? 'Above Average' : 'Needs Improvement'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <PieChart className="h-4 w-4 text-gray-600" />
                        <span className="font-semibold">Difficulty Analysis</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Your Accuracy:</span>
                          <span className="font-bold">{analytics.difficultyAnalysis.accuracy.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Test Difficulty:</span>
                          <span className={`font-bold ${
                            analytics.difficultyAnalysis.difficulty === 'Easy' ? 'text-green-600' :
                            analytics.difficultyAnalysis.difficulty === 'Hard' ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {analytics.difficultyAnalysis.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Leaderboard */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Leaderboard
                {analytics && analytics.totalAttempts >= 500 && (
                  <Badge variant="outline" className="ml-auto">{analytics.totalAttempts} participants</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboard.length > 0 ? (
                <div className="space-y-2">
                  {leaderboard.slice(0, 10).map((entry) => (
                    <div key={entry.user_id} className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                      entry.user_id === user?.id ? 'bg-blue-100 border-2 border-blue-300 transform scale-105' : 'bg-gray-50 hover:bg-gray-100'
                    }`}>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          entry.rank === 1 ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-300' :
                          entry.rank === 2 ? 'bg-gray-100 text-gray-700 ring-2 ring-gray-300' :
                          entry.rank === 3 ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-300' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {entry.rank <= 3 ? (
                            entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'
                          ) : (
                            entry.rank
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="truncate font-medium">
                            {entry.name}
                            {entry.user_id === user?.id && (
                              <Badge variant="secondary" className="ml-2 text-xs">You</Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatTime(entry.time_taken_seconds)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <div className="font-bold">{entry.score.toFixed(1)}</div>
                        <div className="text-xs text-gray-500">{entry.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}

                  {userRank && userRank > 10 && (
                    <>
                      <div className="border-t pt-2 mt-4">
                        <div className="text-xs text-gray-500 text-center mb-2">Your Position</div>
                        {(() => {
                          const userEntry = leaderboard.find(entry => entry.user_id === user?.id);
                          if (!userEntry) return null;
                          return (
                            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-100 border-2 border-blue-300">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 bg-blue-50 text-blue-600">
                                  {userEntry.rank}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="truncate font-medium">
                                    {userEntry.name}
                                    <Badge variant="secondary" className="ml-2 text-xs">You</Badge>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {formatTime(userEntry.time_taken_seconds)}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0 ml-2">
                                <div className="font-bold">{userEntry.score.toFixed(1)}</div>
                                <div className="text-xs text-gray-500">{userEntry.percentage.toFixed(1)}%</div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p>No leaderboard data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={onDetailedAnalysis} size="lg" className="flex-1 sm:flex-none">
                <BarChart3 className="h-4 w-4 mr-2" />
                Detailed Analysis
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

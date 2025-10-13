import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Calendar, BookOpen, Target, Trophy, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { PremiumBadge } from "@/components/ui/premium-badge";

interface TestHistoryItem {
  id: string;
  test_name: string;
  test_type: string;
  mode: string;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  skipped_questions: number;
  total_marks: number;
  obtained_marks: number;
  time_taken_minutes: number;
  completed: boolean;
  created_at: string;
}

interface TestHistoryProps {
  onClose: () => void;
}

export function TestHistory({ onClose }: TestHistoryProps) {
  const [testHistory, setTestHistory] = useState<TestHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useProfile();
  const { user } = useAuth();

  const isPremium = profile?.subscription === 'premium';

  useEffect(() => {
    if (user?.id && profile?.selected_course_id) {
      fetchTestHistory();
    }
  }, [user?.id, profile?.selected_course_id]);

  const fetchTestHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('test_history')
        .select('*')
        .eq('user_id', user?.id)
        .eq('course_id', profile?.selected_course_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestHistory(data || []);
    } catch (error) {
      console.error('Error fetching test history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTestTypeIcon = (testType: string) => {
    switch (testType) {
      case 'chapter-practice':
        return <BookOpen className="h-4 w-4" />;
      case 'chapter-pyq':
        return <Target className="h-4 w-4" />;
      case 'mock':
        return <Trophy className="h-4 w-4" />;
      case 'test-series':
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getTestTypeName = (testType: string) => {
    switch (testType) {
      case 'chapter-practice':
        return 'Chapter Practice';
      case 'chapter-pyq':
        return 'Chapter PYQ';
      case 'mock':
        return 'Mock Test';
      case 'test-series':
        return 'Test Series';
      default:
        return 'Practice Test';
    }
  };

  const getPercentage = (obtained: number, total: number) => {
    return total > 0 ? Math.round((obtained / total) * 100) : 0;
  };

  if (!isPremium) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Test History</h2>
          <p className="text-muted-foreground">Track your performance across all tests</p>
        </div>

        <Card className="bg-gradient-to-r from-premium/10 to-accent/10 border-premium/20">
          <CardHeader className="text-center">
            <PremiumBadge className="mx-auto mb-4" />
            <CardTitle>Premium Feature</CardTitle>
            <CardDescription>
              View detailed test history, analytics, and performance trends to track your progress
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button className="bg-gradient-to-r from-premium to-accent">
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button variant="outline" onClick={onClose}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center">Loading test history...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Test History</h2>
          <p className="text-muted-foreground">
            {testHistory.length} tests completed
          </p>
        </div>
        <Button variant="outline" onClick={onClose}>
          Back to Dashboard
        </Button>
      </div>

      {testHistory.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Test History</h3>
            <p className="text-muted-foreground">
              Complete some tests to see your performance history here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {testHistory.map((test) => {
            const percentage = getPercentage(test.obtained_marks, test.total_marks);
            const accuracy = getPercentage(test.correct_answers, test.total_questions - test.skipped_questions);
            
            return (
              <Card key={test.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {getTestTypeIcon(test.test_type)}
                            <h3 className="font-semibold">{test.test_name}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{getTestTypeName(test.test_type)}</Badge>
                            <Badge variant={test.mode === 'test' ? 'default' : 'secondary'}>
                              {test.mode === 'test' ? 'Test Mode' : 'Practice Mode'}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(test.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {test.time_taken_minutes}m
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Score</span>
                          <span className="font-medium">{test.obtained_marks}/{test.total_marks}</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <div className="text-sm text-muted-foreground text-center">
                          {percentage}%
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-2 bg-green-50 rounded">
                          <div className="text-lg font-bold text-green-600">{test.correct_answers}</div>
                          <div className="text-xs text-green-600">Correct</div>
                        </div>
                        <div className="p-2 bg-red-50 rounded">
                          <div className="text-lg font-bold text-red-600">{test.incorrect_answers}</div>
                          <div className="text-xs text-red-600">Incorrect</div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <div className="text-lg font-bold text-gray-600">{test.skipped_questions}</div>
                          <div className="text-xs text-gray-600">Skipped</div>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-sm text-muted-foreground mb-1">Accuracy</div>
                        <div className="text-lg font-bold">{accuracy}%</div>
                      </div>

                      <Button size="sm" className="w-full" variant="outline">
                        View Analysis
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
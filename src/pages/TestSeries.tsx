
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, Zap } from "lucide-react";
import { PremiumBadge } from "@/components/ui/premium-badge";
import { useTestData } from "@/hooks/useTestData";
import { useProfile } from "@/hooks/useProfile";
import { TestInstructions } from "@/components/test/TestInstructions";
import { TestInterface } from "@/components/test/TestInterface";
import { EnhancedTestResults } from "@/components/test/EnhancedTestResults";
import { DetailedAnswersAnalysis } from "@/components/test/DetailedAnswersAnalysis";
import { FullScreenTestLayout } from "@/components/test/FullScreenTestLayout";
import { DynamicTestButton } from "@/components/test/DynamicTestButton";
import { useTestAttempt } from "@/hooks/useTestAttempt";
import { supabase } from "@/integrations/supabase/client";

type ViewState = 'list' | 'instructions' | 'test' | 'results' | 'analysis';

export function TestSeries() {
  const { testSeries, loading } = useTestData();
  const { profile } = useProfile();
  const { createOrUpdateTestAttempt, getTestAttemptData } = useTestAttempt();
  const [currentView, setCurrentView] = useState<ViewState>('list');
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>(null);

  const isPremium = profile?.subscription === 'premium';

  const handleStartTest = async (testName: string, questions: any[]) => {
    const testData = {
      test_name: testName,
      questions,
      total_time: questions.reduce((sum, q) => sum + q.time_minutes, 0),
      total_marks: questions.reduce((sum, q) => sum + q.correct_marks, 0),
    };
    
    await createOrUpdateTestAttempt(testName, 'test-series', 'in_progress');
    setSelectedTest(testData);
    setCurrentView('instructions');
  };

  const handleContinueTest = async (testName: string, questions: any[]) => {
    const testData = {
      test_name: testName,
      questions,
      total_time: questions.reduce((sum, q) => sum + q.time_minutes, 0),
      total_marks: questions.reduce((sum, q) => sum + q.correct_marks, 0),
    };
    
    // Get existing test attempt data
    const attemptData = getTestAttemptData(testName, 'test-series');
    
    // Set the test with saved state
    setSelectedTest({
      ...testData,
      savedState: attemptData
    });
    setCurrentView('test'); // Skip instructions for continue
  };

  const handleViewAnalysis = async (testName: string, questions: any[]) => {
    // Get the latest test history for this test
    try {
      const { data: testHistory, error } = await supabase
        .from('test_history')
        .select('*')
        .eq('user_id', profile?.user_id)
        .eq('test_name', testName)
        .eq('test_type', 'test-series')
        .eq('completed', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching test history:', error);
        return;
      }

      if (testHistory) {
        const testData = {
          test_name: testName,
          questions,
          total_time: questions.reduce((sum, q) => sum + q.time_minutes, 0),
          total_marks: questions.reduce((sum, q) => sum + q.correct_marks, 0),
        };

        const results = {
          totalQuestions: testHistory.total_questions,
          correctAnswers: testHistory.correct_answers,
          incorrectAnswers: testHistory.incorrect_answers,
          skippedQuestions: testHistory.skipped_questions,
          totalMarks: testHistory.total_marks,
          obtainedMarks: testHistory.obtained_marks,
          timeTaken: testHistory.time_taken_minutes,
          answers: testHistory.answers,
          bookmarkedQuestions: []
        };
        
        setSelectedTest(testData);
        setTestResults(results);
        setCurrentView('analysis');
      }
    } catch (error) {
      console.error('Error loading test analysis:', error);
    }
  };

  const handleStartActualTest = () => {
    setCurrentView('test');
  };

  const handleTestComplete = (results: any) => {
    setTestResults(results);
    setCurrentView('results');
  };

  const handleDetailedAnalysis = () => {
    setCurrentView('analysis');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedTest(null);
    setTestResults(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Full screen views
  if (currentView === 'instructions' && selectedTest) {
    return (
      <FullScreenTestLayout onExit={handleBackToList}>
        <TestInstructions
          testType="test-series"
          testName={selectedTest.test_name}
          mode="test"
          totalQuestions={selectedTest.questions.length}
          totalTime={selectedTest.total_time}
          totalMarks={selectedTest.total_marks}
          syllabus={["Unit-wise topics and concepts"]}
          questionTypes={['MCQ', 'MSQ', 'NAT', 'SUB']}
          markingScheme={{
            correct: 4,
            incorrect: -1,
            skipped: 0,
            partial: 1
          }}
          onStartTest={handleStartActualTest}
          onBack={handleBackToList}
        />
      </FullScreenTestLayout>
    );
  }

  if (currentView === 'test' && selectedTest) {
    return (
      <FullScreenTestLayout onExit={handleBackToList}>
        <TestInterface
          questions={selectedTest.questions}
          mode="test"
          testName={selectedTest.test_name}
          testType="test-series"
          onComplete={handleTestComplete}
          onBack={handleBackToList}
          savedState={selectedTest.savedState}
        />
      </FullScreenTestLayout>
    );
  }

  if (currentView === 'results' && testResults && selectedTest) {
    return (
      <FullScreenTestLayout onExit={handleBackToList}>
        <EnhancedTestResults
          results={testResults}
          questions={selectedTest.questions}
          testName={selectedTest.test_name}
          testType="test-series"
          onDetailedAnalysis={handleDetailedAnalysis}
          onReturnToDashboard={handleBackToList}
        />
      </FullScreenTestLayout>
    );
  }

  if (currentView === 'analysis' && testResults && selectedTest) {
    return (
      <FullScreenTestLayout onExit={handleBackToList}>
        <DetailedAnswersAnalysis
          questions={selectedTest.questions}
          userAnswers={testResults.answers}
          bookmarkedQuestions={testResults.bookmarkedQuestions || []}
          onClose={handleBackToList}
        />
      </FullScreenTestLayout>
    );
  }

  const testSeriesArray = Object.entries(testSeries).map(([testName, questions]) => ({
    test_name: testName,
    questions,
    total_time: questions.reduce((sum, q) => sum + q.time_minutes, 0),
    total_marks: questions.reduce((sum, q) => sum + q.correct_marks, 0),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Test Series</h1>
        <p className="text-muted-foreground">Progressive test series from unit tests to full syllabus mocks</p>
      </div>

      {/* Test Series Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testSeriesArray.map((test, index) => {
          const isFree = index === 0; // First test is free
          const isAccessible = isPremium || isFree;
          
          return (
            <Card key={test.test_name} className={`hover:shadow-lg transition-shadow ${!isAccessible ? 'bg-muted/30' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    <CardTitle className="text-lg">{test.test_name}</CardTitle>
                  </div>
                  {!isAccessible && <PremiumBadge />}
                </div>
                <CardDescription>
                  Unit-wise progressive testing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {test.questions.length} questions
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {test.total_time} min
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                      Test Series
                    </Badge>
                    <Badge variant="outline">
                      {test.total_marks} marks
                    </Badge>
                  </div>
                </div>
                
                <DynamicTestButton
                  testName={test.test_name}
                  testType="test-series"
                  onStartTest={() => handleStartTest(test.test_name, test.questions)}
                  onContinueTest={() => handleContinueTest(test.test_name, test.questions)}
                  onViewAnalysis={() => handleViewAnalysis(test.test_name, test.questions)}
                  disabled={!isAccessible}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {testSeriesArray.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No test series available for your selected course.</p>
          </CardContent>
        </Card>
      )}

      {/* Learning Path */}
      <Card>
        <CardHeader>
          <CardTitle>Test Series Learning Path</CardTitle>
          <CardDescription>Follow this progressive path for optimal preparation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
              <div>
                <div className="font-medium">Unit Tests</div>
                <div className="text-sm text-muted-foreground">Master individual topics with focused unit tests</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
              <div>
                <div className="font-medium">Mid-Term Tests</div>
                <div className="text-sm text-muted-foreground">Combine multiple units to test integrated knowledge</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
              <div>
                <div className="font-medium">Final Mock Tests</div>
                <div className="text-sm text-muted-foreground">Complete syllabus tests for final preparation</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Section */}
      <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-200">
        <CardHeader>
          <CardTitle>Test Series Benefits</CardTitle>
          <CardDescription>Structured approach to exam preparation with progressive difficulty</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">Progressive difficulty levels</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">Comprehensive analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">Topic-wise performance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">Adaptive learning path</span>
            </div>
          </div>
          {!isPremium && (
            <Button className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
              Access Complete Test Series
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

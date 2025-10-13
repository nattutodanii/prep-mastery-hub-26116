
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, Calendar } from "lucide-react";
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

export function PYPTests() {
  const { pypTests, loading } = useTestData();
  const { profile } = useProfile();
  const { createOrUpdateTestAttempt, getTestAttemptData } = useTestAttempt();
  const [currentView, setCurrentView] = useState<ViewState>('list');
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>(null);

  const isPremium = profile?.subscription === 'premium';

  const handleStartTest = async (test: any) => {
    await createOrUpdateTestAttempt(`Past Year Paper ${test.year}`, 'pyp', 'in_progress');
    setSelectedTest(test);
    setCurrentView('instructions');
  };

  const handleContinueTest = async (test: any) => {
    const attemptData = getTestAttemptData(`Past Year Paper ${test.year}`, 'pyp');
    
    setSelectedTest({
      ...test,
      savedState: attemptData
    });
    setCurrentView('test');
  };

  const handleViewAnalysis = async (test: any) => {
    try {
      const { data: testHistory, error } = await supabase
        .from('test_history')
        .select('*')
        .eq('user_id', profile?.user_id)
        .eq('test_name', `Past Year Paper ${test.year}`)
        .eq('test_type', 'pyp')
        .eq('completed', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching test history:', error);
        return;
      }

      if (testHistory) {
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
        
        setSelectedTest(test);
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
          testType="pyp"
          testName={`Past Year Paper ${selectedTest.year}`}
          mode="test"
          totalQuestions={selectedTest.questions.length}
          totalTime={selectedTest.total_time}
          totalMarks={selectedTest.total_marks}
          syllabus={["Complete syllabus coverage"]}
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
          testName={`Past Year Paper ${selectedTest.year}`}
          testType="pyp"
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
          testName={`Past Year Paper ${selectedTest.year}`}
          testType="pyp"
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Full Length PYP Papers</h1>
        <p className="text-muted-foreground">Practice with authentic previous year papers</p>
      </div>

      {/* PYP Tests Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pypTests.map((test, index) => {
          const isFree = index === 0; // First test is free
          const isAccessible = isPremium || isFree;
          
          return (
            <Card key={test.year} className={`hover:shadow-lg transition-shadow ${!isAccessible ? 'bg-muted/30' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">Past Year Paper {test.year}</CardTitle>
                  </div>
                  {!isAccessible && <PremiumBadge />}
                </div>
                <CardDescription>
                  Authentic previous year question paper
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
                    <Badge variant="outline" className="text-blue-600 border-blue-600">
                      {test.year}
                    </Badge>
                    <Badge variant="outline">
                      {test.total_marks} marks
                    </Badge>
                  </div>
                </div>
                
                <DynamicTestButton
                  testName={`Past Year Paper ${test.year}`}
                  testType="pyp"
                  onStartTest={() => handleStartTest(test)}
                  onContinueTest={() => handleContinueTest(test)}
                  onViewAnalysis={() => handleViewAnalysis(test)}
                  disabled={!isAccessible}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {pypTests.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No PYP tests available for your selected course.</p>
          </CardContent>
        </Card>
      )}

      {/* Features Section */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-200">
        <CardHeader>
          <CardTitle>Previous Year Papers</CardTitle>
          <CardDescription>Practice with authentic exam papers to understand patterns and difficulty</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Authentic question papers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Detailed solutions included</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Pattern analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Performance tracking</span>
            </div>
          </div>
          {!isPremium && (
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              Access All PYP Papers
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

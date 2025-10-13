import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Clock, Target, Trash2 } from "lucide-react";
import { useBookmarkedQuestions } from "@/hooks/useBookmarkedQuestions";
import { useToast } from "@/hooks/use-toast";
import { TestInstructions } from "@/components/test/TestInstructions";
import { TestInterface } from "@/components/test/TestInterface";
import { EnhancedTestResults } from "@/components/test/EnhancedTestResults";
import { DetailedAnswersAnalysis } from "@/components/test/DetailedAnswersAnalysis";
import { FullScreenTestLayout } from "@/components/test/FullScreenTestLayout";

interface BookmarkedQuestionsProps {
  onClose: () => void;
}

type ViewState = 'list' | 'instructions' | 'test' | 'results' | 'analysis';

export function BookmarkedQuestions({ onClose }: BookmarkedQuestionsProps) {
  const { bookmarkedTests, loading, removeBookmark, refetch } = useBookmarkedQuestions();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<ViewState>('list');
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>(null);

  const handleRemoveBookmark = async (questionId: string) => {
    try {
      const success = await removeBookmark(questionId);
      if (success) {
        toast({
          title: "Bookmark removed",
          description: "Question has been removed from bookmarks",
        });
        await refetch();
      } else {
        throw new Error("Failed to remove bookmark");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove bookmark",
        variant: "destructive",
      });
    }
  };

  const handleStartTest = (test: any) => {
    const testData = {
      test_name: `${test.test_name} (Bookmarked)`,
      questions: test.questions,
      total_time: test.questions.length * 2, // 2 minutes per question
      total_marks: test.questions.reduce((sum: number, q: any) => sum + (q.correct_marks || 4), 0),
      original_test_name: test.test_name,
      original_test_type: test.test_type,
      chapter_id: test.chapter_id
    };
    setSelectedTest(testData);
    setCurrentView('instructions');
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

  // Full screen views
  if (currentView === 'instructions' && selectedTest) {
    return (
      <FullScreenTestLayout onExit={handleBackToList}>
        <TestInstructions
          testType={selectedTest.original_test_type}
          testName={selectedTest.test_name}
          mode="practice"
          totalQuestions={selectedTest.questions.length}
          totalTime={selectedTest.total_time}
          totalMarks={selectedTest.total_marks}
          syllabus={["Bookmarked questions from your practice"]}
          questionTypes={['MCQ', 'MSQ', 'NAT', 'SUB']}
          markingScheme={{
            correct: 4,
            incorrect: 0, // No negative marking in practice
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
          mode="practice"
          testName={selectedTest.test_name}
          testType={selectedTest.original_test_type}
          chapterId={selectedTest.chapter_id}
          onComplete={handleTestComplete}
          onBack={handleBackToList}
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
          testType="practice"
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading bookmarked questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Bookmarked Questions</h2>
            <p className="text-muted-foreground">Practice your saved questions anytime</p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-semibold text-blue-900">How Bookmarked Questions Work</h3>
              <p className="text-sm text-blue-700">
                When you bookmark questions during tests, they're saved here organized by test. 
                Each bookmarked test contains only the questions you marked. You can practice 
                these questions anytime in practice mode with no time limits.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookmarked Tests */}
      {bookmarkedTests.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No Bookmarked Questions Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start taking tests and bookmark questions you want to review later.
            </p>
            <Button onClick={onClose}>
              Go to Tests
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookmarkedTests.map((test, index) => (
            <Card key={`${test.test_type}-${test.test_id}-${index}`} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{test.test_name}</CardTitle>
                    <CardDescription>
                      {test.test_type.replace('_', ' ').toUpperCase()} • {test.chapter_id ? 'Chapter Practice' : 'Full Length'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {test.question_count} questions
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Question List */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Bookmarked Questions:</h4>
                  <div className="grid gap-2 max-h-32 overflow-y-auto">
                    {test.questions.map((question, qIndex) => (
                      <div key={question.id} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                        <span>Q{qIndex + 1}: {question.question_statement?.slice(0, 60)}...</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveBookmark(question.id)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-between items-center pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Practice Mode • No Time Limit
                  </div>
                  <Button
                    onClick={() => handleStartTest(test)}
                    className="text-sm px-3 py-1"
                  >
                    Start Practice
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

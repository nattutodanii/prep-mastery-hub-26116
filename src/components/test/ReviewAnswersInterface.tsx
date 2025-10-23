import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Bookmark, X } from "lucide-react";
import { LaTeXRenderer } from "./LaTeXRenderer";
import { DiagramRenderer } from "./DiagramRenderer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Question {
  id: string;
  question_statement: string;
  question_type: 'MCQ' | 'MSQ' | 'NAT' | 'SUB';
  options?: string[] | null;
  answer: string;
  solution: string;
  correct_marks: number;
  incorrect_marks: number;
  skipped_marks: number;
  partial_marks?: number;
  time_minutes: number;
  diagram_json?: any;
}

interface ReviewAnswersInterfaceProps {
  questions: Question[];
  userAnswers: Record<string, any>;
  bookmarkedQuestions: string[];
  onClose: () => void;
}

export function ReviewAnswersInterface({ 
  questions, 
  userAnswers, 
  bookmarkedQuestions: initialBookmarks,
  onClose 
}: ReviewAnswersInterfaceProps) {
  const { user } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<string[]>(initialBookmarks);

  const currentQuestion = questions[currentQuestionIndex];
  const userAnswer = userAnswers[currentQuestion.id];

  const handleBookmark = async () => {
    if (!user) return;

    const isBookmarked = bookmarkedQuestions.includes(currentQuestion.id);
    
    if (isBookmarked) {
      const { error } = await supabase
        .from('bookmarked_questions')
        .delete()
        .eq('user_id', user.id)
        .eq('question_id', currentQuestion.id);
      
      if (!error) {
        setBookmarkedQuestions(prev => prev.filter(id => id !== currentQuestion.id));
      }
    } else {
      const { error } = await supabase
        .from('bookmarked_questions')
        .insert({
          user_id: user.id,
          question_id: currentQuestion.id,
          test_type: 'chapter_questions',
          test_id: 'review_session',
          course_id: user.id
        });
      
      if (!error) {
        setBookmarkedQuestions(prev => [...prev, currentQuestion.id]);
      }
    }
  };

  const isCorrect = () => {
    if (!userAnswer) return false;
    
    const correctAnswer = currentQuestion.answer;
    
    if (currentQuestion.question_type === 'MSQ') {
      const userAnswers = Array.isArray(userAnswer) ? userAnswer : [];
      const correctAnswers = Array.isArray(correctAnswer) ? correctAnswer : JSON.parse(correctAnswer);
      return userAnswers.length === correctAnswers.length && 
             userAnswers.every(ans => correctAnswers.includes(ans));
    } else {
      return String(userAnswer).toLowerCase() === String(correctAnswer).toLowerCase();
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleQuestionNavigation = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const getQuestionStatus = (index: number) => {
    const question = questions[index];
    const answer = userAnswers[question.id];
    
    if (index === currentQuestionIndex) return 'current';
    if (!answer) return 'unanswered';
    if (bookmarkedQuestions.includes(question.id)) return 'bookmarked';
    return 'answered';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current': return 'bg-blue-500 text-white';
      case 'answered': return 'bg-green-500 text-white';
      case 'bookmarked': return 'bg-red-500 text-white';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  const renderUserAnswer = () => {
    if (!userAnswer) {
      return <div className="text-sm text-muted-foreground">Not answered</div>;
    }

    if (currentQuestion.question_type === 'MCQ') {
      return (
        <div className="text-sm">
          <LaTeXRenderer content={String(userAnswer)} />
        </div>
      );
    }

    if (currentQuestion.question_type === 'MSQ') {
      const answers = Array.isArray(userAnswer) ? userAnswer : [];
      return (
        <div className="text-sm space-y-1">
          {answers.map((ans, index) => (
            <div key={index}>
              <LaTeXRenderer content={ans} />
            </div>
          ))}
        </div>
      );
    }

    if (currentQuestion.question_type === 'NAT') {
      return (
        <div className="text-sm">
          <LaTeXRenderer content={String(userAnswer)} />
        </div>
      );
    }

    if (currentQuestion.question_type === 'SUB') {
      return (
        <div className="text-sm">
          {userAnswer === 'attempted' ? 'I attempted this question' : 'I didn\'t attempt this question'}
        </div>
      );
    }

    return <div className="text-sm">{String(userAnswer)}</div>;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Main Question Area */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Review Answers</h1>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {currentQuestionIndex + 1} / {questions.length}
              </span>
            </div>
            <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} />
          </div>

          {/* Question Content */}
          <div className="space-y-6">
            {/* Question Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="outline">Question {currentQuestionIndex + 1}</Badge>
                <Badge variant="secondary">{currentQuestion.question_type}</Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <span>+{currentQuestion.correct_marks}</span>
                  {currentQuestion.incorrect_marks !== 0 && (
                    <span>, {currentQuestion.incorrect_marks}</span>
                  )}
                  {currentQuestion.skipped_marks !== 0 && (
                    <span>, {currentQuestion.skipped_marks}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Question Statement */}
            <Card>
              <CardContent className="pt-6">
                <LaTeXRenderer 
                  content={currentQuestion.question_statement}
                  className="text-base leading-relaxed"
                />
                
                {/* Diagram Renderer */}
                {currentQuestion.diagram_json && (
                  <DiagramRenderer 
                    diagramData={currentQuestion.diagram_json} 
                    className="mt-4"
                  />
                )}
              </CardContent>
            </Card>

            {/* Options Display (if applicable) */}
            {(currentQuestion.question_type === 'MCQ' || currentQuestion.question_type === 'MSQ') && currentQuestion.options && (
              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-3">Options:</h4>
                  <div className="space-y-2">
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 rounded border">
                        <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                        <LaTeXRenderer content={option} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* User's Previous Answer */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">Your Previous Answer:</h4>
                {renderUserAnswer()}
              </CardContent>
            </Card>

            {/* Correct Answer & Solution */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={isCorrect() ? 'default' : 'destructive'}>
                      {isCorrect() ? 'Correct!' : 'Incorrect'}
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Correct Answer:</h4>
                    <div className="bg-white p-3 rounded border">
                      <LaTeXRenderer content={currentQuestion.answer} className="text-sm" />
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Solution:</h4>
                    <LaTeXRenderer 
                      content={currentQuestion.solution} 
                      className="text-sm leading-relaxed"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                <Button variant="outline" onClick={handleBookmark}>
                  <Bookmark 
                    className={`h-4 w-4 mr-2 ${bookmarkedQuestions.includes(currentQuestion.id) ? 'fill-current' : ''}`} 
                  />
                  {bookmarkedQuestions.includes(currentQuestion.id) ? 'Bookmarked' : 'Bookmark'}
                </Button>
              </div>

              <Button onClick={handleNext} disabled={currentQuestionIndex === questions.length - 1}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Navigation */}
      <div className="w-80 bg-white border-l border-gray-200 p-6">
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-4">Question Navigation</h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, index) => {
                const status = getQuestionStatus(index);
                return (
                  <button
                    key={index}
                    onClick={() => handleQuestionNavigation(index)}
                    className={`w-10 h-10 rounded text-sm font-medium transition-colors ${getStatusColor(status)}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <h4 className="font-semibold">Legend:</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>Current Question</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Bookmarked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <span>Not Answered</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

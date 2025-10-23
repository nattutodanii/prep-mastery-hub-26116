
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Bookmark, X } from "lucide-react";
import { LaTeXRenderer } from "./LaTeXRenderer";
import { DiagramRenderer } from "./DiagramRenderer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

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
  part?: string;
  diagram_json?: any;
}

interface DetailedAnswersAnalysisProps {
  questions: Question[];
  userAnswers: Record<string, any>;
  bookmarkedQuestions: string[];
  onClose: () => void;
}

export function DetailedAnswersAnalysis({ 
  questions, 
  userAnswers, 
  bookmarkedQuestions = [], 
  onClose 
}: DetailedAnswersAnalysisProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedPart, setSelectedPart] = useState<string>('');
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set(bookmarkedQuestions));
  const [showSolution, setShowSolution] = useState(false);
  const [testParts, setTestParts] = useState<string[]>([]);
  const { user } = useAuth();
  const { profile } = useProfile();

  // Get unique parts from questions and sort them
  useEffect(() => {
    const uniqueParts = [...new Set(questions.map(q => q.part).filter(Boolean))].sort();
    setTestParts(uniqueParts);
    if (uniqueParts.length > 0) {
      setSelectedPart(uniqueParts[0]);
    }
  }, [questions]);

  // Filter questions by selected part
  const filteredQuestions = selectedPart 
    ? questions.filter(q => q.part === selectedPart)
    : questions;
  
  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const userAnswer = currentQuestion ? userAnswers[currentQuestion.id] : null;

  const handlePartChange = (part: string) => {
    setSelectedPart(part);
    setCurrentQuestionIndex(0);
    setShowSolution(false);
  };

  const handleQuestionNavigation = (index: number) => {
    setCurrentQuestionIndex(index);
    setShowSolution(false);
  };

  const handleNext = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowSolution(false);
    } else {
      // Check if there's a next part
      const currentPartIdx = testParts.indexOf(selectedPart);
      if (currentPartIdx < testParts.length - 1) {
        setSelectedPart(testParts[currentPartIdx + 1]);
        setCurrentQuestionIndex(0);
        setShowSolution(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowSolution(false);
    } else {
      // Check if there's a previous part
      const currentPartIdx = testParts.indexOf(selectedPart);
      if (currentPartIdx > 0) {
        const prevPart = testParts[currentPartIdx - 1];
        const prevPartQuestions = questions.filter(q => q.part === prevPart);
        setSelectedPart(prevPart);
        setCurrentQuestionIndex(prevPartQuestions.length - 1);
        setShowSolution(false);
      }
    }
  };

  const handleBookmark = async () => {
    if (currentQuestion && user?.id && profile?.selected_course_id) {
      const isCurrentlyBookmarked = bookmarks.has(currentQuestion.id);
      const newBookmarks = new Set(bookmarks);
      
      if (isCurrentlyBookmarked) {
        newBookmarks.delete(currentQuestion.id);
      } else {
        newBookmarks.add(currentQuestion.id);
      }
      
      setBookmarks(newBookmarks);

      try {
        if (!isCurrentlyBookmarked) {
          await supabase
            .from('bookmarked_questions')
            .insert({
              user_id: user.id,
              course_id: profile.selected_course_id,
              question_id: currentQuestion.id,
              test_type: currentQuestion.question_type,
              test_id: 'detailed_analysis'
            });
        } else {
          await supabase
            .from('bookmarked_questions')
            .delete()
            .eq('user_id', user.id)
            .eq('question_id', currentQuestion.id);
        }
      } catch (error) {
        console.error('Error updating bookmark:', error);
        // Revert on error
        setBookmarks(bookmarks);
      }
    }
  };

  const getQuestionStatus = (index: number) => {
    const question = filteredQuestions[index];
    const answer = userAnswers[question?.id];
    
    if (index === currentQuestionIndex) return 'current';
    if (bookmarks.has(question?.id)) return 'bookmarked';
    if (!answer) return 'unanswered';
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

  const getAnswerResult = () => {
    if (!currentQuestion || !userAnswer) return null;

    const correctAnswer = currentQuestion.answer;
    let isCorrect = false;

    if (currentQuestion.question_type === 'MSQ') {
      const userAnswers = Array.isArray(userAnswer) ? userAnswer : [];
      const correctAnswers = Array.isArray(correctAnswer) ? correctAnswer : JSON.parse(correctAnswer);
      isCorrect = userAnswers.length === correctAnswers.length && 
                 userAnswers.every(ans => correctAnswers.includes(ans));
    } else {
      isCorrect = String(userAnswer).toLowerCase() === String(correctAnswer).toLowerCase();
    }

    return isCorrect;
  };

  const renderUserAnswer = () => {
    if (!userAnswer) return "Not Attempted";

    if (currentQuestion?.question_type === 'MSQ') {
      const answers = Array.isArray(userAnswer) ? userAnswer : [];
      return answers.join(', ') || "Not Attempted";
    }

    return String(userAnswer);
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Questions Available</h2>
          <Button onClick={onClose}>Return to Results</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Main Content Area */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Detailed Answers Analysis</h1>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Close Analysis
            </Button>
          </div>

          {/* Question Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Badge variant="outline">Question {currentQuestionIndex + 1}</Badge>
              <Badge variant="secondary">{currentQuestion.question_type}</Badge>
              {selectedPart && <Badge variant="outline">Part: {selectedPart}</Badge>}
            </div>
            
            <Button
              variant="outline"
              onClick={handleBookmark}
              className="flex items-center gap-2"
            >
              <Bookmark className={`h-4 w-4 ${bookmarks.has(currentQuestion.id) ? 'fill-current text-red-500' : ''}`} />
              {bookmarks.has(currentQuestion.id) ? 'Bookmarked' : 'Bookmark'}
            </Button>
          </div>

          {/* Question Statement */}
          <Card className="mb-6">
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

          {/* Answer Options (for display only) */}
          {currentQuestion.options && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 rounded border">
                      <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <LaTeXRenderer content={option} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Your Response */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Your Response
                <Badge variant={getAnswerResult() === true ? 'default' : getAnswerResult() === false ? 'destructive' : 'secondary'}>
                  {getAnswerResult() === true ? 'Correct' : getAnswerResult() === false ? 'Incorrect' : 'Not Attempted'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <LaTeXRenderer content={renderUserAnswer()} className="text-base" />
              </div>
            </CardContent>
          </Card>

          {/* Show Answer Button */}
          {!showSolution && (
            <div className="text-center mb-6">
              <Button onClick={() => setShowSolution(true)} size="lg">
                Check Answer & Solution
              </Button>
            </div>
          )}

          {/* Correct Answer & Solution */}
          {showSolution && (
            <>
              <Card className="mb-6 border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-lg text-green-800">Correct Answer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-white rounded border">
                    <LaTeXRenderer content={currentQuestion.answer} className="text-base" />
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Detailed Solution</CardTitle>
                </CardHeader>
                <CardContent>
                  <LaTeXRenderer 
                    content={currentQuestion.solution} 
                    className="text-base leading-relaxed"
                  />
                </CardContent>
              </Card>
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={handlePrevious} 
              disabled={currentQuestionIndex === 0 && testParts.indexOf(selectedPart) === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleNext}
              disabled={
                currentQuestionIndex === filteredQuestions.length - 1 && 
                testParts.indexOf(selectedPart) === testParts.length - 1
              }
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Navigation */}
      <div className="w-80 bg-white border-l border-gray-200 p-6">
        <div className="space-y-6">
          {/* Parts Selector */}
          {testParts.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Test Parts</h3>
              <Select value={selectedPart} onValueChange={handlePartChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select part" />
                </SelectTrigger>
                <SelectContent>
                  {testParts.map((part) => (
                    <SelectItem key={part} value={part}>
                      {part}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-4">Question Navigation</h3>
            <div className="grid grid-cols-5 gap-2">
              {filteredQuestions.map((_, index) => {
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

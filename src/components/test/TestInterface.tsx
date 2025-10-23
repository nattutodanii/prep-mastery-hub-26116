import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, ChevronLeft, ChevronRight, Flag, Send, Calculator as CalculatorIcon, Trophy, PanelRightOpen, PanelRightClose } from "lucide-react";
import { LaTeXRenderer } from "./LaTeXRenderer";
import { DiagramRenderer } from "./DiagramRenderer";
import { Calculator } from "@/components/ui/calculator";
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

interface TestInterfaceProps {
  questions: Question[];
  mode: 'practice' | 'test';
  testName: string;
  testType?: string;
  chapterId?: string;
  onComplete: (results: any) => void;
  onBack: () => void;
  savedState?: any;
}

interface Answer {
  questionId: string;
  answer: string | string[];
  isCorrect?: boolean;
  isBookmarked?: boolean;
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

export function TestInterface({ questions, mode, testName, testType = 'practice', chapterId, onComplete, onBack, savedState }: TestInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(savedState?.currentQuestion || 0);
  const [answers, setAnswers] = useState<Record<string, Answer>>(savedState?.answersState ? JSON.parse(savedState.answersState) : {});
  const [timeRemaining, setTimeRemaining] = useState(
    savedState?.remainingTime || (mode === 'test' ? questions.reduce((sum, q) => sum + q.time_minutes, 0) * 60 : 0)
  );
  const [showSolution, setShowSolution] = useState(false);
  const [testStartTime] = useState(Date.now());
  const [selectedPart, setSelectedPart] = useState<string>('');
  const [showCalculator, setShowCalculator] = useState(false);
  const [isCalculatorEnabled, setIsCalculatorEnabled] = useState(false);
  const [testParts, setTestParts] = useState<string[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const { user } = useAuth();
  const { profile } = useProfile();

  const [testAttemptId, setTestAttemptId] = useState<string | null>(null);

  // Get unique parts from questions and sort them
  useEffect(() => {
    const uniqueParts = [...new Set(questions.map(q => q.part).filter(Boolean))].sort();
    setTestParts(uniqueParts);
    if (uniqueParts.length > 0) {
      setSelectedPart(uniqueParts[0]);
    }
  }, [questions]);

  // Create test attempt on component mount
  useEffect(() => {
    createTestAttempt();
  }, []);

  // Handle page unload/beforeunload to save state
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!testCompleted && mode === 'test') {
        e.preventDefault();
        e.returnValue = '';
        saveTestState();
      }
    };

    const handleUnload = () => {
      if (!testCompleted) {
        saveTestState();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, [testCompleted, answers, currentQuestionIndex, timeRemaining, mode]);

  const createTestAttempt = async () => {
    if (!user?.id || !profile?.selected_course_id) return;

    const testIdentifier = `${testType}-${testName.toLowerCase().replace(/\s+/g, '-')}`;
    
    try {
      const { data, error } = await supabase
        .from('test_attempts')
        .insert({
          user_id: user.id,
          course_id: profile.selected_course_id,
          chapter_id: chapterId || null,
          test_name: testName,
          test_type: testType,
          test_identifier: testIdentifier,
          status: 'in_progress',
          attempt_count: 1,
          current_question: currentQuestionIndex,
          remaining_time: timeRemaining,
          answers_state: JSON.stringify(answers),
          last_attempt_date: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      setTestAttemptId(data.id);
    } catch (error) {
      console.error('Error creating test attempt:', error);
    }
  };

  // Fetch course settings
  useEffect(() => {
    const fetchCourseSettings = async () => {
      if (profile?.selected_course_id) {
        const { data: course } = await supabase
          .from('courses')
          .select('is_calculator')
          .eq('id', profile.selected_course_id)
          .single();

        if (course) {
          setIsCalculatorEnabled(course.is_calculator || false);
        }
      }
    };

    fetchCourseSettings();
  }, [profile?.selected_course_id]);

  // Timer for test mode
  useEffect(() => {
    if (mode === 'test' && timeRemaining > 0 && !testCompleted) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            console.log('Timer expired, auto-submitting test');
            // Use setTimeout to prevent state update issues
            setTimeout(() => handleSubmitTest(), 100);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [mode, timeRemaining, testCompleted]);

  // Save test state periodically
  useEffect(() => {
    if (mode === 'test' && testAttemptId && Object.keys(answers).length > 0 && !testCompleted) {
      const saveInterval = setInterval(() => {
        saveTestState();
      }, 30000); // Save every 30 seconds

      return () => clearInterval(saveInterval);
    }
  }, [answers, currentQuestionIndex, timeRemaining, testAttemptId, mode, testCompleted]);

  const fetchLeaderboard = async () => {
    if (!user?.id || !profile?.selected_course_id) return;

    const testIdentifier = `${testType}-${testName.toLowerCase().replace(/\s+/g, '-')}`;
    
    try {
      console.log('Fetching leaderboard for:', testIdentifier);
      
      const { data: allEntries, error } = await supabase
        .from('test_leaderboard')
        .select(`
          *,
          profiles(name)
        `)
        .eq('test_identifier', testIdentifier)
        .eq('course_id', profile.selected_course_id)
        .order('score', { ascending: false })
        .order('time_taken_seconds', { ascending: true })
        .order('completed_at', { ascending: true });

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return;
      }

      if (allEntries && allEntries.length > 0) {
        // Group by user_id and get best entry for each user
        const latestUserEntries = new Map();
        
        allEntries.forEach(entry => {
          const existing = latestUserEntries.get(entry.user_id);
          if (!existing || entry.score > existing.score || 
              (entry.score === existing.score && entry.time_taken_seconds < existing.time_taken_seconds)) {
            latestUserEntries.set(entry.user_id, entry);
          }
        });

        // Convert to array and sort properly
        const sortedLeaderboard = Array.from(latestUserEntries.values())
          .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            if (a.time_taken_seconds !== b.time_taken_seconds) {
              return a.time_taken_seconds - b.time_taken_seconds;
            }
            return new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime();
          });

        // Create leaderboard with proper ranking - top 10 + user if outside top 10
        const leaderboardWithRanks: LeaderboardEntry[] = [];
        const currentUserIndex = sortedLeaderboard.findIndex(entry => entry.user_id === user.id);
        
        // Add top 10
        sortedLeaderboard.slice(0, 10).forEach((entry, index) => {
          leaderboardWithRanks.push({
            rank: index + 1,
            name: entry.profiles?.name || entry.name || `User ${entry.user_id.slice(-6)}`,
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
          leaderboardWithRanks.push({
            rank: currentUserIndex + 1,
            name: userEntry.profiles?.name || userEntry.name || `User ${userEntry.user_id.slice(-6)}`,
            score: userEntry.score,
            total_marks: userEntry.total_marks,
            time_taken_seconds: userEntry.time_taken_seconds,
            percentage: userEntry.percentage,
            user_id: userEntry.user_id
          });
        }

        setLeaderboard(leaderboardWithRanks);
      } else {
        setLeaderboard([]);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboard([]);
    }
  };

  const saveTestState = async () => {
    if (!user?.id || !profile?.selected_course_id || !testAttemptId) return;

    try {
      const answersForStorage = JSON.stringify(answers);
      
      await supabase
        .from('test_attempts')
        .update({
          current_question: currentQuestionIndex,
          answers_state: answersForStorage as any,
          remaining_time: timeRemaining,
          status: 'in_progress',
          last_attempt_date: new Date().toISOString()
        })
        .eq('id', testAttemptId);
    } catch (error) {
      console.error('Error saving test state:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeMinutes = (minutes: number) => {
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    return `${mins} Min ${secs} Sec`;
  };

  const calculatePercentile = (userScore: number, allScores: number[]) => {
    const belowCount = allScores.filter(score => score < userScore).length;
    return allScores.length > 0 ? (belowCount / allScores.length) * 100 : 0;
  };

  const getCurrentUserRankAndPercentile = () => {
    if (!user?.id || leaderboard.length === 0) return { rank: 0, percentile: 0 };
    
    const currentUserIndex = leaderboard.findIndex(entry => entry.user_id === user.id);
    if (currentUserIndex === -1) return { rank: 0, percentile: 0 };
    
    const rank = currentUserIndex + 1;
    const allScores = leaderboard.map(entry => entry.score);
    const userScore = leaderboard[currentUserIndex].score;
    const percentile = calculatePercentile(userScore, allScores);
    
    return { rank, percentile };
  };

  const handleAnswerChange = (answer: string | string[]) => {
    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      answer,
      isBookmarked: currentAnswer?.isBookmarked || false,
    };

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: newAnswer
    }));

    // Save state immediately when answer changes in test mode
    if (mode === 'test') {
      setTimeout(saveTestState, 1000);
    }
  };

  const handleCheckAnswer = () => {
    if (mode === 'practice' && currentAnswer) {
      const correctAnswer = currentQuestion.answer;
      let isCorrect = false;

      if (currentQuestion.question_type === 'MSQ') {
        const userAnswers = Array.isArray(currentAnswer.answer) ? currentAnswer.answer : [];
        const correctAnswers = Array.isArray(correctAnswer) ? correctAnswer : JSON.parse(correctAnswer);
        isCorrect = userAnswers.length === correctAnswers.length && 
                   userAnswers.every(ans => correctAnswers.includes(ans));
      } else {
        isCorrect = String(currentAnswer.answer).toLowerCase() === String(correctAnswer).toLowerCase();
      }

      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: {
          ...prev[currentQuestion.id],
          isCorrect
        }
      }));

      setShowSolution(true);
    }
  };

  const handleBookmark = async () => {
    if (!user?.id || !profile?.selected_course_id) return;

    const isCurrentlyBookmarked = currentAnswer?.isBookmarked || false;
    const newBookmarkState = !isCurrentlyBookmarked;
    
    // Update local state immediately for better UX
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        questionId: currentQuestion.id,
        answer: prev[currentQuestion.id]?.answer || '',
        isBookmarked: newBookmarkState
      }
    }));

    try {
      if (newBookmarkState) {
        await supabase
          .from('bookmarked_questions')
          .insert({
            user_id: user.id,
            course_id: profile.selected_course_id,
            chapter_id: chapterId || null,
            question_id: currentQuestion.id,
            test_type: testType,
            test_id: testName.toLowerCase().replace(/\s+/g, '-')
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
      // Revert local state if API call failed
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: {
          ...prev[currentQuestion.id],
          isBookmarked: isCurrentlyBookmarked
        }
      }));
    }
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

  const handleQuestionNavigation = (index: number) => {
    setCurrentQuestionIndex(index);
    setShowSolution(false);
  };

  const handlePartChange = (part: string) => {
    setSelectedPart(part);
    setCurrentQuestionIndex(0);
    setShowSolution(false);
  };

  const isLastQuestionOfTest = () => {
    const currentPartIdx = testParts.indexOf(selectedPart);
    return currentPartIdx === testParts.length - 1 && currentQuestionIndex === filteredQuestions.length - 1;
  };

  const handleSubmitTest = async () => {
    console.log('handleSubmitTest called, testCompleted:', testCompleted);
    
    if (testCompleted) {
      console.log('Test already completed, returning');
      return; // Prevent multiple submissions
    }
    
    console.log('Setting testCompleted to true');
    setTestCompleted(true);
    
    const timeTaken = Math.floor((Date.now() - testStartTime) / 1000 / 60);
    const timeTakenSeconds = Math.floor((Date.now() - testStartTime) / 1000);
    
    console.log('Calculating results...');
    let correctCount = 0;
    let incorrectAnswers = 0;
    let skippedQuestions = 0;
    let totalMarks = 0;
    let obtainedMarks = 0;

    const answersData: Record<string, any> = {};
    const bookmarkedQuestions: string[] = [];

    questions.forEach(question => {
      const answer = answers[question.id];
      
      // Check if question is skipped (no answer or empty answer)
      const isSkipped = !answer || 
                       answer.answer === '' || 
                       (Array.isArray(answer.answer) && answer.answer.length === 0);
      
      if (isSkipped) {
        skippedQuestions++;
        obtainedMarks += question.skipped_marks;
      } else {
        answersData[question.id] = answer.answer;
        
        if (answer.isBookmarked) {
          bookmarkedQuestions.push(question.id);
        }

        const correctAnswer = question.answer;
        let isCorrect = false;

        if (question.question_type === 'MSQ') {
          const userAnswers = Array.isArray(answer.answer) ? answer.answer : [];
          const correctAnswers = Array.isArray(correctAnswer) ? correctAnswer : JSON.parse(correctAnswer);
          
          if (userAnswers.length === correctAnswers.length && 
              userAnswers.every(ans => correctAnswers.includes(ans))) {
            isCorrect = true;
            correctCount++;
            obtainedMarks += question.correct_marks;
          } else if (userAnswers.some(ans => correctAnswers.includes(ans))) {
            obtainedMarks += question.partial_marks || 0;
            incorrectAnswers++;
          } else {
            incorrectAnswers++;
            obtainedMarks += question.incorrect_marks;
          }
        } else {
          if (String(answer.answer).toLowerCase() === String(correctAnswer).toLowerCase()) {
            isCorrect = true;
            correctCount++;
            obtainedMarks += question.correct_marks;
          } else {
            incorrectAnswers++;
            obtainedMarks += question.incorrect_marks;
          }
        }
      }
      
      totalMarks += question.correct_marks;
    });

    const results = {
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      incorrectAnswers,
      skippedQuestions,
      totalMarks,
      obtainedMarks,
      timeTaken,
      answers: answersData,
      bookmarkedQuestions,
    };

    console.log('Results calculated:', results);

    // Save test history and leaderboard data
    if (user?.id && profile?.selected_course_id) {
      try {
        console.log('Saving test data to database...');
        
        // Save test history
        const testHistoryResult = await supabase
          .from('test_history')
          .insert({
            user_id: user.id,
            course_id: profile.selected_course_id,
            chapter_id: chapterId || null,
            test_name: testName,
            test_type: testType,
            mode: mode,
            total_questions: questions.length,
            correct_answers: correctCount,
            incorrect_answers: incorrectAnswers,
            skipped_questions: skippedQuestions,
            attempted_questions: questions.length - skippedQuestions,
            total_marks: totalMarks,
            obtained_marks: obtainedMarks,
            time_taken_minutes: timeTaken,
            answers: answersData,
            completed: true
          })
          .select('id')
          .single();

        console.log('Test history saved:', testHistoryResult);

        // Update test attempt status
        if (testAttemptId) {
          await supabase
            .from('test_attempts')
            .update({
              status: 'completed',
              best_score: obtainedMarks,
              last_attempt_date: new Date().toISOString()
            })
            .eq('id', testAttemptId);
          
          console.log('Test attempt updated');
        }

        // Save to leaderboard with proper user name
        if (testHistoryResult.data) {
          const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
          const testIdentifier = `${testType}-${testName.toLowerCase().replace(/\s+/g, '-')}`;
          
          const leaderboardResult = await supabase
            .from('test_leaderboard')
            .insert({
              user_id: user.id,
              test_identifier: testIdentifier,
              test_type: testType,
              test_name: testName,
              course_id: profile.selected_course_id,
              chapter_id: chapterId || null,
              score: obtainedMarks,
              total_marks: totalMarks,
              percentage: percentage,
              time_taken_minutes: timeTaken,
              time_taken_seconds: timeTakenSeconds,
              name: profile.name || `User ${user.id.slice(-6)}`
            });

          console.log('Leaderboard entry saved:', leaderboardResult);
          
          if (leaderboardResult.error) {
            console.error('Error saving leaderboard:', leaderboardResult.error);
          } else {
            console.log('Leaderboard entry saved successfully');
            // Fetch leaderboard after saving for display in results
            setTimeout(() => fetchLeaderboard(), 1000);
          }
        }
      } catch (error) {
        console.error('Error saving test data:', error);
      }
    }

    console.log('Calling onComplete with results...');
    // Use setTimeout to ensure the state is updated and component re-renders before calling onComplete
    setTimeout(() => {
      onComplete(results);
    }, 100);
  };

  const getQuestionStatus = (index: number) => {
    const question = filteredQuestions[index];
    const answer = answers[question?.id];
    
    if (index === currentQuestionIndex) return 'current';
    if (!answer) return 'unanswered';
    if (answer.isBookmarked) return 'bookmarked';
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

  // Filter questions by selected part
  const filteredQuestions = selectedPart 
    ? questions.filter(q => q.part === selectedPart)
    : questions;
  
  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion?.id];

  const renderQuestion = () => {
    if (!currentQuestion) {
      return <div>No questions available for the selected part.</div>;
    }

    return (
      <div className="space-y-6">
        {/* Question Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline">Question {currentQuestionIndex + 1}</Badge>
            <Badge variant="secondary">{currentQuestion.question_type}</Badge>
            {selectedPart && <Badge variant="outline">Part: {selectedPart}</Badge>}
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
          
          <div className="flex items-center gap-4">
            {isCalculatorEnabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCalculator(!showCalculator)}
                className="flex items-center gap-2"
              >
                <CalculatorIcon className="h-4 w-4" />
                Calculator
              </Button>
            )}
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

        {/* Answer Options */}
        <Card>
          <CardContent className="pt-6">
            {currentQuestion.question_type === 'MCQ' && currentQuestion.options && (
              <RadioGroup
                value={currentAnswer?.answer as string || ''}
                onValueChange={handleAnswerChange}
                disabled={mode === 'practice' && showSolution}
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="cursor-pointer">
                      <LaTeXRenderer content={option} />
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.question_type === 'MSQ' && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox
                      id={`option-${index}`}
                      checked={(currentAnswer?.answer as string[] || []).includes(option)}
                      onCheckedChange={(checked) => {
                        const currentAnswers = (currentAnswer?.answer as string[]) || [];
                        const newAnswers = checked
                          ? [...currentAnswers, option]
                          : currentAnswers.filter(ans => ans !== option);
                        handleAnswerChange(newAnswers);
                      }}
                      disabled={mode === 'practice' && showSolution}
                    />
                    <Label htmlFor={`option-${index}`} className="cursor-pointer">
                      <LaTeXRenderer content={option} />
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {currentQuestion.question_type === 'NAT' && (
              <Input
                type="text"
                placeholder="Enter your numerical answer"
                value={currentAnswer?.answer as string || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
                disabled={mode === 'practice' && showSolution}
                className="max-w-sm"
              />
            )}

            {currentQuestion.question_type === 'SUB' && (
              <RadioGroup
                value={currentAnswer?.answer as string || ''}
                onValueChange={handleAnswerChange}
                disabled={mode === 'practice' && showSolution}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="attempted" id="attempted" />
                  <Label htmlFor="attempted">I attempted this question</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="not-attempted" id="not-attempted" />
                  <Label htmlFor="not-attempted">I didn't attempt this question</Label>
                </div>
              </RadioGroup>
            )}
          </CardContent>
        </Card>

        {/* Solution (Practice Mode) */}
        {mode === 'practice' && showSolution && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={currentAnswer?.isCorrect ? 'default' : 'destructive'}>
                      {currentAnswer?.isCorrect ? 'Correct!' : 'Incorrect'}
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
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0 && testParts.indexOf(selectedPart) === 0}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <Button variant="outline" onClick={handleBookmark}>
              <Flag className={`h-4 w-4 mr-2 ${currentAnswer?.isBookmarked ? 'fill-current' : ''}`} />
              {currentAnswer?.isBookmarked ? 'Marked for Review' : 'Mark for Review'}
            </Button>
          </div>

          <div className="flex gap-2">
            {mode === 'practice' && currentAnswer && !showSolution && (
              <Button onClick={handleCheckAnswer}>
                Check Answer
              </Button>
            )}
            
            {isLastQuestionOfTest() ? (
              <Button onClick={handleSubmitTest} variant="default" disabled={testCompleted}>
                <Send className="h-4 w-4 mr-2" />
                Submit Test
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Calculator */}
      {showCalculator && (
        <Calculator onClose={() => setShowCalculator(false)} />
      )}
      
      {/* Main Question Area - Removed top padding to eliminate empty space */}
      <div className={`flex-1 p-6 transition-all duration-300 ${sidebarCollapsed ? 'mr-14' : ''}`}>
        <div className="max-w-4xl mx-auto">
          {/* Sidebar Toggle Button - Positioned better without top bar */}
          <div className="fixed top-6 right-4 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="shadow-lg bg-white hover:bg-gray-50 border-gray-300"
            >
              {sidebarCollapsed ? (
                <PanelRightOpen className="h-4 w-4" />
              ) : (
                <PanelRightClose className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {renderQuestion()}
        </div>
      </div>

      {/* Right Sidebar - Navigation */}
      <div className={`bg-white border-l border-gray-200 transition-all duration-300 ${
        sidebarCollapsed ? 'w-14 overflow-hidden' : 'w-80'
      } p-6`}>
        {sidebarCollapsed ? (
          /* Collapsed Sidebar - Essential Elements Only */
          <div className="space-y-4 flex flex-col items-center">
            {/* Timer Icon (Test Mode) */}
            {mode === 'test' && (
              <div className="text-center">
                <Clock className={`h-5 w-5 ${timeRemaining < 300 ? 'text-red-600' : 'text-blue-600'}`} />
                <div className={`text-xs font-mono mt-1 ${timeRemaining < 300 ? 'text-red-600' : 'text-blue-700'}`}>
                  {Math.floor(timeRemaining / 60)}m
                </div>
              </div>
            )}
            
            {/* Current Question Indicator */}
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-500 text-white rounded text-sm font-medium flex items-center justify-center">
                {currentQuestionIndex + 1}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {filteredQuestions.length}
              </div>
            </div>

            {/* Bookmark indicator */}
            {currentAnswer?.isBookmarked && (
              <div className="text-center">
                <Flag className="h-4 w-4 text-red-500 fill-current" />
              </div>
            )}
          </div>
        ) : (
          /* Expanded Sidebar - Full Content */
          <div className="space-y-6">
            {/* Timer (Test Mode) */}
            {mode === 'test' && (
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">Time Remaining</span>
                    </div>
                    <div className={`text-2xl font-mono font-bold ${timeRemaining < 300 ? 'text-red-600' : 'text-blue-700'}`}>
                      {formatTime(timeRemaining)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
                      className={`w-10 h-10 rounded text-sm font-medium transition-colors relative ${getStatusColor(status)}`}
                    >
                      {index + 1}
                      {/* Bookmark indicator on question number */}
                      {answers[filteredQuestions[index]?.id]?.isBookmarked && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Leaderboard only shown after test completion */}
            {testCompleted && leaderboard.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    <h3 className="font-semibold">Leaderboard</h3>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Top participants
                  </Badge>
                </div>
                
                <div className="space-y-2 max-h-80">
                  {leaderboard.map((entry) => (
                    <div key={entry.user_id} className={`flex items-center justify-between p-2 rounded text-xs ${
                      entry.user_id === user?.id ? 'bg-blue-100 border border-blue-300' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
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
                            {Math.floor(entry.time_taken_seconds / 60)}:{(entry.time_taken_seconds % 60).toString().padStart(2, '0')}
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
          </div>
        )}
      </div>
    </div>
  );
}

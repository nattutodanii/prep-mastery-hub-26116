
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, BookOpen, Clock, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { TestModeSelector } from "@/components/test/TestModeSelector";
import { TestInstructions } from "@/components/test/TestInstructions";
import { TestInterface } from "@/components/test/TestInterface";
import { EnhancedTestResults } from "@/components/test/EnhancedTestResults";
import { DetailedAnswersAnalysis } from "@/components/test/DetailedAnswersAnalysis";
import { FullScreenTestLayout } from "@/components/test/FullScreenTestLayout";
import { DynamicTestButton } from "@/components/test/DynamicTestButton";
import { useTestAttempt } from "@/hooks/useTestAttempt";

export function ChapterPractice() {
  const [openSubjects, setOpenSubjects] = useState<Record<string, boolean>>({});
  const [openUnits, setOpenUnits] = useState<Record<string, boolean>>({});
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testState, setTestState] = useState<'list' | 'mode-selector' | 'instructions' | 'test' | 'results' | 'analysis'>('list');
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [selectedMode, setSelectedMode] = useState<'practice' | 'test'>('practice');
  const [questions, setQuestions] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<any>(null);
  const { profile } = useProfile();
  const { createOrUpdateTestAttempt, getTestAttemptData } = useTestAttempt();

  useEffect(() => {
    fetchSubjects();
  }, [profile?.selected_course_id]);

  // Check for task context and auto-start if present
  useEffect(() => {
    const checkTaskContext = async () => {
      const taskContextStr = sessionStorage.getItem('taskContext');
      if (taskContextStr) {
        const taskContext = JSON.parse(taskContextStr);
        if (taskContext.autoStart && taskContext.taskType === 'practice' && taskContext.chapterId) {
          // Clear the context so it doesn't auto-start again
          sessionStorage.removeItem('taskContext');
          
          // Wait for subjects to load
          if (subjects.length > 0) {
            // Find the chapter
            let foundChapter = null;
            for (const subject of subjects) {
              for (const unit of subject.units || []) {
                const chapter = unit.chapters?.find(c => c.id === taskContext.chapterId);
                if (chapter) {
                  foundChapter = chapter;
                  break;
                }
              }
              if (foundChapter) break;
            }
            
            if (foundChapter) {
              await handleStartChapterTest(foundChapter);
            }
          }
        }
      }
    };
    
    if (!loading && subjects.length > 0) {
      checkTaskContext();
    }
  }, [loading, subjects]);

  const fetchSubjects = async () => {
    if (!profile?.selected_course_id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subjects')
        .select(`*, units:units(*, chapters:chapters(*))`)
        .eq('course_id', profile.selected_course_id)
        .order('order_index');
      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChapterTest = async (chapter: any) => {
    await createOrUpdateTestAttempt(`${chapter.name} - Practice`, 'chapter-practice', 'in_progress', {}, chapter.id);
    setSelectedChapter(chapter);
    setTestState('mode-selector');
  };

  const handleContinueTest = async (chapter: any) => {
    const attemptData = getTestAttemptData(`${chapter.name} - Practice`, 'chapter-practice', chapter.id);
    setSelectedChapter(chapter);
    
    // Fetch questions and set saved state
    try {
      const { data, error } = await supabase
        .from('chapter_questions')
        .select('*')
        .eq('chapter_id', chapter.id)
        .eq('is_pyq', false);
      if (error) throw error;
      setQuestions(data || []);
      
      setSelectedChapter({
        ...chapter,
        savedState: attemptData
      });
      setTestState('test'); // Skip mode selector and instructions
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleViewAnalysis = async (chapter: any) => {
    try {
      const { data: testHistory, error } = await supabase
        .from('test_history')
        .select('*')
        .eq('user_id', profile?.user_id)
        .eq('test_name', `${chapter.name} - Practice`)
        .eq('test_type', 'chapter-practice')
        .eq('chapter_id', chapter.id)
        .eq('completed', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching test history:', error);
        return;
      }

      if (testHistory) {
        // Fetch questions for analysis
        const { data: questionsData, error: questionsError } = await supabase
          .from('chapter_questions')
          .select('*')
          .eq('chapter_id', chapter.id)
          .eq('is_pyq', false);
        
        if (questionsError) throw questionsError;
        
        setQuestions(questionsData || []);

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
        
        setSelectedChapter(chapter);
        setTestResults(results);
        setTestState('analysis');
      }
    } catch (error) {
      console.error('Error loading test analysis:', error);
    }
  };

  const handleModeSelect = (mode: 'practice' | 'test') => {
    setSelectedMode(mode);
    setTestState('instructions');
  };

  const handleStartTestFromInstructions = async () => {
    if (!selectedChapter) return;
    try {
      const { data, error } = await supabase
        .from('chapter_questions')
        .select('*')
        .eq('chapter_id', selectedChapter.id)
        .eq('is_pyq', false);
      if (error) throw error;
      setQuestions(data || []);
      setTestState('test');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleTestComplete = (results: any) => {
    setTestResults(results);
    setTestState('results');
  };

  const handleReturnToDashboard = () => {
    setTestState('list');
    setSelectedChapter(null);
    setTestResults(null);
  };

  if (loading) return <div>Loading...</div>;

  if (testState === 'mode-selector') {
    return <TestModeSelector onModeSelect={handleModeSelect} onBack={() => setTestState('list')} />;
  }
  if (testState === 'instructions') {
    // Fetch questions first to get accurate data for instructions
    const fetchQuestionsForInstructions = async () => {
      if (!selectedChapter) return;
      try {
        const { data, error } = await supabase
          .from('chapter_questions')
          .select('*')
          .eq('chapter_id', selectedChapter.id)
          .eq('is_pyq', false);
        if (error) throw error;
        setQuestions(data || []);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    if (questions.length === 0) {
      fetchQuestionsForInstructions();
    }

    const questionTypes = [...new Set(questions.map(q => q.question_type))];
    const totalMarks = questions.reduce((sum, q) => sum + q.correct_marks, 0);
    const totalTime = questions.reduce((sum, q) => sum + q.time_minutes, 0);

    return (
      <FullScreenTestLayout onExit={() => setTestState('mode-selector')}>
        <TestInstructions
          testType="chapter-practice"
          mode={selectedMode}
          testName={`${selectedChapter?.name} - Practice`}
          totalQuestions={questions.length}
          totalTime={totalTime}
          totalMarks={totalMarks}
          syllabus={[selectedChapter?.name || 'Chapter Practice']}
          questionTypes={questionTypes}
          markingScheme={{
            correct: questions[0]?.correct_marks || 4,
            incorrect: questions[0]?.incorrect_marks || -1,
            skipped: questions[0]?.skipped_marks || 0,
            partial: questions[0]?.partial_marks || 1
          }}
          onStartTest={handleStartTestFromInstructions}
          onBack={() => setTestState('mode-selector')}
        />
      </FullScreenTestLayout>
    );
  }
  if (testState === 'test') {
    return (
      <FullScreenTestLayout onExit={() => setTestState('instructions')}>
        <TestInterface 
          questions={questions} 
          mode={selectedMode} 
          testName={`${selectedChapter?.name} - Practice`}
          testType="chapter-practice"
          chapterId={selectedChapter?.id}
          onComplete={handleTestComplete}
          onBack={() => setTestState('instructions')}
          savedState={selectedChapter?.savedState}
        />
      </FullScreenTestLayout>
    );
  }
  if (testState === 'results') {
    return (
      <FullScreenTestLayout onExit={handleReturnToDashboard}>
        <EnhancedTestResults
          results={testResults}
          questions={questions}
          testName={`${selectedChapter?.name} - Practice`}
          testType="chapter-practice"
          onDetailedAnalysis={() => setTestState('analysis')}
          onReturnToDashboard={handleReturnToDashboard}
        />
      </FullScreenTestLayout>
    );
  }
  if (testState === 'analysis') {
    return (
      <FullScreenTestLayout onExit={handleReturnToDashboard}>
        <DetailedAnswersAnalysis
          questions={questions}
          userAnswers={testResults?.answers || {}}
          bookmarkedQuestions={testResults?.bookmarkedQuestions || []}
          onClose={handleReturnToDashboard}
        />
      </FullScreenTestLayout>
    );
  }

  const isPremium = profile?.subscription === 'premium';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Chapter Practice</h1>
        <p className="text-muted-foreground">Practice chapter-wise questions to strengthen your concepts</p>
      </div>

      <div className="space-y-4">
        {subjects.map((subject) => (
          <Card key={subject.id}>
            <Collapsible open={openSubjects[subject.id]} onOpenChange={() => setOpenSubjects(prev => ({ ...prev, [subject.id]: !prev[subject.id] }))}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50">
                  <div className="flex items-center justify-between">
                    <CardTitle>{subject.name}</CardTitle>
                    <ChevronDown className={`h-5 w-5 transition-transform ${openSubjects[subject.id] ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  {subject.units?.map((unit: any) => (
                    <Card key={unit.id} className="mb-4">
                      <Collapsible open={openUnits[unit.id]} onOpenChange={() => setOpenUnits(prev => ({ ...prev, [unit.id]: !prev[unit.id] }))}>
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer">
                            <CardTitle className="text-lg">{unit.name}</CardTitle>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent>
                            {unit.chapters?.map((chapter: any, index: number) => {
                              const isFirstChapter = index === 0;
                              const isAccessible = isPremium || isFirstChapter;
                              return (
                                <div key={chapter.id} className="flex items-center justify-between p-4 border rounded-lg mb-2">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium">{chapter.name}</h4>
                                      {!isAccessible && <Badge><Crown className="h-3 w-3 mr-1" />Premium</Badge>}
                                    </div>
                                    <div className="flex gap-4 text-sm text-muted-foreground">
                                      <span><BookOpen className="h-3 w-3 inline mr-1" />Practice Questions</span>
                                      <span><Clock className="h-3 w-3 inline mr-1" />Estimated Time</span>
                                    </div>
                                  </div>
                                  <DynamicTestButton
                                    testName={`${chapter.name} - Practice`}
                                    testType="chapter-practice"
                                    chapterId={chapter.id}
                                    onStartTest={() => handleStartChapterTest(chapter)}
                                    onContinueTest={() => handleContinueTest(chapter)}
                                    onViewAnalysis={() => handleViewAnalysis(chapter)}
                                    disabled={!isAccessible}
                                    className="w-auto"
                                  />
                                </div>
                              );
                            })}
                          </CardContent>
                        </CollapsibleContent>
                      </Collapsible>
                    </Card>
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    </div>
  );
}

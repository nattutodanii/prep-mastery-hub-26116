import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Clock, FileText } from "lucide-react";
import { PremiumBadge } from "@/components/common/PremiumBadge";
import { TestModeSelector } from "@/components/test/TestModeSelector";
import { TestInstructions } from "@/components/test/TestInstructions";
import { TestInterface } from "@/components/test/TestInterface";
import { EnhancedTestResults } from "@/components/test/EnhancedTestResults";
import { DetailedAnswersAnalysis } from "@/components/test/DetailedAnswersAnalysis";
import { FullScreenTestLayout } from "@/components/test/FullScreenTestLayout";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";

type TestState = 'list' | 'mode-selector' | 'instructions' | 'test' | 'results' | 'analysis';

export function ChapterPYQs() {
  const [openSubjects, setOpenSubjects] = useState<{ [key: string]: boolean }>({});
  const [openUnits, setOpenUnits] = useState<{ [key: string]: boolean }>({});
  const [subjects, setSubjects] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testState, setTestState] = useState<TestState>('list');
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [selectedMode, setSelectedMode] = useState<'practice' | 'test'>('practice');
  const [testResults, setTestResults] = useState<any>(null);
  const { profile } = useProfile();

  useEffect(() => {
    if (profile?.selected_course_id) {
      fetchSubjects();
    }
  }, [profile?.selected_course_id]);

  // Check for task context and auto-start if present
  useEffect(() => {
    const checkTaskContext = async () => {
      const taskContextStr = sessionStorage.getItem('taskContext');
      if (taskContextStr) {
        const taskContext = JSON.parse(taskContextStr);
        if (taskContext.autoStart && taskContext.taskType === 'pyq' && taskContext.chapterId) {
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
              handleChapterClick(foundChapter);
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
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select(`
          *,
          units (
            *,
            chapters (*)
          )
        `)
        .eq('course_id', profile?.selected_course_id);
      
      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChapterClick = (chapter: any) => {
    setSelectedChapter(chapter);
    setTestState('mode-selector');
  };

  const handleModeSelect = (mode: 'practice' | 'test') => {
    setSelectedMode(mode);
    setTestState('instructions');
  };

  const handleStartTest = async () => {
    if (!selectedChapter) return;
    try {
      const { data, error } = await supabase
        .from('chapter_questions')
        .select('*')
        .eq('chapter_id', selectedChapter.id)
        .eq('is_pyq', true);
      if (error) throw error;
      setQuestions(data || []);
      setTestState('test');
    } catch (error) {
      console.error('Error fetching questions:', error);
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

  const toggleSubject = (subjectId: string) => {
    setOpenSubjects(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }));
  };

  const toggleUnit = (unitId: string) => {
    setOpenUnits(prev => ({
      ...prev,
      [unitId]: !prev[unitId]
    }));
  };

  const isChapterAccessible = (chapterIndex: number, unitIndex: number, subjectIndex: number) => {
    if (profile?.subscription === 'premium') return true;
    return subjectIndex === 0 && unitIndex === 0 && chapterIndex === 0;
  };

  if (loading) return <div>Loading...</div>;

  if (testState === 'mode-selector') {
    return <TestModeSelector onModeSelect={handleModeSelect} onBack={() => setTestState('list')} />;
  }

  if (testState === 'instructions') {
    const fetchQuestionsForInstructions = async () => {
      if (!selectedChapter) return;
      try {
        const { data, error } = await supabase
          .from('chapter_questions')
          .select('*')
          .eq('chapter_id', selectedChapter.id)
          .eq('is_pyq', true);
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
      <TestInstructions
        testType="chapter-pyq"
        mode={selectedMode}
        testName={`${selectedChapter?.name} - PYQ Practice`}
        totalQuestions={questions.length}
        totalTime={totalTime}
        totalMarks={totalMarks}
        syllabus={[selectedChapter?.name || 'Chapter PYQ Practice']}
        questionTypes={questionTypes}
        markingScheme={{
          correct: questions[0]?.correct_marks || 4,
          incorrect: questions[0]?.incorrect_marks || -1,
          skipped: questions[0]?.skipped_marks || 0,
          partial: questions[0]?.partial_marks || 1
        }}
        onStartTest={handleStartTest}
        onBack={() => setTestState('mode-selector')}
      />
    );
  }

  if (testState === 'test') {
    return (
      <FullScreenTestLayout onExit={() => setTestState('instructions')}>
        <TestInterface 
          questions={questions} 
          mode={selectedMode} 
          testName={`${selectedChapter?.name} - PYQ Practice`}
          testType="chapter-pyq"
          chapterId={selectedChapter?.id}
          onComplete={handleTestComplete}
          onBack={() => setTestState('instructions')}
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
          testName={`${selectedChapter?.name} - PYQ Practice`}
          testType="chapter-pyq"
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Chapter wise PYQs</h1>
        <p className="text-muted-foreground">Practice previous year questions chapter by chapter</p>
      </div>

      {/* Subject List */}
      <div className="space-y-4">
        {subjects.map((subject, subjectIndex) => (
          <Card key={subject.id}>
            <Collapsible 
              open={openSubjects[subject.id]} 
              onOpenChange={() => toggleSubject(subject.id)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {subject.name}
                    </CardTitle>
                    <ChevronDown className={`h-5 w-5 transition-transform ${openSubjects[subject.id] ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-4 mt-4">
                {subject.units.map((unit, unitIndex) => (
                  <Card key={unit.id} className="mx-6 mb-4 bg-muted/30">
                    <Collapsible 
                      open={openUnits[unit.id]} 
                      onOpenChange={() => toggleUnit(unit.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{unit.name}</CardTitle>
                            <ChevronRight className={`h-4 w-4 transition-transform ${openUnits[unit.id] ? 'rotate-90' : ''}`} />
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent className="space-y-3 mt-3">
                        {unit.chapters.map((chapter, chapterIndex) => {
                          const isAccessible = isChapterAccessible(chapterIndex, unitIndex, subjectIndex);
                          return (
                            <Card key={chapter.id} className="p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium">{chapter.name}</h4>
                                    {!isAccessible && <PremiumBadge />}
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <FileText className="h-4 w-4" />
                                      PYQ Questions available
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      Est. time varies
                                    </span>
                                  </div>
                                </div>
                                <Button 
                                  variant={isAccessible ? "default" : "outline"} 
                                  disabled={!isAccessible}
                                  onClick={() => isAccessible && handleChapterClick(chapter)}
                                >
                                  Start Practice
                                </Button>
                              </div>
                            </Card>
                          );
                        })}
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      {/* Premium Upgrade CTA */}
      {profile?.subscription === 'freemium' && (
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PremiumBadge />
              Unlock All Chapter PYQs
            </CardTitle>
            <CardDescription>
              Get access to previous year questions for all chapters and subjects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="bg-gradient-to-r from-primary to-primary/80">
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

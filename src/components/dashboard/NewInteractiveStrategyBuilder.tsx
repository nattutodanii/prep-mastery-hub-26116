import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calendar, 
  Target, 
  BookOpen, 
  Trophy, 
  ArrowRight, 
  X, 
  Sparkles, 
  Users,
  TrendingUp,
  GripVertical,
  Star,
  Award,
  CalendarIcon
} from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useProfile } from '@/hooks/useProfile';
import { useExamRoadmap } from '@/hooks/useExamRoadmap';
import { DetailedPlanViewer } from './DetailedPlanViewer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Subject {
  id: string;
  name: string;
  chapters: Array<{ id: string; name: string; }>;
}

interface StrategyBuilderProps {
  onStrategyComplete: () => void;
}

export function NewInteractiveStrategyBuilder({ onStrategyComplete }: StrategyBuilderProps) {
  const { profile } = useProfile();
  const { createRoadmap } = useExamRoadmap();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [examDate, setExamDate] = useState('');
  const [studyApproach, setStudyApproach] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectOrder, setSubjectOrder] = useState<string[]>([]);
  const [studyDays, setStudyDays] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [mockDays, setMockDays] = useState<number[]>([0]);
  const [loading, setLoading] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [showDetailedPlan, setShowDetailedPlan] = useState(false);
  const [planData, setPlanData] = useState<any>(null);

  const studyApproaches = [
    { 
      value: '70-30', 
      title: 'Syllabus-Heavy Approach',
      time: '70% Time: Learning Syllabus',
      focus: '📘 Notes + PYQs focus',
      revision: '📝 30% Time: Revision & Mocks (short notes + test practice)',
      best: 'Students who want to build strong concepts first.'
    },
    { 
      value: '50-50', 
      title: 'Balanced Approach',
      time: '50% Time: Learning Syllabus',
      focus: '📘 Notes + PYQs',
      revision: '📝 50% Time: Revision & Mocks',
      best: 'Students who want steady progress with equal practice.'
    },
    { 
      value: '30-70', 
      title: 'Practice-Heavy Approach',
      time: '30% Time: Learning Syllabus',
      focus: '📘 Notes + PYQs (selective, essential topics)',
      revision: '📝 70% Time: Revision & Mocks',
      best: 'Students with basics clear who want exam-focused practice.'
    }
  ];

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    if (profile?.selected_course_id) {
      fetchSubjects();
    }
  }, [profile?.selected_course_id]);

  const fetchSubjects = async () => {
    try {
      console.log('Fetching subjects for course:', profile?.selected_course_id);
      
      const { data: subjectsData, error } = await supabase
        .from('subjects')
        .select(`
          id, name,
          units(
            id,
            chapters(id, name)
          )
        `)
        .eq('course_id', profile?.selected_course_id);

      if (error) {
        console.error('Supabase error fetching subjects:', error);
        toast({
          title: "Error",
          description: "Failed to load course subjects. Please try again.",
          variant: "destructive"
        });
        return;
      }

      console.log('Raw subjects data:', subjectsData);

      if (subjectsData && subjectsData.length > 0) {
        const formattedSubjects = subjectsData.map(subject => {
          console.log('Processing subject:', subject);
          
          // Safely extract chapters from units
          const chapters = [];
          if (subject.units && Array.isArray(subject.units)) {
            for (const unit of subject.units) {
              if (unit.chapters && Array.isArray(unit.chapters)) {
                chapters.push(...unit.chapters);
              }
            }
          }
          
          console.log('Chapters for subject', subject.name, ':', chapters);
          
          return {
            id: subject.id,
            name: subject.name,
            chapters: chapters
          };
        }).filter(subject => subject.chapters.length > 0); // Only include subjects with chapters
        
        console.log('Formatted subjects:', formattedSubjects);
        
        if (formattedSubjects.length === 0) {
          toast({
            title: "No Content Available",
            description: "No subjects with chapters found for this course. Please contact support.",
            variant: "destructive"
          });
          return;
        }
        
        setSubjects(formattedSubjects);
        setSubjectOrder(formattedSubjects.map(s => s.id));
        
        console.log('Subjects set successfully:', formattedSubjects.length, 'subjects');
      } else {
        toast({
          title: "No Subjects Found",
          description: "No subjects found for this course. Please contact support.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast({
        title: "Error",
        description: `Failed to load subjects: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const setQuickDate = (months: number) => {
    const futureDate = addDays(new Date(), months * 30);
    setExamDate(format(futureDate, 'yyyy-MM-dd'));
  };

  const generateSchedule = async () => {
    if (!examDate) {
      toast({ title: "Missing Exam Date", description: "Please select your exam date", variant: "destructive" });
      return;
    }
    
    if (!studyApproach) {
      toast({ title: "Missing Study Approach", description: "Please select your study approach", variant: "destructive" });
      return;
    }
    
    if (!profile?.selected_course_id) {
      toast({ title: "No Course Selected", description: "Please select a course first", variant: "destructive" });
      return;
    }

    if (subjects.length === 0) {
      toast({ title: "No Subjects Found", description: "No subjects available for this course", variant: "destructive" });
      return;
    }
    const today = new Date();
    const examDay = new Date(examDate);
    const totalDays = differenceInDays(examDay, today);
    
    if (totalDays <= 0) {
      toast({ title: "Invalid exam date", description: "Please select a future date", variant: "destructive" });
      return;
    }

    console.log('Generating schedule with:', {
      totalDays,
      studyApproach,
      subjects: subjects.length,
      studyDays: studyDays.length,
      mockDays: mockDays.length
    });
    const [syllabusPercent, mockPercent] = studyApproach.split('-').map(Number);
    const theoryDays = Math.floor((totalDays * syllabusPercent) / 100);
    
    // Calculate total content
    const totalChapters = subjects.reduce((sum, subject) => sum + subject.chapters.length, 0);
    console.log('Total chapters found:', totalChapters);
    
    if (totalChapters === 0) {
      toast({ title: "No Chapters Found", description: "No chapters available for this course", variant: "destructive" });
      return;
    }
    
    // Generate daily schedule
    const dailySchedule = [];
    let contentIndex = 0;
    let currentSubjectIndex = 0;
    let currentChapterIndex = 0;
    
    for (let dayIndex = 0; dayIndex < totalDays; dayIndex++) {
      const currentDate = format(addDays(today, dayIndex), 'yyyy-MM-dd');
      const dayOfWeek = addDays(today, dayIndex).getDay();
      
      const isStudyDay = studyDays.includes(dayOfWeek);
      const isMockDay = mockDays.includes(dayOfWeek);
      
      const dailyTasks = [];
      
      if (dayIndex < theoryDays && isStudyDay) {
        // Theory phase - distribute notes, pyqs, practice across all chapters
        const subject = subjects[currentSubjectIndex % subjects.length];
        
        if (subject && subject.chapters && subject.chapters.length > 0) {
          const chapter = subject.chapters[currentChapterIndex % subject.chapters.length];
          const taskType = ['notes', 'pyq', 'practice'][contentIndex % 3];
          
          if (chapter) {
            dailyTasks.push({
              type: taskType as 'notes' | 'pyq' | 'practice',
              subject_name: subject.name,
              chapter_name: chapter.name,
              chapter_id: chapter.id,
              completed: false
            });
            
            console.log(`Day ${dayIndex + 1}: Added ${taskType} for ${subject.name} - ${chapter.name}`);
          }
          
          // Move to next chapter after every 3 tasks (notes, pyq, practice)
          if (contentIndex % 3 === 2) {
            currentChapterIndex++;
            // If we've covered all chapters in current subject, move to next subject
            if (currentChapterIndex >= subject.chapters.length) {
              currentChapterIndex = 0;
              currentSubjectIndex++;
            }
          }
        }
        
        contentIndex++;
      }
      
      if (dayIndex >= theoryDays && isMockDay) {
        // Mock phase
        dailyTasks.push({
          type: 'mock' as const,
          subject_name: 'Full Mock Test',
          chapter_name: `Mock Test ${Math.ceil((dayIndex - theoryDays + 1) / 7)}`,
          chapter_id: 'mock',
          completed: false
        });
      }
      
      dailySchedule.push({
        date: currentDate,
        day_index: dayIndex,
        tasks: dailyTasks,
        is_mock_day: isMockDay && dayIndex >= theoryDays
      });
    }

    console.log('Generated daily schedule:', dailySchedule.slice(0, 5)); // Log first 5 days

    // Store plan data for preview
    setLoading(true);
    const generatedPlanData = {
      examDate,
      studyApproach,
      totalDays,
      theoryDays,
      mockDaysCount: totalDays - theoryDays,
      dailySchedule
    };
    
    console.log('Setting plan data:', generatedPlanData);
    setPlanData(generatedPlanData);
    
    // Animation sequence then show detailed plan
    setAnimationStep(1);
    setTimeout(() => setAnimationStep(2), 1500);
    setTimeout(() => setAnimationStep(3), 3500);
    setTimeout(() => {
      setAnimationStep(0);
      setShowDetailedPlan(true);
      setLoading(false);
    }, 5000);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="text-center space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent animate-pulse">
                👋 Hello {profile?.name || 'Rahul'}, let's start building your study plan!
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Answer a few quick questions and get your personalized roadmap in minutes.
              </p>
            </div>
            
            <div className="max-w-md mx-auto">
              <Button 
                size="lg" 
                onClick={() => setStep(1)} 
                className="px-12 py-6 text-xl bg-gradient-to-r from-primary to-purple-600 hover:shadow-xl transition-all duration-300"
              >
                Let's Start <Sparkles className="ml-2 h-6 w-6" />
              </Button>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center animate-pulse">
                <CalendarIcon className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold">
                {profile?.name || 'Rahul'}, when is your exam scheduled?
              </h2>
              <p className="text-lg text-muted-foreground">
                Your exam date decides how fast we cover notes & when we start mocks.
              </p>
            </div>
            
            <div className="max-w-md mx-auto space-y-6">
              <div>
                <Label htmlFor="examDate" className="text-base">Select Exam Date</Label>
                <Input
                  id="examDate"
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="mt-2 h-12 text-lg"
                />
              </div>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">Or choose a quick option:</p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={() => setQuickDate(3)}>
                    3 Months from now
                  </Button>
                  <Button variant="outline" onClick={() => setQuickDate(6)}>
                    6 Months from now
                  </Button>
                  <Button variant="outline" onClick={() => setQuickDate(9)}>
                    9+ Months from now
                  </Button>
                </div>
              </div>
              
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    💡 Why we ask this?
                  </h3>
                  <p className="text-sm text-blue-700">
                    "Your exam date decides how fast we cover notes & when we start mocks. The earlier you begin, the more revision you'll get."
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-center">
              <Button 
                onClick={() => setStep(2)} 
                disabled={!examDate}
                size="lg"
                className="px-8 py-4 text-lg"
              >
                Continue <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                <Target className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold">
                {profile?.name || 'Rahul'}, how do you want to spend your study time?
              </h2>
              <p className="text-lg text-muted-foreground">
                (This will decide your daily split between learning new topics and revising with mocks.)
              </p>
            </div>
            
            <div className="grid gap-6 max-w-4xl mx-auto">
              {studyApproaches.map((approach, index) => (
                <Card
                  key={approach.value}
                  className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    studyApproach === approach.value 
                      ? 'ring-2 ring-primary bg-primary/5 shadow-lg' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setStudyApproach(approach.value)}
                >
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold">
                          Option {String.fromCharCode(65 + index)}: {approach.title}
                        </h3>
                        {studyApproach === approach.value && (
                          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                            <div className="h-3 w-3 rounded-full bg-white"></div>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span>⏳</span>
                          <span className="font-medium">{approach.time}</span>
                        </div>
                        <div className="pl-6">
                          <p>{approach.focus}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>📝</span>
                          <span>{approach.revision}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-3 p-3 bg-muted rounded-lg">
                          <span>👉</span>
                          <span className="font-medium">Best for: {approach.best}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 max-w-2xl mx-auto">
              <CardContent className="p-6">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  💡 Why this matters?
                </h3>
                <div className="space-y-2 text-sm text-blue-700">
                  <p>"MastersUp will build your daily roadmap with this split.</p>
                  <p>More syllabus time → more Notes & PYQs in daily plan.</p>
                  <p>More practice time → more short notes, quick revisions & mocks."</p>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-between max-w-md mx-auto">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)} disabled={!studyApproach}>
                Continue to Step 3 <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                <BookOpen className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold">
                {profile?.name || 'Rahul'}, which days do you want to dedicate for study?
              </h2>
              <p className="text-lg text-muted-foreground">
                (We'll build your weekly plan around this.)
              </p>
            </div>
            
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 max-w-2xl mx-auto">
              <CardContent className="p-6">
                <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  💡 We recommend 5–6 days per week for best retention and steady progress.
                </h3>
                <p className="text-sm text-green-700">
                  👉 Don't worry — your plan will adjust automatically if you pick fewer days.
                </p>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {dayNames.map((day, index) => {
                const isSelected = studyDays.includes(index);
                const isSunday = index === 0;
                
                return (
                  <Card
                    key={index}
                    className={`cursor-pointer transition-all duration-300 ${
                      isSelected 
                        ? 'bg-primary text-primary-foreground shadow-lg scale-105' 
                        : 'hover:shadow-md'
                    } ${isSunday ? 'border-orange-300' : ''}`}
                    onClick={() => {
                      if (isSelected) {
                        setStudyDays(studyDays.filter(d => d !== index));
                      } else {
                        setStudyDays([...studyDays, index]);
                      }
                    }}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="space-y-2">
                        <h3 className="font-semibold">{day}</h3>
                        {isSunday && (
                          <Badge variant="secondary" className="text-xs">
                            🏆 Test & Revision
                          </Badge>
                        )}
                        {isSelected && (
                          <Badge variant="secondary" className="bg-white/20">
                            Selected
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            <div className="text-center space-y-4">
              <p className="text-lg">
                ✅ Great! You'll study <span className="font-bold text-primary">{studyDays.length} days a week</span>, 
                with {7 - studyDays.length} day{7 - studyDays.length !== 1 ? 's' : ''} for rest/revision.
              </p>
            </div>
            
            <div className="flex justify-between max-w-md mx-auto">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={() => setStep(4)} disabled={studyDays.length === 0}>
                Build My Weekly Plan <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center animate-pulse">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold">Mock test days</h2>
              <p className="text-lg text-muted-foreground">
                When would you like to take strategic mock tests?
              </p>
            </div>
            
            <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 max-w-2xl mx-auto">
              <CardContent className="p-6">
                <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Strategic Insight: Regular mocks identify weak areas and build exam temperament.
                </h3>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {dayNames.map((day, index) => {
                const isSelected = mockDays.includes(index);
                const isSunday = index === 0;
                
                return (
                  <Card
                    key={index}
                    className={`cursor-pointer transition-all duration-300 ${
                      isSelected 
                        ? 'bg-orange-500 text-white shadow-lg scale-105' 
                        : 'hover:shadow-md'
                    } ${isSunday ? 'border-orange-300 bg-orange-50' : ''}`}
                    onClick={() => {
                      if (isSelected) {
                        setMockDays(mockDays.filter(d => d !== index));
                      } else {
                        setMockDays([...mockDays, index]);
                      }
                    }}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="space-y-2">
                        <h3 className="font-semibold">{day}</h3>
                        {isSunday && !isSelected && (
                          <Badge variant="secondary" className="text-xs bg-orange-200 text-orange-800">
                            Recommended
                          </Badge>
                        )}
                        {isSelected && (
                          <Badge variant="secondary" className="bg-white/20 text-xs">
                            Mock Day
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Selected: <span className="font-medium text-orange-600">{mockDays.length} mock days per week</span>
              </p>
              
              <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 max-w-2xl mx-auto">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Your Strategy Summary
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-orange-800">Study Approach</div>
                      <div className="text-orange-600">{studyApproach}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-orange-800">Study Days</div>
                      <div className="text-orange-600">{studyDays.length} days/week</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-orange-800">Mock Days</div>
                      <div className="text-orange-600">{mockDays.length} days/week</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-between max-w-md mx-auto">
              <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
              <Button 
                onClick={() => {
                  generateSchedule();
                }}
                disabled={loading}
                size="lg"
                className="px-12 bg-gradient-to-r from-primary to-purple-600 hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Creating Your Strategy...
                  </>
                ) : (
                  <>
                    Create My Master Plan!
                    <Sparkles className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (showDetailedPlan && planData) {
    return (
      <DetailedPlanViewer 
        planData={planData}
        onImplement={async () => {
          try {
            setLoading(true);
            
            console.log('Creating roadmap with data:', {
              examDate,
              studyApproach,
              subjects: subjects.length,
              planData: planData ? 'exists' : 'missing'
            });
            
            // Create the roadmap in the database
            await createRoadmap({
              exam_date: examDate,
              syllabus_progress: 0,
              weekly_hours: 20,
              roadmap_data: planData,
              daily_schedule: planData.dailySchedule,
              study_approach: studyApproach,
              subject_order: subjectOrder,
              study_days: studyDays,
              mock_days: mockDays,
              current_day_index: 0,
              total_days: planData.totalDays,
              theory_days: planData.theoryDays,
              mock_days_count: planData.mockDaysCount,
              is_active: true
            });

            console.log('Roadmap created successfully!');
            
            toast({
              title: "Success! 🎉",
              description: "Your personalized study plan has been created!",
            });
            
            // Show success animation
            setAnimationStep(3);
            setTimeout(() => {
              setAnimationStep(0);
              onStrategyComplete();
            }, 2000);
          } catch (error) {
            console.error('Error creating roadmap:', error);
            toast({
              title: "Error",
              description: `Failed to create your study plan: ${error.message || error}`,
              variant: "destructive"
            });
          } finally {
            setLoading(false);
          }
        }}
        onBack={() => setShowDetailedPlan(false)}
      />
    );
  }

  if (animationStep > 0) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-primary/10 to-purple-600/10 flex items-center justify-center">
        <Card className="p-12 text-center max-w-lg shadow-2xl">
          <CardContent className="space-y-8">
            {animationStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="relative">
                  <div className="animate-spin h-16 w-16 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                  <Sparkles className="h-8 w-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-primary">Building your personalized strategy…</p>
                  <p className="text-muted-foreground">We're splitting your time into Syllabus, Revision & Mocks based on your choices.</p>
                </div>
                <p className="text-sm text-blue-600 animate-pulse">
                  "Optimizing chapters by confidence order…"
                </p>
              </div>
            )}
            {animationStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="relative">
                  <BookOpen className="h-16 w-16 text-primary mx-auto animate-pulse" />
                  <div className="absolute -top-2 -right-2 animate-bounce">⚡</div>
                </div>
                <div>
                  <p className="text-xl font-semibold text-primary">Creating your daily roadmap...</p>
                  <p className="text-muted-foreground">Crafting balanced Notes • PYQs • Practice schedule</p>
                </div>
                <Progress value={75} className="mx-auto h-3" />
                <p className="text-sm text-green-600 animate-pulse">
                  "Locking Sundays for tests & revision…"
                </p>
              </div>
            )}
            {animationStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="relative">
                  <Trophy className="h-16 w-16 text-green-600 mx-auto" />
                  <div className="absolute -top-2 -right-2 text-2xl animate-bounce">🎉</div>
                </div>
                <div>
                  <p className="text-xl font-semibold text-green-600">Strategy Created Successfully!</p>
                  <p className="text-muted-foreground">Ready to view your detailed plan</p>
                </div>
                <Progress value={100} className="mx-auto h-3" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-purple-50/50 to-secondary/5">
        {/* Header with progress */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => step > 0 ? setStep(step - 1) : null}>
                  <X className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-xl font-semibold">MastersUp Strategy Builder</h1>
                  <p className="text-sm text-muted-foreground">Step {step + 1} of 5</p>
                </div>
              </div>
              <Progress value={(step / 4) * 100} className="w-32" />
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            {renderStep()}
          </div>
        </div>
      </div>
    </div>
  );
}
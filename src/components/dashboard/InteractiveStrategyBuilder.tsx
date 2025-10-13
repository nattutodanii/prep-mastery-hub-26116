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
  Award
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

export function InteractiveStrategyBuilder({ onStrategyComplete }: StrategyBuilderProps) {
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
    { value: '70-30', label: '70% Syllabus, 30% Mocks', description: 'Deep concept building' },
    { value: '50-50', label: '50% Syllabus, 50% Mocks', description: 'Balanced approach' },
    { value: '30-70', label: '30% Syllabus, 70% Mocks', description: 'Intensive practice' }
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

    const today = new Date();
    const examDay = new Date(examDate);
    const totalDays = differenceInDays(examDay, today);
    
    if (totalDays <= 0) {
      toast({ title: "Invalid exam date", description: "Please select a future date", variant: "destructive" });
      return;
    }

    const [syllabusPercent, mockPercent] = studyApproach.split('-').map(Number);
    const theoryDays = Math.floor((totalDays * syllabusPercent) / 100);
    
    // Calculate total content
    const totalChapters = subjects.reduce((sum, subject) => sum + subject.chapters.length, 0);
    const totalContent = totalChapters * 3; // notes, pyqs, practice for each chapter
    
    // Generate daily schedule
    const dailySchedule = [];
    let contentIndex = 0;
    let currentSubjectIndex = 0;
    
    for (let dayIndex = 0; dayIndex < totalDays; dayIndex++) {
      const currentDate = format(addDays(today, dayIndex), 'yyyy-MM-dd');
      const dayOfWeek = addDays(today, dayIndex).getDay();
      
      const isStudyDay = studyDays.includes(dayOfWeek);
      const isMockDay = mockDays.includes(dayOfWeek);
      
      const dailyTasks = [];
      
      if (dayIndex < theoryDays && isStudyDay) {
        // Theory phase - distribute notes, pyqs, practice
        const subjectIndex = currentSubjectIndex % subjects.length;
        const subject = subjects.find(s => s.id === subjectOrder[subjectIndex]) || subjects[subjectIndex];
        
        if (subject && subject.chapters && subject.chapters.length > 0) {
          const chapterIndex = Math.floor(contentIndex / 3) % subject.chapters.length;
          const taskType = ['notes', 'pyq', 'practice'][contentIndex % 3];
          const chapter = subject.chapters[chapterIndex];
          
          if (chapter) {
            dailyTasks.push({
              type: taskType as 'notes' | 'pyq' | 'practice',
              subject_name: subject.name,
              chapter_name: chapter.name,
              chapter_id: chapter.id,
              completed: false
            });
          }
        }
        
        contentIndex++;
        if (contentIndex % 3 === 0) {
          currentSubjectIndex = (currentSubjectIndex + 1) % subjects.length;
        }
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

    // Just store plan data for preview, don't save to database yet
    setLoading(true);
    setPlanData({
      examDate,
      studyApproach,
      totalDays,
      theoryDays,
      mockDaysCount: totalDays - theoryDays,
      dailySchedule
    });
    
    // Animation sequence then show detailed plan
    setAnimationStep(1);
    setTimeout(() => setAnimationStep(2), 1000);
    setTimeout(() => setAnimationStep(3), 3000);
    setTimeout(() => {
      setAnimationStep(0);
      setShowDetailedPlan(true);
      setLoading(false);
    }, 4000);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Hello {profile?.name || 'Future Master'}! 👋
                </h1>
                <p className="text-2xl text-muted-foreground max-w-3xl mx-auto">
                  Welcome to India's #1 Masters Entrance Prep Platform
                </p>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Join 50,000+ students who've cracked their dream programs with MastersUp. Let's create your personalized success strategy!
                </p>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                <div className="text-center p-4">
                  <div className="text-3xl font-bold text-primary">50,000+</div>
                  <div className="text-sm text-muted-foreground">Students Enrolled</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl font-bold text-green-600">85%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl font-bold text-purple-600">25+</div>
                  <div className="text-sm text-muted-foreground">Entrance Exams</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl font-bold text-orange-600">100+</div>
                  <div className="text-sm text-muted-foreground">Master Programs</div>
                </div>
              </div>
            </div>

            {/* What Makes Us Different */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-center">What Makes MastersUp Different?</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <BookOpen className="h-8 w-8 text-blue-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-blue-900 mb-2">Smart Notes System</h3>
                        <p className="text-sm text-blue-700">
                          Curated, structured notes that cover all concepts in digestible formats. Save 60% of your study time with our expert-designed content.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-green-200 bg-green-50/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Target className="h-8 w-8 text-green-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-green-900 mb-2">PYQ Mastery</h3>
                        <p className="text-sm text-green-700">
                          Solve 10+ years of previous papers with detailed solutions. 70% higher chance of encountering similar questions in your exam.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-orange-200 bg-orange-50/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Trophy className="h-8 w-8 text-orange-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-orange-900 mb-2">Strategic Practice</h3>
                        <p className="text-sm text-orange-700">
                          Chapter-wise practice that builds strong foundations. Adaptive difficulty based on your performance patterns.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-purple-200 bg-purple-50/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Award className="h-8 w-8 text-purple-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-purple-900 mb-2">Rank-Focused Mocks</h3>
                        <p className="text-sm text-purple-700">
                          While 80% complete syllabus, only 1-2% get top ranks. Our strategic mocks simulate real conditions and boost your percentile.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Success Formula */}
            <Card className="bg-gradient-to-r from-primary/10 to-purple-600/10 border-primary/20">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">The MastersUp Success Formula</h3>
                <div className="flex items-center justify-center gap-4 text-lg">
                  <Badge variant="secondary" className="px-4 py-2">Smart Study</Badge>
                  <span className="text-2xl">+</span>
                  <Badge variant="secondary" className="px-4 py-2">Strategic Practice</Badge>
                  <span className="text-2xl">+</span>
                  <Badge variant="secondary" className="px-4 py-2">Expert Guidance</Badge>
                  <span className="text-2xl">=</span>
                  <Badge variant="default" className="px-4 py-2 bg-gradient-to-r from-primary to-purple-600">Dream College</Badge>
                </div>
                <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                  From ISI to IITs, JNU to BHU - we've got every master's entrance covered with personalized strategies that actually work.
                </p>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button size="lg" onClick={() => setStep(1)} className="px-12 py-4 text-xl bg-gradient-to-r from-primary to-purple-600 hover:shadow-xl transition-all duration-300">
                Let's Make Your Strategy <Sparkles className="ml-2 h-6 w-6" />
              </Button>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Calendar className="h-12 w-12 text-primary mx-auto" />
              <h2 className="text-2xl font-bold">When is your exam?</h2>
            </div>
            <div className="max-w-md mx-auto">
              <Label htmlFor="examDate">Exam Date</Label>
              <Input
                id="examDate"
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="mt-2"
              />
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
              <Button onClick={() => setStep(2)} disabled={!examDate}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Target className="h-12 w-12 text-primary mx-auto" />
              <h2 className="text-2xl font-bold">Choose your approach</h2>
              <p className="text-muted-foreground">How do you want to balance theory and practice?</p>
            </div>
            <div className="grid gap-4">
              {studyApproaches.map((approach) => (
                <Card
                  key={approach.value}
                  className={`cursor-pointer transition-all ${
                    studyApproach === approach.value ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-md'
                  }`}
                  onClick={() => setStudyApproach(approach.value)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{approach.label}</h3>
                        <p className="text-sm text-muted-foreground">{approach.description}</p>
                      </div>
                      {studyApproach === approach.value && (
                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-background"></div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)} disabled={!studyApproach}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <BookOpen className="h-12 w-12 text-primary mx-auto" />
              <h2 className="text-2xl font-bold">Arrange subjects by confidence</h2>
              <p className="text-muted-foreground">Drag and drop to order from most confident (top) to least confident (bottom)</p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 <strong>Pro Tip:</strong> Starting with your strongest subjects builds momentum and confidence for challenging topics later!
                </p>
              </div>
            </div>
            
            <DragDropContext onDragEnd={(result) => {
              if (!result.destination) return;
              
              const items = Array.from(subjectOrder);
              const [reorderedItem] = items.splice(result.source.index, 1);
              items.splice(result.destination.index, 0, reorderedItem);
              
              setSubjectOrder(items);
            }}>
              <Droppable droppableId="subjects">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`space-y-3 max-w-md mx-auto transition-colors ${
                      snapshot.isDraggingOver ? 'bg-blue-50/50 p-4 rounded-lg border-2 border-dashed border-blue-300' : ''
                    }`}
                  >
                    {subjectOrder.map((subjectId, index) => {
                      const subject = subjects.find(s => s.id === subjectId);
                      return (
                        <Draggable key={subjectId} draggableId={subjectId} index={index}>
                          {(provided, snapshot) => (
                            <Card 
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`cursor-move transition-all duration-200 group ${
                                snapshot.isDragging 
                                  ? 'shadow-2xl scale-105 rotate-2 bg-white border-primary' 
                                  : 'hover:shadow-lg hover:scale-102'
                              }`}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                  <GripVertical className={`h-5 w-5 transition-colors ${
                                    snapshot.isDragging ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                                  }`} />
                                  <div className="flex items-center gap-3 flex-1">
                                    <Badge 
                                      variant={index < 2 ? "default" : index < 4 ? "secondary" : "outline"} 
                                      className="font-medium min-w-[2rem] text-center"
                                    >
                                      #{index + 1}
                                    </Badge>
                                    <div className="flex-1">
                                      <span className="font-medium text-lg">{subject?.name}</span>
                                      <div className="text-sm text-muted-foreground">
                                        {index === 0 && "Most Confident 🚀"}
                                        {index === subjectOrder.length - 1 && index > 0 && "Needs More Focus 📚"}
                                        {index > 0 && index < subjectOrder.length - 1 && `Priority ${index + 1}`}
                                      </div>
                                    </div>
                                    <Star className={`h-5 w-5 ${index < 2 ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            <div className="text-center">
              <Button variant="ghost" size="sm" onClick={() => setStep(4)} className="text-muted-foreground">
                I'll arrange later - Skip this step →
              </Button>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={() => setStep(4)} size="lg">
                Perfect! Let's Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <Calendar className="h-12 w-12 text-primary mx-auto" />
              <h2 className="text-2xl font-bold">Select your study days</h2>
              <p className="text-muted-foreground">Choose which days you'll focus on theory and practice</p>
              <div className="bg-green-50 p-4 rounded-lg max-w-lg mx-auto">
                <p className="text-sm text-green-700">
                  🎯 <strong>Recommended:</strong> 5-6 days per week for optimal retention and progress
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {dayNames.map((day, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                    studyDays.includes(index) 
                      ? 'ring-2 ring-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg' 
                      : 'hover:shadow-md border-2 border-dashed border-muted-foreground/20'
                  }`}
                  onClick={() => {
                    setStudyDays(prev => 
                      prev.includes(index) 
                        ? prev.filter(d => d !== index)
                        : [...prev, index]
                    );
                  }}
                >
                  <CardContent className="p-4 text-center">
                    <div className="space-y-2">
                      <div className="text-lg font-semibold">{day}</div>
                      {studyDays.includes(index) && (
                        <Badge variant="default">Selected</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Selected: <span className="font-medium text-primary">{studyDays.length} days per week</span>
              </p>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
              <Button onClick={() => setStep(5)} disabled={studyDays.length === 0} size="lg">
                Great Choice! Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <Trophy className="h-12 w-12 text-purple-600 mx-auto" />
              <h2 className="text-2xl font-bold">Mock test days</h2>
              <p className="text-muted-foreground">When would you like to take strategic mock tests?</p>
              <div className="bg-purple-50 p-4 rounded-lg max-w-lg mx-auto">
                <p className="text-sm text-purple-700">
                  🏆 <strong>Strategic Insight:</strong> Regular mocks identify weak areas and build exam temperament
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {dayNames.map((day, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                    mockDays.includes(index) 
                      ? 'ring-2 ring-purple-500 bg-gradient-to-br from-purple-100 to-purple-50 shadow-lg' 
                      : 'hover:shadow-md border-2 border-dashed border-muted-foreground/20'
                  }`}
                  onClick={() => {
                    setMockDays(prev => 
                      prev.includes(index) 
                        ? prev.filter(d => d !== index)
                        : [...prev, index]
                    );
                  }}
                >
                  <CardContent className="p-4 text-center">
                    <div className="space-y-2">
                      <div className="text-lg font-semibold">{day}</div>
                      {mockDays.includes(index) && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                          Mock Day
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Selected: <span className="font-medium text-purple-600">{mockDays.length} mock days per week</span>
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

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(4)}>Back</Button>
              <Button 
                onClick={() => {
                  if (planData) {
                    setShowDetailedPlan(true);
                  } else {
                    generateSchedule();
                  }
                }}
                disabled={(mockDays.length === 0 && !planData) || loading}
                size="lg"
                className="px-12 bg-gradient-to-r from-primary to-purple-600 hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Creating Your Strategy...
                  </>
                ) : planData ? (
                  <>
                    View My Detailed Plan!
                    <ArrowRight className="ml-2 h-5 w-5" />
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
            
            // Create the roadmap in the database
            console.log('Creating roadmap with data:', {
              examDate,
              studyApproach,
              subjects: subjects.length,
              planData: planData ? 'exists' : 'missing'
            });
            
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
              <div className="space-y-6">
                <div className="relative">
                  <div className="animate-spin h-16 w-16 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                  <Users className="h-8 w-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div>
                  <p className="text-xl font-semibold">Analyzing your preferences...</p>
                  <p className="text-muted-foreground">Understanding your study pattern</p>
                </div>
              </div>
            )}
            {animationStep === 2 && (
              <div className="space-y-6">
                <div className="relative">
                  <Sparkles className="h-16 w-16 text-primary mx-auto animate-pulse" />
                  <div className="absolute -top-2 -right-2 animate-bounce">⚡</div>
                </div>
                <div>
                  <p className="text-xl font-semibold">Creating your personalized roadmap...</p>
                  <p className="text-muted-foreground">Crafting daily tasks and milestones</p>
                </div>
                <Progress value={75} className="mx-auto h-3" />
              </div>
            )}
            {animationStep === 3 && (
              <div className="space-y-6">
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
                  <p className="text-sm text-muted-foreground">Step {step + 1} of 6</p>
                </div>
              </div>
              <Progress value={(step / 5) * 100} className="w-32" />
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
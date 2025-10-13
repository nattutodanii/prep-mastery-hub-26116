import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, BookOpen, Target, Trophy, CheckCircle, Clock, Settings, TrendingUp, Zap, Award, Users, Plus, RotateCcw } from 'lucide-react';
import { useExamRoadmap, DailyTask } from '@/hooks/useExamRoadmap';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { DetailedPlanViewer } from './DetailedPlanViewer';
import { NewInteractiveStrategyBuilder } from './NewInteractiveStrategyBuilder';

interface DailyTasksProps {
  onViewSchedule: () => void;
}

export function DailyTasks({ onViewSchedule }: DailyTasksProps) {
  const { roadmap, getCurrentDayTasks, markTaskComplete, updateRoadmap } = useExamRoadmap();
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState(0);
  const [showDetailedPlan, setShowDetailedPlan] = useState(false);
  const [showNewPlanBuilder, setShowNewPlanBuilder] = useState(false);

  if (!roadmap) return null;

  const currentTasks = getCurrentDayTasks();
  const today = new Date();
  const formattedDate = format(today, 'EEEE, MMMM d, yyyy');

  console.log('DailyTasks - roadmap:', roadmap);
  console.log('DailyTasks - currentTasks:', currentTasks);
  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'notes': return <BookOpen className="h-5 w-5" />;
      case 'pyq': return <Target className="h-5 w-5" />;
      case 'practice': return <Trophy className="h-5 w-5" />;
      case 'mock': return <Clock className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  const getTaskColor = (type: string) => {
    switch (type) {
      case 'notes': return 'text-blue-600';
      case 'pyq': return 'text-green-600';
      case 'practice': return 'text-orange-600';
      case 'mock': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const handleTaskClick = (task: any) => {
    // Store the task context in sessionStorage for the target page to use
    const taskContext = {
      chapterId: task.chapter_id,
      chapterName: task.chapter_name,
      subjectName: task.subject_name,
      taskType: task.type,
      autoStart: true
    };
    sessionStorage.setItem('taskContext', JSON.stringify(taskContext));

    // Navigate to the appropriate page
    if (task.type === 'notes') {
      navigate('/notes');
    } else if (task.type === 'pyq') {
      navigate('/chapter-pyqs');
    } else if (task.type === 'practice') {
      navigate('/chapter-practice');
    } else if (task.type === 'mock') {
      navigate('/mock-tests');
    }
  };

  const completedTasks = currentTasks?.tasks.filter(task => task.completed).length || 0;
  const totalTasks = currentTasks?.tasks.length || 0;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const handleViewFullSchedule = () => {
    setShowDetailedPlan(true);
  };

  const handleMakeNewPlan = () => {
    setShowNewPlanBuilder(true);
  };

  const handleNewPlanComplete = async () => {
    setShowNewPlanBuilder(false);
    // The new plan will automatically replace the old one
    window.location.reload(); // Refresh to show new plan
  };

  // Show detailed plan viewer
  if (showDetailedPlan) {
    const planData = {
      examDate: roadmap.exam_date,
      studyApproach: roadmap.study_approach,
      totalDays: roadmap.total_days,
      theoryDays: roadmap.theory_days,
      mockDaysCount: roadmap.mock_days_count,
      dailySchedule: roadmap.daily_schedule
    };

    return (
      <DetailedPlanViewer 
        planData={planData}
        onImplement={() => setShowDetailedPlan(false)}
        onBack={() => setShowDetailedPlan(false)}
      />
    );
  }

  // Show new plan builder
  if (showNewPlanBuilder) {
    return (
      <NewInteractiveStrategyBuilder 
        onStrategyComplete={handleNewPlanComplete}
      />
    );
  }
  return (
    <div className="space-y-8">
      {/* Header with Motivational Message */}
      <div className="text-center space-y-4">
        <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-orange-500/10 p-6 rounded-2xl border border-primary/20">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">
            Welcome Back, Future Master! 
          </h1>
          <p className="text-xl text-muted-foreground mb-3">{formattedDate}</p>
          <p className="text-lg font-medium text-primary">
            Every expert was once a beginner. Let's make today count! 
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={handleViewFullSchedule} className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            View Full Schedule
          </Button>
          <Button variant="outline" onClick={handleMakeNewPlan} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Make New Plan
          </Button>
        </div>
      </div>

      {/* Progress Overview with Insights */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Daily Progress
                </h3>
                <p className="text-muted-foreground">{completedTasks} of {totalTasks} tasks completed</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">{Math.round(progressPercentage)}%</div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </div>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="mt-4 text-sm">
              {progressPercentage === 100 ? (
                <div className="text-green-600 font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Amazing! You're crushing your goals today! 🎉
                </div>
              ) : progressPercentage >= 50 ? (
                <div className="text-orange-600 font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Great progress! Keep the momentum going! ⚡
                </div>
              ) : (
                <div className="text-blue-600 font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Let's get started! Every step counts! 💪
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-green-600" />
              Success Insights
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span><strong>80%</strong> students complete syllabus</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span><strong>Only 1-2%</strong> get top ranks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span><strong>Strategic practice</strong> sets you apart</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-green-100 rounded-lg">
              <p className="text-green-700 font-medium text-sm">
                💡 MastersUp's strategy focuses on both completion AND ranking!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* The Three Daily Task Cards */}
      {currentTasks && currentTasks.tasks.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Notes Card */}
          {(() => {
            const notesTask = currentTasks.tasks.find(task => task.type === 'notes');
            return (
              <Card className={`transition-all hover:shadow-lg ${notesTask?.completed ? 'bg-blue-50 border-blue-200' : 'hover:bg-blue-50/50'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                      <CardTitle className="text-lg text-blue-700">📘 Notes</CardTitle>
                    </div>
                    {notesTask?.completed && <CheckCircle className="h-5 w-5 text-green-600" />}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {notesTask ? (
                    <>
                      <div>
                        <div className="font-medium text-blue-900">{notesTask.chapter_name}</div>
                        <div className="text-sm text-blue-600">{notesTask.subject_name}</div>
                      </div>
                      <div className="text-xs text-blue-500">Est. 15-20 mins reading</div>
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleTaskClick(notesTask)}
                        disabled={notesTask.completed}
                      >
                        {notesTask.completed ? 'Completed ✓' : 'Open Notes'}
                      </Button>
                      {!notesTask.completed && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            markTaskComplete(currentTasks.day_index, currentTasks.tasks.indexOf(notesTask));
                          }}
                        >
                          Mark Done
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4 text-blue-600">
                      <p className="text-sm">No notes today</p>
                      <p className="text-xs text-muted-foreground">Focus on practice & revision</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })()}

          {/* PYQs Card */}
          {(() => {
            const pyqTask = currentTasks.tasks.find(task => task.type === 'pyq');
            return (
              <Card className={`transition-all hover:shadow-lg ${pyqTask?.completed ? 'bg-green-50 border-green-200' : 'hover:bg-green-50/50'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-6 w-6 text-green-600" />
                      <CardTitle className="text-lg text-green-700">📝 PYQs</CardTitle>
                    </div>
                    {pyqTask?.completed && <CheckCircle className="h-5 w-5 text-green-600" />}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pyqTask ? (
                    <>
                      <div>
                        <div className="font-medium text-green-900">{pyqTask.chapter_name}</div>
                        <div className="text-sm text-green-600">{pyqTask.subject_name}</div>
                      </div>
                      <div className="text-xs text-green-500">Previous year questions • 1 set</div>
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => handleTaskClick(pyqTask)}
                        disabled={pyqTask.completed}
                      >
                        {pyqTask.completed ? 'Completed ✓' : 'Start PYQ Set'}
                      </Button>
                      {!pyqTask.completed && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            markTaskComplete(currentTasks.day_index, currentTasks.tasks.indexOf(pyqTask));
                          }}
                        >
                          Mark Done
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4 text-green-600">
                      <p className="text-sm">No PYQs today</p>
                      <p className="text-xs text-muted-foreground">We'll drill this chapter tomorrow</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })()}

          {/* Practice Card */}
          {(() => {
            const practiceTask = currentTasks.tasks.find(task => task.type === 'practice');
            return (
              <Card className={`transition-all hover:shadow-lg ${practiceTask?.completed ? 'bg-orange-50 border-orange-200' : 'hover:bg-orange-50/50'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-6 w-6 text-orange-600" />
                      <CardTitle className="text-lg text-orange-700">🎯 Practice</CardTitle>
                    </div>
                    {practiceTask?.completed && <CheckCircle className="h-5 w-5 text-green-600" />}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {practiceTask ? (
                    <>
                      <div>
                        <div className="font-medium text-orange-900">{practiceTask.chapter_name}</div>
                        <div className="text-sm text-orange-600">{practiceTask.subject_name}</div>
                      </div>
                      <div className="text-xs text-orange-500">Chapter drill • Practice problems</div>
                      <Button 
                        className="w-full bg-orange-600 hover:bg-orange-700"
                        onClick={() => handleTaskClick(practiceTask)}
                        disabled={practiceTask.completed}
                      >
                        {practiceTask.completed ? 'Completed ✓' : 'Start Practice'}
                      </Button>
                      {!practiceTask.completed && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            markTaskComplete(currentTasks.day_index, currentTasks.tasks.indexOf(practiceTask));
                          }}
                        >
                          Mark Done
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4 text-orange-600">
                      <p className="text-sm">No practice today</p>
                      <p className="text-xs text-muted-foreground">Focus on notes & revision</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })()}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Empty state for the three cards */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg text-blue-700 flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                📘 Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <p className="text-blue-600">No notes scheduled today</p>
              <p className="text-xs text-muted-foreground mt-2">Enjoy your rest day!</p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg text-green-700 flex items-center gap-2">
                <Target className="h-6 w-6" />
                📝 PYQs
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <p className="text-green-600">No PYQs scheduled today</p>
              <p className="text-xs text-muted-foreground mt-2">Rest and recharge!</p>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardHeader>
              <CardTitle className="text-lg text-orange-700 flex items-center gap-2">
                <Trophy className="h-6 w-6" />
                🎯 Practice
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <p className="text-orange-600">No practice scheduled today</p>
              <p className="text-xs text-muted-foreground mt-2">
                {currentTasks?.is_mock_day ? "Mock test day!" : "Take a well-deserved break!"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Exam Countdown */}
      {roadmap.exam_date && (
        <Card className="bg-gradient-to-r from-purple-500/10 to-orange-500/10 border-purple-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-4">
              <Trophy className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="text-lg font-semibold text-purple-700 mb-2">🎯 Exam Countdown</h3>
                <div className="flex items-center gap-4 justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">
                      {Math.max(0, Math.ceil((new Date(roadmap.exam_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
                    </p>
                    <p className="text-sm text-purple-500">days left</p>
                  </div>
                  <div className="text-2xl">🔥</div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-purple-600">Ready to conquer?</p>
                    <p className="text-xs text-purple-500">Every day counts!</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Motivational Card */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-amber-800 mb-3 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Remember: You're Not Just Studying, You're Strategizing! 
          </h3>
          <div className="space-y-3 text-sm text-amber-700">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <strong>Notes Power:</strong> Structured content saves 60% study time vs. textbooks
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <strong>PYQ Advantage:</strong> 70% questions repeat patterns from previous years
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <strong>Practice Makes Perfect:</strong> Chapter-wise drilling builds unshakeable foundations
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <strong>Strategic Mocks:</strong> While 80% complete syllabus, only 1-2% crack top ranks through smart practice!
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-amber-100 rounded-lg">
            <p className="text-amber-800 font-medium text-sm text-center">
              💫 Success isn't just about hard work - it's about working strategically!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, BookOpen, Target, CheckCircle2, Play, Trophy, Users, TrendingUp } from 'lucide-react';
import { format, addDays } from 'date-fns';

interface PlanData {
  examDate: string;
  studyApproach: string;
  totalDays: number;
  theoryDays: number;
  mockDaysCount: number;
  dailySchedule: Array<{
    date: string;
    day_index: number;
    tasks: Array<{
      type: 'notes' | 'pyq' | 'practice' | 'mock';
      subject_name: string;
      chapter_name: string;
      chapter_id: string;
      completed: boolean;
    }>;
    is_mock_day: boolean;
  }>;
}

interface DetailedPlanViewerProps {
  planData: PlanData;
  onImplement: () => void;
  onBack: () => void;
}

export function DetailedPlanViewer({ planData, onImplement, onBack }: DetailedPlanViewerProps) {
  const [selectedView, setSelectedView] = React.useState<'month' | 'week' | 'day'>('month');
  const [selectedMonth, setSelectedMonth] = React.useState(0);
  const [selectedWeek, setSelectedWeek] = React.useState(0);

  // Group schedule by months
  const monthlySchedule = React.useMemo(() => {
    const months: Array<{
      name: string;
      weeks: Array<Array<typeof planData.dailySchedule[0]>>;
      totalTasks: number;
      mockCount: number;
    }> = [];

    let currentMonth = -1;
    let currentWeek: Array<typeof planData.dailySchedule[0]> = [];
    let weekIndex = 0;

    planData.dailySchedule.forEach((day, index) => {
      const dayDate = new Date(day.date);
      const monthIndex = dayDate.getMonth();

      // New month
      if (monthIndex !== currentMonth) {
        if (currentWeek.length > 0) {
          if (months[months.length - 1]) {
            months[months.length - 1].weeks.push([...currentWeek]);
          }
          currentWeek = [];
        }
        
        currentMonth = monthIndex;
        months.push({
          name: dayDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          weeks: [],
          totalTasks: 0,
          mockCount: 0
        });
        weekIndex = 0;
      }

      // Add to current week
      currentWeek.push(day);

      // Count tasks and mocks for month
      const monthData = months[months.length - 1];
      monthData.totalTasks += day.tasks.length;
      if (day.is_mock_day) monthData.mockCount++;

      // New week (every 7 days or if it's the last day)
      if (currentWeek.length === 7 || index === planData.dailySchedule.length - 1) {
        monthData.weeks.push([...currentWeek]);
        currentWeek = [];
        weekIndex++;
      }
    });

    return months;
  }, [planData.dailySchedule]);

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'notes': return 'bg-blue-100 text-blue-800';
      case 'pyq': return 'bg-green-100 text-green-800';
      case 'practice': return 'bg-orange-100 text-orange-800';
      case 'mock': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'notes': return '📘';
      case 'pyq': return '📝';
      case 'practice': return '🎯';
      case 'mock': return '🏆';
      default: return '📋';
    }
  };

  const renderMonthView = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Your {Math.ceil(planData.totalDays / 30)}-Month Master Roadmap 🗺️
        </h2>
        <p className="text-lg text-muted-foreground">
          Tap a month → explore weeks → drill into daily plans
        </p>
      </div>

      <div className="grid gap-6">
        {monthlySchedule.map((month, index) => (
          <Card 
            key={index} 
            className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-102"
            onClick={() => {
              setSelectedMonth(index);
              setSelectedView('week');
            }}
          >
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{month.name}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="secondary">{month.weeks.length} weeks</Badge>
                  <Badge variant="outline">{month.mockCount} mocks</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{month.totalTasks}</div>
                  <div className="text-sm text-blue-600">Total Tasks</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{month.mockCount}</div>
                  <div className="text-sm text-purple-600">Mock Tests</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{month.weeks.length}</div>
                  <div className="text-sm text-green-600">Weeks</div>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <Button variant="outline" className="w-full">
                  View Weekly Breakdown →
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-green-900">Smart Distribution Strategy</h3>
          </div>
          <div className="text-sm text-green-700 space-y-2">
            <p>📚 <strong>Subject Rotation:</strong> We'll keep subjects rotating: S1→S2→S3→… then next chapter</p>
            <p>⚡ <strong>Balanced Load:</strong> {planData.studyApproach} split ensures optimal learning pace</p>
            <p>🎯 <strong>Strategic Mocks:</strong> Placed on your chosen days for maximum impact</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderWeekView = () => {
    const month = monthlySchedule[selectedMonth];
    if (!month) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{month.name} - Weekly View</h2>
            <p className="text-muted-foreground">Choose a week to see daily breakdown</p>
          </div>
          <Button variant="outline" onClick={() => setSelectedView('month')}>
            ← Back to Months
          </Button>
        </div>

        <div className="grid gap-4">
          {month.weeks.map((week, weekIndex) => (
            <Card 
              key={weekIndex}
              className="cursor-pointer hover:shadow-md transition-all"
              onClick={() => {
                setSelectedWeek(weekIndex);
                setSelectedView('day');
              }}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Week {weekIndex + 1}</CardTitle>
                  <Badge variant="outline">{week.length} days</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {week.map((day, dayIndex) => (
                    <div key={dayIndex} className="text-center p-2 bg-muted/50 rounded">
                      <div className="text-xs font-medium">
                        {format(new Date(day.date), 'EEE')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(day.date), 'dd')}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1 justify-center">
                        {day.tasks.map((task, taskIndex) => (
                          <div 
                            key={taskIndex}
                            className={`w-2 h-2 rounded-full ${
                              task.type === 'notes' ? 'bg-blue-500' :
                              task.type === 'pyq' ? 'bg-green-500' :
                              task.type === 'practice' ? 'bg-orange-500' : 'bg-purple-500'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const month = monthlySchedule[selectedMonth];
    const week = month?.weeks[selectedWeek];
    if (!week) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Week {selectedWeek + 1} - Daily Tasks</h2>
            <p className="text-muted-foreground">{month.name}</p>
          </div>
          <Button variant="outline" onClick={() => setSelectedView('week')}>
            ← Back to Weeks
          </Button>
        </div>

        <div className="grid gap-4">
          {week.map((day, dayIndex) => (
            <Card key={dayIndex}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {format(new Date(day.date), 'EEEE, MMMM d')}
                  </CardTitle>
                  <Badge variant={day.is_mock_day ? 'destructive' : 'secondary'}>
                    {day.is_mock_day ? 'Mock Day' : 'Study Day'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {day.tasks.length > 0 ? (
                  <div className="space-y-3">
                    {day.tasks.map((task, taskIndex) => (
                      <div key={taskIndex} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl">{getTaskIcon(task.type)}</div>
                        <div className="flex-1">
                          <div className="font-medium">{task.chapter_name}</div>
                          <div className="text-sm text-muted-foreground">{task.subject_name}</div>
                        </div>
                        <Badge className={getTaskTypeColor(task.type)}>
                          {task.type.toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Rest day - No tasks scheduled</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-purple-50/50 to-secondary/5">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Your Personalized Study Plan</h1>
                <p className="text-sm text-muted-foreground">
                  {planData.totalDays} days • {planData.studyApproach} approach • {planData.mockDaysCount} mock tests
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onBack}>
                  ← Back to Builder
                </Button>
                <Button 
                  onClick={onImplement}
                  className="bg-gradient-to-r from-primary to-purple-600 hover:shadow-xl"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Implement This Plan
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Plan Overview Stats */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6 text-center">
                  <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-blue-700">{planData.totalDays}</div>
                  <div className="text-sm text-blue-600">Total Days</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-green-700">{planData.theoryDays}</div>
                  <div className="text-sm text-green-600">Study Days</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6 text-center">
                  <Trophy className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-purple-700">{planData.mockDaysCount}</div>
                  <div className="text-sm text-purple-600">Mock Tests</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-6 text-center">
                  <Target className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-orange-700">{planData.studyApproach}</div>
                  <div className="text-sm text-orange-600">Study Split</div>
                </CardContent>
              </Card>
            </div>

            {/* Exam Date Info */}
            <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold text-red-800 mb-2">🎯 Target Exam Date</h3>
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {format(new Date(planData.examDate), 'EEEE, MMMM d, yyyy')}
                </div>
                <p className="text-red-700">
                  {Math.ceil((new Date(planData.examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days from today
                </p>
              </CardContent>
            </Card>

            {/* View Navigation */}
            <div className="flex justify-center gap-4">
              <Button 
                variant={selectedView === 'month' ? 'default' : 'outline'}
                onClick={() => setSelectedView('month')}
              >
                Month View
              </Button>
              <Button 
                variant={selectedView === 'week' ? 'default' : 'outline'}
                onClick={() => setSelectedView('week')}
                disabled={selectedView === 'month'}
              >
                Week View
              </Button>
              <Button 
                variant={selectedView === 'day' ? 'default' : 'outline'}
                onClick={() => setSelectedView('day')}
                disabled={selectedView === 'month' || selectedView === 'week'}
              >
                Daily View
              </Button>
            </div>

            {/* Dynamic Content Based on View */}
            {selectedView === 'month' && renderMonthView()}
            {selectedView === 'week' && renderWeekView()}
            {selectedView === 'day' && renderDayView()}

            {/* Implementation CTA */}
            <Card className="bg-gradient-to-r from-primary to-purple-600 text-white">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Ready to Start Your Journey? 🚀</h3>
                <p className="text-lg opacity-90 mb-6">
                  Your personalized study plan is ready! Click below to implement and start your daily study routine.
                </p>
                <Button 
                  size="lg"
                  variant="secondary"
                  onClick={onImplement}
                  className="px-8 py-3 text-lg font-semibold"
                >
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Implement This Plan & Start Today!
                </Button>
                <p className="text-sm opacity-75 mt-4">
                  You'll see your daily tasks every time you open MastersUp
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
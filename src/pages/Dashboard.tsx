import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useExamRoadmap } from "@/hooks/useExamRoadmap";
import { NewInteractiveStrategyBuilder } from "@/components/dashboard/NewInteractiveStrategyBuilder";
import { DailyTasks } from "@/components/dashboard/DailyTasks";
import { supabase } from "@/integrations/supabase/client";

export function Dashboard() {
  const { profile } = useProfile();
  const { roadmap, loading, refetch } = useExamRoadmap();
  const [showSchedule, setShowSchedule] = useState(false);
  const [showStrategyBuilder, setShowStrategyBuilder] = useState(false);
  const [courseData, setCourseData] = useState<{course_name?: string, exam_name?: string}>({});

  const handleStrategyComplete = () => {
    setShowStrategyBuilder(false);
    refetch();
  };

  // Get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Fetch course data
  useEffect(() => {
    const fetchCourseData = async () => {
      if (profile?.selected_course_id) {
        try {
          const { data } = await supabase
            .from('courses')
            .select(`
              name,
              exams!inner(name)
            `)
            .eq('id', profile.selected_course_id)
            .single();
          
          if (data) {
            setCourseData({
              course_name: data.name,
              exam_name: data.exams.name
            });
          }
        } catch (error) {
          console.error('Error fetching course data:', error);
        }
      }
    };
    
    fetchCourseData();
  }, [profile?.selected_course_id]);

  // Show strategy builder if no roadmap exists
  if (!loading && !roadmap && !showStrategyBuilder) {
    const greeting = getTimeBasedGreeting();
    const userName = profile?.name || 'Master';
    const courseName = courseData.course_name || 'your dream course';
    const examName = courseData.exam_name || courseName;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Greeting Badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border">
              <span className="text-2xl">☀️</span>
              <span className="font-medium text-foreground">{greeting}, {userName}!</span>
            </div>
          </div>

          {/* Main Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              Ready to Master<br />
              <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {examName}? 🚀
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We don't provide classes — only top-quality <strong>Notes + PYQs + Practice</strong>.<br />
              Because self-study + strategic practice = mastery.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto">
                  <span className="text-2xl">📘</span>
                </div>
                <h3 className="font-bold text-blue-900">Smart Notes</h3>
                <p className="text-sm text-blue-700">
                  Structured, expert-curated content that saves 60% of your study time compared to textbooks.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-bold text-green-900">PYQ Mastery</h3>
                <p className="text-sm text-green-700">
                  10+ years of previous papers with detailed solutions. 70% higher chance of similar questions.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="font-bold text-orange-900">Strategic Practice</h3>
                <p className="text-sm text-orange-700">
                  Chapter-wise drills that build unshakeable foundations with adaptive difficulty.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Success Formula */}
          <Card className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 text-white border-0 overflow-hidden relative">
            <CardContent className="p-8 relative z-10">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-medium">The MastersUp Success Formula</span>
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-4 text-lg font-medium">
                  <div className="bg-white/20 px-6 py-3 rounded-lg backdrop-blur">Smart Study</div>
                  <span className="text-2xl">+</span>
                  <div className="bg-white/20 px-6 py-3 rounded-lg backdrop-blur">Strategic Practice</div>
                  <span className="text-2xl">+</span>
                  <div className="bg-white/20 px-6 py-3 rounded-lg backdrop-blur">Expert Guidance</div>
                  <span className="text-2xl">=</span>
                  <div className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-bold">Dream College</div>
                </div>

                <p className="text-white/90 max-w-3xl mx-auto">
                  From ISI to IITs, JNU to BHU — we've got every master's entrance covered with personalized strategies that actually work.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '👥', number: '50,000+', label: 'Students Enrolled' },
              { icon: '✅', number: '85%', label: 'Success Rate' },
              { icon: '🎓', number: '25+', label: 'Entrance Exams' },
              { icon: '🎯', number: '100+', label: 'Master Programs' }
            ].map((stat, i) => (
              <Card key={i} className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-primary">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>

          {/* AI Planning CTA */}
          <Card className="bg-gradient-to-br from-purple-100 to-blue-100 border-purple-200">
            <CardContent className="p-8 text-center space-y-6">
              <div className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-full">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">AI-Powered Study Planning</span>
              </div>
              
              <h2 className="text-3xl font-bold text-foreground">
                Let's Create Your Personalized Success Strategy
              </h2>
              
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our AI analyzes your preferences, exam date, and study patterns to create a day-by-day roadmap that actually works.
              </p>

              <Button 
                size="lg" 
                onClick={() => setShowStrategyBuilder(true)}
                className="px-12 py-6 text-lg bg-gradient-to-r from-primary to-purple-600 hover:shadow-xl transition-all"
              >
                Create My Master Plan
              </Button>

              <p className="text-sm text-muted-foreground">
                ⚡ Takes just 2 minutes • Personalized for your exam date • Adapts to your pace
              </p>
            </CardContent>
          </Card>

          {/* Why Different Section */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-center">Why MastersUp is Different</h2>
            <p className="text-center text-muted-foreground">
              While others focus on completion, we focus on ranking. Here's how we help you stand out.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="font-bold text-red-900">The Reality Check</h3>
                  <ul className="space-y-2 text-sm text-red-700">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span><strong>80%</strong> students complete the syllabus</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>Only <strong>1-2%</strong> get top ranks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span><strong>The difference?</strong> Strategic practice</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h3 className="font-bold text-green-900">The MastersUp Advantage</h3>
                  <ul className="space-y-2 text-sm text-green-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span><strong>Personalized</strong> daily study plans</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span><strong>Strategic</strong> mock test timing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span><strong>Rank-focused</strong> preparation approach</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Motivation Section */}
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Top Learning Motivation 🔥</CardTitle>
              <CardDescription className="text-center">Get inspired to create your personalized schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                  <div className="text-4xl mb-3">💪</div>
                  <p className="font-medium text-sm">
                    "Every master was once a beginner. Your consistent effort today builds expertise tomorrow."
                  </p>
                </div>
                <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                  <div className="text-4xl mb-3">🎯</div>
                  <p className="font-medium text-sm">
                    "Success isn't about being the smartest. It's about being the most strategic and consistent."
                  </p>
                </div>
                <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                  <div className="text-4xl mb-3">🚀</div>
                  <p className="font-medium text-sm">
                    "Your personalized plan adapts to YOU — making every minute count toward your dream college."
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show strategy builder
  if (showStrategyBuilder) {
    return <NewInteractiveStrategyBuilder onStrategyComplete={handleStrategyComplete} />;
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Loading your roadmap...</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-20 bg-muted animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show daily tasks if roadmap exists
  return <DailyTasks onViewSchedule={() => setShowSchedule(true)} />;
}
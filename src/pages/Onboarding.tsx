import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Trophy, Users, Clock, TrendingUp, BookOpen, Target, Award, Star, Zap, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ExamDetailPage } from "@/components/onboarding/ExamDetailPage";
import { CourseDetailPage } from "@/components/onboarding/CourseDetailPage";
import { useNavigate } from "react-router-dom";

export default function Onboarding() {
  const [exams, setExams] = useState<any[]>([]);
  const [onboardingContent, setOnboardingContent] = useState<any>(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [examsResponse, onboardingResponse, plansResponse] = await Promise.all([
        supabase
          .from('exams')
          .select(`
            *,
            courses (
              id,
              name,
              description
            )
          `)
          .order('name'),
        supabase
          .from('onboarding_content')
          .select('*')
          .eq('is_active', true)
          .single(),
        supabase
          .from('gosuper')
          .select('*')
          .order('current_price')
      ]);

      if (examsResponse.error) throw examsResponse.error;
      if (onboardingResponse.error) throw onboardingResponse.error;
      if (plansResponse.error) throw plansResponse.error;

      setExams(examsResponse.data || []);
      setOnboardingContent(onboardingResponse.data);
      setSubscriptionPlans(plansResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handleExamSelect = (examId: string) => {
    setSelectedExam(examId);
  };

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourse(courseId);
  };

  const handleBack = () => {
    if (selectedCourse) {
      setSelectedCourse(null);
    } else if (selectedExam) {
      setSelectedExam(null);
    }
  };

  if (selectedCourse) {
    return (
      <CourseDetailPage
        courseId={selectedCourse}
        onBack={handleBack}
      />
    );
  }

  if (selectedExam) {
    return (
      <ExamDetailPage
        examId={selectedExam}
        onBack={handleBack}
        onCourseSelect={handleCourseSelect}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-purple-50 to-blue-50">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-primary font-medium">
              <Sparkles className="h-4 w-4" />
              {onboardingContent?.top_badge || "India's #1 Masters Entrance Prep Platform"}
            </div>
            
            <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight">
              {onboardingContent?.main_headline?.split(' ').slice(0, 3).join(' ') || "Your Gateway to"}
              <br />
              <span className="text-5xl">🎯 {onboardingContent?.main_headline?.split(' ').slice(3).join(' ') || "Dream Masters Programs"}</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {onboardingContent?.description || "From ISI to IITs, JNU to BHU - we've got every masters entrance covered! Join 50,000+ students who've cracked their dream programs with MastersUp 🚀"}
            </p>

            {/* Key Features */}
            <div className="grid md:grid-cols-4 gap-6 mt-12">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border shadow-sm hover:shadow-md transition-all">
                <div className="text-3xl mb-3">📚</div>
                <h3 className="font-bold mb-2">Chapter-wise Tests</h3>
                <p className="text-sm text-muted-foreground">Detailed practice for every topic</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border shadow-sm hover:shadow-md transition-all">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="font-bold mb-2">Previous Year Papers</h3>
                <p className="text-sm text-muted-foreground">10+ years of solved PYQs</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border shadow-sm hover:shadow-md transition-all">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="font-bold mb-2">Mock Tests</h3>
                <p className="text-sm text-muted-foreground">Full-length simulation tests</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border shadow-sm hover:shadow-md transition-all">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="font-bold mb-2">AI Analytics</h3>
                <p className="text-sm text-muted-foreground">Track progress & improve</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 px-8 py-3 text-lg"
                onClick={handleGetStarted}
              >
                Start Your Journey 🚀
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <div className="text-sm text-muted-foreground">
                ✨ No credit card required • 5 tests and 2 notes free
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Stats */}
      <div className="bg-white py-12 border-y">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">{onboardingContent?.stats_students || "50,000+"}</div>
              <div className="text-muted-foreground">{onboardingContent?.stats_students_label || "Students Enrolled"}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">{onboardingContent?.stats_success_rate || "85%"}</div>
              <div className="text-muted-foreground">{onboardingContent?.stats_success_rate_label || "Success Rate"}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">{onboardingContent?.stats_entrance_exams || "25+"}</div>
              <div className="text-muted-foreground">{onboardingContent?.stats_entrance_exams_label || "Entrance Exams"}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">{onboardingContent?.stats_master_programs || "100+"}</div>
              <div className="text-muted-foreground">{onboardingContent?.stats_master_programs_label || "Master Programs"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {/* Available Programs Section - Moved to Top */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            🎓 Available Programs & Entrance Exams
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Explore India's most prestigious entrance exams and the amazing opportunities they unlock!
            Start your preparation journey with comprehensive study materials and test series.
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {exams.map((exam) => (
              <Card key={exam.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20 cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                        {exam.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {exam.short_description || exam.description}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {exam.established_year || 'Premier'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Target className="h-4 w-4 text-primary" />
                      <span>{exam.location || 'India'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span>Premier Institution</span>
                    </div>
                    {exam.courses && exam.courses.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span>{exam.courses.length} program{exam.courses.length !== 1 ? 's' : ''} available</span>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full group-hover:bg-primary group-hover:text-white transition-all"
                    variant="outline"
                    onClick={() => handleExamSelect(exam.id)}
                  >
                    Explore Programs & Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Early Bird Offer */}
        {onboardingContent?.early_bird_offer_active && (
          <div className="mb-16">
            <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white border-0 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge className="bg-yellow-400 text-black font-bold animate-pulse">
                  🔥 HOTTEST DEAL
                </Badge>
              </div>
              <CardContent className="p-12 text-center">
                <h3 className="text-4xl font-bold mb-4">
                  ⚡ {onboardingContent?.early_bird_title || "Limited Time Deal - Early Bird Special!"}
                </h3>
                <p className="text-2xl font-bold mb-4 text-yellow-200">
                  {onboardingContent?.early_bird_description || "One Subscription • All Courses • All Exams Access"}
                </p>
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="bg-white/20 px-4 py-2 rounded-lg">
                    <div className="text-sm opacity-90">Only for first</div>
                    <div className="text-2xl font-bold">{onboardingContent?.early_bird_users_limit || 10000}</div>
                    <div className="text-sm opacity-90">users</div>
                  </div>
                  <div className="bg-white/20 px-4 py-2 rounded-lg">
                    <div className="text-sm opacity-90">Already claimed</div>
                    <div className="text-2xl font-bold text-yellow-200">{onboardingContent?.early_bird_users_claimed || 0}</div>
                    <div className="text-sm opacity-90">spots</div>
                  </div>
                </div>
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="px-8 py-3 text-lg font-semibold bg-yellow-400 text-black hover:bg-yellow-300"
                  onClick={handleGetStarted}
                >
                  🔥 Claim Your Spot Now!
                </Button>
                <p className="text-sm opacity-75 mt-4">
                  ⏰ Limited time offer • Closing soon • Don't miss out!
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Subscription Plans */}
        {subscriptionPlans.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">
                💎 Choose Your Success Plan
              </h2>
              <p className="text-xl text-muted-foreground">
                Pick the perfect plan to accelerate your masters entrance preparation
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {subscriptionPlans.map((plan) => (
                <Card key={plan.id} className={`relative ${plan.popular ? 'ring-2 ring-primary shadow-xl transform scale-105' : ''} hover:shadow-lg transition-all`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-white px-4 py-1">
                        <Crown className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{plan.plan_name}</CardTitle>
                    <div className="space-y-2">
                      <div className="text-4xl font-bold text-primary">
                        ₹{plan.current_price}
                      </div>
                      {plan.original_price > plan.current_price && (
                        <div className="text-lg text-muted-foreground line-through">
                          ₹{plan.original_price}
                        </div>
                      )}
                      <Badge variant="secondary" className="text-green-600">
                        {plan.discount_percentage}% OFF
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {plan.features && typeof plan.features === 'object' && Object.entries(plan.features).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-2">
                        <Zap className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                        <span className="text-sm">{String(value)}</span>
                      </div>
                    ))}
                    <Button 
                      className="w-full mt-6" 
                      variant={plan.popular ? "default" : "outline"}
                      onClick={handleGetStarted}
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Ready to Begin Preparation - Prominent CTA */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-primary to-purple-600 text-white border-0">
            <CardContent className="p-12 text-center">
              <h3 className="text-4xl font-bold mb-4">
                🚀 Ready to Begin Your Masters Journey?
              </h3>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Join thousands of successful students who chose MastersUp for their preparation. 
                Your dream program is just one click away!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="px-8 py-3 text-lg font-semibold"
                  onClick={handleGetStarted}
                >
                  Start Your Journey Now! 🚀
                </Button>
              </div>
              <p className="text-sm opacity-75 mt-4">
                ✨ 5 tests and 2 notes free • No commitments • Cancel anytime
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-2xl font-bold mb-4">Study Materials & Notes</h3>
              <p className="text-muted-foreground mb-6">
                Access comprehensive notes, short notes, and study materials for all subjects
              </p>
              <Button 
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                onClick={handleGetStarted}
              >
                Browse Study Materials
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold mb-4">Test Series & Practice</h3>
              <p className="text-muted-foreground mb-6">
                Practice with chapter-wise tests, mock tests, and previous year questions
              </p>
              <Button 
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                onClick={handleGetStarted}
              >
                Start Practice Tests
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Exam Information Hub */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            🏛️ Detailed Exam Information Hub
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get in-depth information about entrance exams, admission procedures, campus life, and everything you need to know!
          </p>
        </div>

        {/* Why Choose MastersUp */}
        <div className="bg-gradient-to-r from-primary/5 to-purple-50 rounded-2xl p-8 mb-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4">
              🚀 Why 50,000+ Students Choose MastersUp?
            </h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h4 className="font-bold mb-2">Comprehensive Coverage</h4>
              <p className="text-muted-foreground">Every topic, every exam, every question type covered in detail</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h4 className="font-bold mb-2">AI-Powered Analytics</h4>
              <p className="text-muted-foreground">Track your progress and identify areas for improvement</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🏆</div>
              <h4 className="font-bold mb-2">Proven Success</h4>
              <p className="text-muted-foreground">85% of our students crack their target exams</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

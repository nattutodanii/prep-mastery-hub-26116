
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Clock, Users, DollarSign, TrendingUp, BookOpen, Target, Award, Star, GraduationCap, Calendar, MapPin, FileText, Brain, Download, ExternalLink, CheckCircle, School, Lightbulb, Globe, Code, Users2, Heart, Trophy, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { EnhancedContentRenderer } from "@/components/common/EnhancedContentRenderer";
import { generatePDF } from "@/utils/pdfGenerator";
import { toast } from "sonner";

interface CourseDetailPageProps {
  courseId: string;
  onBack: () => void;
}

const courseTableOfContents = [
  { id: 'overview', title: 'Course Overview', icon: BookOpen },
  { id: 'entrance-exam', title: 'Entrance Exam & Admission', icon: Target },
  { id: 'placement', title: 'Placement Statistics', icon: TrendingUp },
  { id: 'exam-pattern', title: 'Exam Pattern', icon: Brain },
  { id: 'skills', title: 'Skills & Learning Outcomes', icon: Star },
  { id: 'admission', title: 'Admission Procedure', icon: CheckCircle },
  { id: 'preparation', title: 'Preparation Strategy', icon: Target },
  { id: 'syllabus', title: 'Syllabus', icon: FileText },
  { id: 'notes', title: 'Notes', icon: BookOpen },
  { id: 'short-notes', title: 'Short Notes', icon: FileText },
  { id: 'chapter-questions', title: 'Chapter-wise Questions', icon: FileText },
  { id: 'mock-tests', title: 'Full-length Mock Tests', icon: Brain },
  { id: 'curriculum', title: 'Course Curriculum', icon: School },
  { id: 'projects', title: 'Projects & Assignments', icon: Code },
  { id: 'day-in-life', title: 'Day in the Life', icon: Heart },
  { id: 'campus-life', title: 'Campus Life', icon: Users2 },
  { id: 'alumni', title: 'Alumni Success Stories', icon: Trophy },
  { id: 'global-exposure', title: 'Global Exposure', icon: Globe },
  { id: 'comparison', title: 'Course Comparison', icon: Award },
];

export function CourseDetailPage({ courseId, onBack }: CourseDetailPageProps) {
  const [course, setCourse] = useState<any>(null);
  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      // Fetch course details with exam info
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select(`
          *,
          exams (*)
        `)
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;

      setCourse(courseData);
      setExam(courseData.exams);
    } catch (error) {
      console.error('Error fetching course details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPreparation = () => {
    navigate('/auth');
  };

  const handleDownloadPDF = async () => {
    if (!course) return;

    try {
      toast.loading('Generating PDF...');
      
      const content: Record<string, string> = {
        course_overview: course.course_overview || course.description || '',
        entrance_exam_details: course.entrance_exam_details || '',
        placement_statistics: course.placement_statistics || '',
        exam_pattern: course.exam_pattern || '',
        skills_learning_outcomes: course.skills_learning_outcomes || '',
        admission_procedure: course.admission_procedure || '',
        preparation_strategy: course.preparation_strategy || '',
        syllabus: course.syllabus || '',
        notes: course.notes || '',
        short_notes: course.short_notes || '',
        chapter_wise_questions: course.chapter_wise_questions || '',
        full_length_mocks: course.full_length_mocks || '',
        course_curriculum: course.course_curriculum || '',
        projects_assignments: course.projects_assignments || '',
        day_in_life: course.day_in_life || '',
        campus_life: course.campus_life || '',
        alumni_stories: course.alumni_stories || '',
        global_exposure: course.global_exposure || '',
        course_comparison: course.course_comparison || ''
      };

      await generatePDF({
        title: course.name,
        content,
        type: 'course'
      });

      toast.dismiss();
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to generate PDF. Please try again.');
      console.error('Error generating PDF:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground mb-4">Course not found</h2>
          <Button onClick={onBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{course.name}</h1>
                <p className="text-muted-foreground">{exam?.name} • Complete Information & Preparation Guide</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline"
                onClick={handleDownloadPDF}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
              <Button 
                onClick={() => window.location.href = '/auth'}
                className="bg-primary hover:bg-primary/90"
              >
                Login / Sign Up
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="text-center space-y-6">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              {course.name}: Complete Guide 🎓
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              {course.course_overview || course.description}
            </p>
            
            {/* Key Stats */}
            <div className="grid md:grid-cols-4 gap-6 mt-8">
              <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-2">⏱️</div>
                <div className="text-2xl font-bold text-primary">{course.duration || 'N/A'}</div>
                <div className="text-sm text-muted-foreground">Duration</div>
              </div>
              <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-2">👥</div>
                <div className="text-2xl font-bold text-primary">{course.intake_capacity || 'Limited'}</div>
                <div className="text-sm text-muted-foreground">Seats</div>
              </div>
              <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-2">💰</div>
                <div className="text-2xl font-bold text-green-600">{course.average_package || 'Excellent'}</div>
                <div className="text-sm text-muted-foreground">Avg Package</div>
              </div>
              <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-2">🎓</div>
                <div className="text-2xl font-bold text-blue-600">{course.degree_type || 'Professional'}</div>
                <div className="text-sm text-muted-foreground">Degree Type</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Information Section */}
        <div className="bg-gradient-to-br from-primary/5 to-purple-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8">Quick Information</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border shadow-sm text-center">
                  <div className="text-3xl mb-3">⏱️</div>
                  <h3 className="font-bold mb-2">Duration</h3>
                  <p className="text-sm text-muted-foreground">{course.duration || '2 Years'}</p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border shadow-sm text-center">
                  <div className="text-3xl mb-3">🎓</div>
                  <h3 className="font-bold mb-2">Degree Type</h3>
                  <p className="text-sm text-muted-foreground">{course.degree_type || 'Master\'s Degree'}</p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border shadow-sm text-center">
                  <div className="text-3xl mb-3">👥</div>
                  <h3 className="font-bold mb-2">Intake Capacity</h3>
                  <p className="text-sm text-muted-foreground">{course.intake_capacity || 'Limited Seats'}</p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border shadow-sm text-center">
                  <div className="text-3xl mb-3">💰</div>
                  <h3 className="font-bold mb-2">Average Package</h3>
                  <p className="text-sm text-muted-foreground">{course.average_package || 'Competitive'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ready to Begin Preparation Section */}
        <div className="bg-gradient-to-r from-primary to-purple-600 py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold text-white mb-6">
                🚀 Ready to Begin Your {course.name} Journey?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Join thousands of successful students who chose MastersUp for their preparation. 
                Your dream program is just one click away!
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                className="px-8 py-3 text-lg font-semibold"
                onClick={handleStartPreparation}
              >
                Start Your Journey Now! 🚀
              </Button>
              <p className="text-sm text-white/75 mt-4">
                ✨ 5 tests and 2 notes free • No commitments • Cancel anytime
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Sidebar */}
        <div 
          className={`fixed top-0 right-0 h-full w-80 bg-white/95 backdrop-blur-sm border-l shadow-xl z-50 transform transition-transform duration-300 ${
            isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onMouseLeave={() => setIsSidebarOpen(false)}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Table of Contents</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <nav className="space-y-2 max-h-[calc(100vh-120px)] overflow-y-auto">
              {courseTableOfContents.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary rounded-lg transition-colors group"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  {item.title}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Sidebar Trigger */}
        <div 
          className="fixed top-1/2 right-0 transform -translate-y-1/2 z-40"
          onMouseEnter={() => setIsSidebarOpen(true)}
        >
          <div className="bg-primary text-primary-foreground px-2 py-8 rounded-l-lg cursor-pointer hover:bg-primary-hover transition-colors shadow-lg">
            <Menu className="h-5 w-5 rotate-90" />
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Main Content - Full Width */}
          <div className="max-w-6xl mx-auto space-y-8 pr-8">
            {/* Course Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <BookOpen className="h-6 w-6 text-primary" />
                  Course Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-foreground leading-relaxed">
                  <EnhancedContentRenderer content={course.course_overview || course.description || ''} />
                </div>
              </CardContent>
            </Card>

            {/* Entrance Exam & Admission */}
            {course.entrance_exam_details && (
              <Card id="entrance-exam" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-6 w-6 text-orange-500" />
                    Entrance Exam & Admission
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-foreground leading-relaxed">
                    <EnhancedContentRenderer content={course.entrance_exam_details || ''} />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Placement Statistics */}
            {course.placement_statistics && (
              <Card id="placement" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                    Placement Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-foreground leading-relaxed">
                    <EnhancedContentRenderer content={course.placement_statistics || ''} />
                  </div>
                  
                  {course.average_package && (
                    <div className="grid md:grid-cols-2 gap-4 mt-6">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{course.average_package}</div>
                        <div className="text-sm text-muted-foreground">Average Package</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">100%</div>
                        <div className="text-sm text-muted-foreground">Placement Rate</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Exam Pattern */}
            {course.exam_pattern && (
              <Card id="exam-pattern" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-6 w-6 text-purple-600" />
                    Exam Pattern
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-foreground leading-relaxed">
                    <EnhancedContentRenderer content={course.exam_pattern || ''} />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Skills & Learning Outcomes */}
            {course.skills_learning_outcomes && (
              <Card id="skills" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-6 w-6 text-yellow-500" />
                    Skills & Learning Outcomes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-foreground leading-relaxed">
                    <EnhancedContentRenderer content={course.skills_learning_outcomes || ''} />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Admission Procedure */}
            {course.admission_procedure && (
              <Card id="admission" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    Admission Procedure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-foreground leading-relaxed">
                    <EnhancedContentRenderer content={course.admission_procedure || ''} />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Preparation Strategy */}
            <Card id="preparation" className="scroll-mt-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-6 w-6 text-blue-500" />
                  Preparation Strategy with MastersUp 🚀
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {course.preparation_strategy && (
                  <div className="text-foreground leading-relaxed">
                    <EnhancedContentRenderer content={course.preparation_strategy || ''} />
                  </div>
                )}
                
                <div className="bg-gradient-to-r from-primary/10 to-purple-100 p-6 rounded-xl border border-primary/20">
                  <h4 className="font-bold text-primary mb-4">🎯 Master {course.name} with MastersUp!</h4>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Chapter-wise Practice Tests
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Previous Year Questions
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Full-length Mock Tests
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Detailed Study Notes
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Performance Analytics
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Expert Test Series
                      </div>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-primary to-purple-600"
                    onClick={handleStartPreparation}
                  >
                    Start Your {course.name} Preparation Journey! 🚀
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Syllabus */}
            {course.syllabus && (
              <Card id="syllabus" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-indigo-600" />
                    Syllabus
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-foreground leading-relaxed">
                    <EnhancedContentRenderer content={course.syllabus || ''} />
                  </div>
                  
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-indigo-700">📋 Detailed Syllabus Available!</h4>
                        <p className="text-sm text-muted-foreground">Get comprehensive syllabus with chapter-wise breakdown</p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="shrink-0"
                        onClick={handleStartPreparation}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white" 
                        onClick={handleStartPreparation}
                      >
                        View Detailed Syllabus 📖
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleStartPreparation}
                      >
                        Notes Section 📝
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {course.notes && (
              <Card id="notes" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-emerald-600" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">{course.notes}</p>
                  
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-200">
                    <h4 className="font-bold text-emerald-700 mb-2">📚 Comprehensive Study Notes</h4>
                    <p className="text-sm text-muted-foreground mb-4">Detailed notes covering all topics with examples and explanations</p>
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white" 
                      onClick={handleStartPreparation}
                    >
                      Access Study Notes 📖
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Short Notes */}
            {course.short_notes && (
              <Card id="short-notes" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-cyan-600" />
                    Short Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">{course.short_notes}</p>
                  
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-xl border border-cyan-200">
                    <h4 className="font-bold text-cyan-700 mb-2">📝 Quick Revision Notes</h4>
                    <p className="text-sm text-muted-foreground mb-4">Concise notes for last-minute revision and quick reference</p>
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white" 
                      onClick={handleStartPreparation}
                    >
                      Access Short Notes 🔖
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Chapter-wise Questions */}
            {course.chapter_wise_questions && (
              <Card id="chapter-questions" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-amber-600" />
                    Chapter-wise Questions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">{course.chapter_wise_questions}</p>
                  
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200">
                    <h4 className="font-bold text-amber-700 mb-2">🎯 Practice Chapter-wise Questions</h4>
                    <p className="text-sm text-muted-foreground mb-4">Topic-wise questions for focused preparation</p>
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-amber-600 to-orange-600 text-white" 
                      onClick={handleStartPreparation}
                    >
                      Start Practice 🚀
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Full-length Mock Tests */}
            {course.full_length_mocks && (
              <Card id="mock-tests" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-6 w-6 text-purple-600" />
                    Full-length Mock Tests
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">{course.full_length_mocks}</p>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                    <h4 className="font-bold text-purple-700 mb-2">🧠 Take Mock Tests</h4>
                    <p className="text-sm text-muted-foreground mb-4">Simulate actual exam conditions with timed tests</p>
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white" 
                      onClick={handleStartPreparation}
                    >
                      Take Mock Test 🎯
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Course Curriculum */}
            {course.course_curriculum && (
              <Card id="curriculum" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <School className="h-6 w-6 text-blue-600" />
                    Course Curriculum (Semester-wise)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{course.course_curriculum}</p>
                </CardContent>
              </Card>
            )}

            {/* Projects & Assignments */}
            {course.projects_assignments && (
              <Card id="projects" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-6 w-6 text-green-600" />
                    Projects & Assignments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{course.projects_assignments}</p>
                </CardContent>
              </Card>
            )}

            {/* Day in the Life of a Student */}
            {course.day_in_life && (
              <Card id="day-in-life" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-6 w-6 text-pink-600" />
                    Day in the Life of a Student
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{course.day_in_life}</p>
                </CardContent>
              </Card>
            )}

            {/* Campus Life */}
            {course.campus_life && (
              <Card id="campus-life" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users2 className="h-6 w-6 text-indigo-600" />
                    Campus Life
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{course.campus_life}</p>
                </CardContent>
              </Card>
            )}

            {/* Alumni Success Stories */}
            {course.alumni_stories && (
              <Card id="alumni" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-gold-600" />
                    Alumni Success Stories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{course.alumni_stories}</p>
                </CardContent>
              </Card>
            )}

            {/* Global Exposure / Collaborations */}
            {course.global_exposure && (
              <Card id="global-exposure" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-6 w-6 text-blue-600" />
                    Global Exposure / Collaborations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{course.global_exposure}</p>
                </CardContent>
              </Card>
            )}

            {/* Comparison with Other Courses */}
            {course.course_comparison && (
              <Card id="comparison" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-6 w-6 text-purple-600" />
                    Comparison with Other Courses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{course.course_comparison}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

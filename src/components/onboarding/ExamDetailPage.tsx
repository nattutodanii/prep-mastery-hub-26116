
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, MapPin, Calendar, GraduationCap, Trophy, Building, Globe, DollarSign, BookOpen, Target, Star, FileText, Users, ClipboardList, Brain, Download, ExternalLink, CheckCircle, Clock, School, Award, Lightbulb, TrendingUp, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EnhancedContentRenderer } from "@/components/common/EnhancedContentRenderer";
import { generatePDF } from "@/utils/pdfGenerator";
import { toast } from "sonner";

interface ExamDetailPageProps {
  examId: string;
  onBack: () => void;
  onCourseSelect: (courseId: string) => void;
}

const tableOfContents = [
  { id: 'about', title: 'About', icon: BookOpen },
  { id: 'history', title: 'History & Legacy', icon: Calendar },
  { id: 'rankings', title: 'Rankings & Recognition', icon: Trophy },
  { id: 'campus-locations', title: 'Campus Locations', icon: MapPin },
  { id: 'infrastructure', title: 'Infrastructure & Facilities', icon: Building },
  { id: 'placements', title: 'Placements & Career', icon: Target },
  { id: 'global', title: 'Global Collaborations', icon: Globe },
  { id: 'fees', title: 'Fees & Financial Support', icon: DollarSign },
  { id: 'preparation', title: 'Preparation Strategy', icon: Star },
  { id: 'syllabus', title: 'Syllabus', icon: FileText },
  { id: 'campus', title: 'Campus Life', icon: School },
  { id: 'admission', title: 'Admission Procedure', icon: ClipboardList },
  { id: 'exam-pattern', title: 'Exam Pattern', icon: Brain },
  { id: 'pyqs', title: 'Previous Year Questions', icon: FileText },
  { id: 'cutoff', title: 'Cut-off Trends', icon: TrendingUp },
  { id: 'short-notes', title: 'Short Notes', icon: FileText },
  { id: 'important-dates', title: 'Important Dates', icon: Calendar },
  { id: 'eligibility', title: 'Eligibility Criteria', icon: CheckCircle },
  { id: 'exam-centers', title: 'Exam Centers', icon: MapPin },
  { id: 'scholarships', title: 'Scholarships & Stipends', icon: Award },
  { id: 'books', title: 'Recommended Books', icon: BookOpen },
  { id: 'why-choose', title: 'Why Choose', icon: GraduationCap },
  { id: 'faqs', title: 'FAQs', icon: Lightbulb },
];

export function ExamDetailPage({ examId, onBack, onCourseSelect }: ExamDetailPageProps) {
  const [exam, setExam] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchExamDetails();
  }, [examId]);

  const fetchExamDetails = async () => {
    try {
      // Fetch exam details
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .select('*')
        .eq('id', examId)
        .single();

      if (examError) throw examError;

      // Fetch courses for this exam
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('exam_id', examId);

      if (coursesError) throw coursesError;

      setExam(examData);
      setCourses(coursesData || []);
    } catch (error) {
      console.error('Error fetching exam details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!exam) return;

    try {
      toast.loading('Generating PDF...');
      
      const content: Record<string, string> = {
        about: exam.detailed_description || exam.description || '',
        history: exam.history || '',
        rankings: exam.rankings || '',
        recognition: exam.recognition || '',
        infrastructure: exam.infrastructure || '',
        placements: exam.placements || '',
        global_collaborations: exam.global_collaborations || '',
        fees_scholarships: exam.fees_scholarships || '',
        preparation_tips: exam.preparation_tips || '',
        syllabus: exam.syllabus || '',
        campus: exam.campus || '',
        admission_procedure: exam.admission_procedure || '',
        exam_pattern: exam.exam_pattern || '',
        pyqs: exam.pyqs || '',
        cutoff_trends: exam.cutoff_trends || '',
        short_notes: exam.short_notes || '',
        important_dates: exam.important_dates || '',
        eligibility_criteria: exam.eligibility_criteria || '',
        exam_centers: exam.exam_centers || '',
        scholarships_stipends: exam.scholarships_stipends || '',
        recommended_books: exam.recommended_books || '',
        why_choose: exam.why_choose || ''
      };

      await generatePDF({
        title: exam.name,
        content,
        type: 'exam'
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
          <p className="text-lg text-muted-foreground">Loading exam details...</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground mb-4">Exam not found</h2>
          <Button onClick={onBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  const campuses = Array.isArray(exam.campuses) ? exam.campuses : JSON.parse(exam.campuses || '[]');
  const faqs = Array.isArray(exam.faqs) ? exam.faqs : JSON.parse(exam.faqs || '[]');

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
                <h1 className="text-2xl font-bold">{exam.name}</h1>
                <p className="text-muted-foreground">{exam.short_description}</p>
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
                {exam.name}: Complete Guide 🎓
              </h2>
              <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                {exam.introduction || exam.detailed_description || exam.description}
              </p>
              
              {/* Key Stats */}
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-3xl mb-2">🏛️</div>
                  <div className="text-2xl font-bold text-primary">{exam.established_year || 'Premier'}</div>
                  <div className="text-sm text-muted-foreground">Established</div>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-3xl mb-2">📍</div>
                  <div className="text-lg font-bold text-primary">{exam.location || 'India'}</div>
                  <div className="text-sm text-muted-foreground">Location</div>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-3xl mb-2">🎯</div>
                  <div className="text-lg font-bold text-blue-600">{courses.length}</div>
                  <div className="text-sm text-muted-foreground">Programs Available</div>
                </div>
              </div>
            </div>
          </div>

          {/* Available Programs - Moved to Top */}
          <div className="mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">🎓 Available Programs at {exam.name}</CardTitle>
                <p className="text-muted-foreground">Explore different programs and start your preparation journey</p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map((course) => (
                    <Card key={course.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-primary/50">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-primary text-lg">{course.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                        {course.duration && (
                          <div className="text-xs text-muted-foreground">
                            Duration: {course.duration}
                          </div>
                        )}
                        <Button 
                          size="sm" 
                          className="w-full bg-gradient-to-r from-primary to-purple-600" 
                          onClick={() => onCourseSelect(course.id)}
                        >
                          Explore Program 🚀
                        </Button>
                      </div>
                    </Card>
                  ))}
                  {courses.length === 0 && (
                    <div className="col-span-full">
                      <p className="text-muted-foreground text-center py-8">No programs available yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Info - Moved to Top */}
          <div className="mb-12">
            <Card className="bg-gradient-to-br from-primary/5 to-purple-50">
              <CardHeader>
                <CardTitle className="text-2xl">📊 Quick Information</CardTitle>
                <p className="text-muted-foreground">Key details about {exam.name} at a glance</p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
                    <Calendar className="h-8 w-8 text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">Established</div>
                      <div className="text-lg font-bold text-primary">{exam.established_year || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
                    <MapPin className="h-8 w-8 text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">Location</div>
                      <div className="text-lg font-bold text-primary">{exam.location || 'India'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
                    <GraduationCap className="h-8 w-8 text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">Programs</div>
                      <div className="text-lg font-bold text-primary">{courses.length} available</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
                    <Building className="h-8 w-8 text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">Campuses</div>
                      <div className="text-lg font-bold text-primary">{Array.isArray(exam.campuses) ? exam.campuses.length : JSON.parse(exam.campuses || '[]').length} locations</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                {tableOfContents.map((item) => (
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

          {/* Main Content - Full Width */}
          <div className="space-y-8 pr-8">
            {/* About Section */}
            <Card id="about" className="scroll-mt-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-primary" />
                  About {exam.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-foreground leading-relaxed">
                  <EnhancedContentRenderer content={exam.detailed_description || exam.description || ''} />
                </div>
              </CardContent>
            </Card>

            {/* History & Legacy */}
            {exam.history && (
              <Card id="history" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-6 w-6 text-orange-500" />
                    History & Legacy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-foreground leading-relaxed">
                    <EnhancedContentRenderer content={exam.history || ''} />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rankings & Recognition */}
            {(exam.rankings || exam.recognition) && (
              <Card id="rankings" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    Rankings & Recognition
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {exam.rankings && (
                    <div>
                      <h4 className="font-semibold mb-2 text-foreground">🏆 Rankings</h4>
                      <div className="text-foreground">
                        <EnhancedContentRenderer content={exam.rankings || ''} />
                      </div>
                    </div>
                  )}
                  {exam.recognition && (
                    <div>
                      <h4 className="font-semibold mb-2 text-foreground">🎖️ Recognition</h4>
                      <div className="text-foreground">
                        <EnhancedContentRenderer content={exam.recognition || ''} />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Campuses */}
            {campuses.length > 0 && (
              <Card id="campus-locations" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-6 w-6 text-blue-500" />
                    Campuses & Programs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-1 gap-4">
                    {campuses.map((campus: any, index: number) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-primary mt-1" />
                          <div className="flex-1">
                            <h4 className="font-medium text-lg mb-2">{campus.name || campus}</h4>
                            {campus.location && <p className="text-sm text-muted-foreground mb-3">{campus.location}</p>}
                            {courses.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Available Programs:</p>
                                <div className="flex flex-wrap gap-2">
                                  {courses.slice(0, 3).map((course) => (
                                    <Badge key={course.id} variant="secondary" className="text-xs">
                                      {course.name}
                                    </Badge>
                                  ))}
                                  {courses.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{courses.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Infrastructure & Facilities */}
            {exam.infrastructure && (
              <Card id="infrastructure" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-6 w-6 text-green-600" />
                    Infrastructure & Facilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-foreground leading-relaxed">
                    <EnhancedContentRenderer content={exam.infrastructure || ''} />
                  </div>
                  
                  <div className="mt-6 grid md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-700 mb-2">🏛️ Academic Facilities</h4>
                      <p className="text-sm text-muted-foreground">State-of-the-art classrooms and laboratories</p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-700 mb-2">📚 Library & Resources</h4>
                      <p className="text-sm text-muted-foreground">Extensive digital and physical collections</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Placements & Career Opportunities */}
            {exam.placements && (
              <Card id="placements" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-6 w-6 text-purple-600" />
                    Placements & Career Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground leading-relaxed">{exam.placements}</p>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">100%</div>
                      <div className="text-sm text-muted-foreground">Placement Rate</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">50L+</div>
                      <div className="text-sm text-muted-foreground">Highest Package</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-100 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">500+</div>
                      <div className="text-sm text-muted-foreground">Top Companies</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-primary/10 to-purple-100 p-6 rounded-xl border border-primary/20">
                    <h4 className="font-bold text-primary mb-2">🚀 Boost Your Placement Chances!</h4>
                    <p className="text-sm text-muted-foreground mb-4">Get placement-ready with our comprehensive test series and interview preparation</p>
                    <Button 
                      className="bg-gradient-to-r from-primary to-purple-600 text-white"
                      onClick={() => window.location.href = '/auth'}
                    >
                      Start Placement Prep 🎯
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Global Collaborations */}
            {exam.global_collaborations && (
              <Card id="global" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-6 w-6 text-blue-600" />
                    Global Collaborations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{exam.global_collaborations}</p>
                </CardContent>
              </Card>
            )}

            {/* Fees & Financial Support */}
            {exam.fees_scholarships && (
              <Card id="fees" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-6 w-6 text-green-500" />
                    Fees & Financial Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{exam.fees_scholarships}</p>
                </CardContent>
              </Card>
            )}

            {/* Preparation Strategy */}
            {exam.preparation_tips && (
              <Card id="preparation" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-6 w-6 text-yellow-500" />
                    Preparation Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground leading-relaxed">{exam.preparation_tips}</p>
                  
                  <div className="bg-gradient-to-r from-primary/10 to-purple-100 p-6 rounded-xl border border-primary/20">
                    <h4 className="font-bold text-primary mb-4">🎯 Master {exam.name} with MastersUp!</h4>
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
                      className="w-full bg-gradient-to-r from-primary to-purple-600 text-white"
                      onClick={() => window.location.href = '/auth'}
                    >
                      Start Your {exam.name} Preparation Journey! 🚀
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Syllabus */}
            {exam.syllabus && (
              <Card id="syllabus" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-indigo-600" />
                    Syllabus
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">{exam.syllabus}</p>
                  
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-indigo-700">📋 Detailed Syllabus Available!</h4>
                        <p className="text-sm text-muted-foreground">Get comprehensive syllabus with chapter-wise breakdown</p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="shrink-0"
                        onClick={() => window.location.href = '/auth'}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                        onClick={() => window.location.href = '/auth'}
                      >
                        View Detailed Syllabus 📖
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.location.href = '/auth'}
                      >
                        Notes Section 📝
                      </Button>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">💡 Pro Tip: Syllabus varies by program. Select your course below for program-specific details!</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Campus Life */}
            {exam.campus && (
              <Card id="campus" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <School className="h-6 w-6 text-pink-600" />
                    Campus Life
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{exam.campus}</p>
                  
                  <div className="mt-6 grid md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-pink-700 mb-2">🎨 Cultural Activities</h4>
                      <p className="text-sm text-muted-foreground">Festivals, clubs, and creative pursuits</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-700 mb-2">🏃 Sports & Recreation</h4>
                      <p className="text-sm text-muted-foreground">Modern sports facilities and fitness centers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Admission Procedure */}
            {exam.admission_procedure && (
              <Card id="admission" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-6 w-6 text-teal-600" />
                    Admission Procedure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{exam.admission_procedure}</p>
                </CardContent>
              </Card>
            )}

            {/* Exam Pattern */}
            {exam.exam_pattern && (
              <Card id="exam-pattern" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-6 w-6 text-purple-600" />
                    Exam Pattern
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{exam.exam_pattern}</p>
                </CardContent>
              </Card>
            )}

            {/* Previous Year Questions */}
            {exam.pyqs && (
              <Card id="pyqs" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-amber-600" />
                    Previous Year Questions (PYQs)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">{exam.pyqs}</p>
                  
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200">
                    <h4 className="font-bold text-amber-700 mb-2">📚 Master PYQs with MastersUp!</h4>
                    <p className="text-sm text-muted-foreground mb-4">Access 10+ years of solved previous year questions with detailed solutions</p>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-amber-600 to-orange-600 text-white"
                        onClick={() => window.location.href = '/auth'}
                      >
                        Practice PYQs 🎯
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.location.href = '/auth'}
                      >
                        Download Solutions 📝
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cut-off Trends */}
            {exam.cutoff_trends && (
              <Card id="cutoff" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-emerald-600" />
                    Cut-off Trends
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">{exam.cutoff_trends}</p>
                  
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-200">
                    <h4 className="font-bold text-emerald-700 mb-2">📊 Detailed Cut-off Analysis</h4>
                    <p className="text-sm text-muted-foreground mb-4">Year-wise trends, category-wise analysis, and predictions</p>
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                      onClick={() => window.location.href = '/auth'}
                    >
                      View Detailed Analysis 📈
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Short Notes */}
            {exam.short_notes && (
              <Card id="short-notes" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-cyan-600" />
                    Short Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">{exam.short_notes}</p>
                  
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-xl border border-cyan-200">
                    <h4 className="font-bold text-cyan-700 mb-2">📝 Quick Revision Notes</h4>
                    <p className="text-sm text-muted-foreground mb-4">Course-specific concise notes for last-minute revision</p>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                        onClick={() => window.location.href = '/auth'}
                      >
                        Access Notes 📖
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.location.href = '/auth'}
                      >
                        Go to Notes Section 🔗
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Important Dates */}
            {exam.important_dates && (
              <Card id="important-dates" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-6 w-6 text-red-600" />
                    Important Dates & Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{exam.important_dates}</p>
                </CardContent>
              </Card>
            )}

            {/* Eligibility Criteria */}
            {exam.eligibility_criteria && (
              <Card id="eligibility" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    Eligibility Criteria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{exam.eligibility_criteria}</p>
                </CardContent>
              </Card>
            )}

            {/* Exam Centers */}
            {exam.exam_centers && (
              <Card id="exam-centers" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-6 w-6 text-blue-600" />
                    Exam Centers / Cities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{exam.exam_centers}</p>
                </CardContent>
              </Card>
            )}

            {/* Scholarships & Stipends */}
            {exam.scholarships_stipends && (
              <Card id="scholarships" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-6 w-6 text-yellow-600" />
                    Scholarships & Stipends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{exam.scholarships_stipends}</p>
                </CardContent>
              </Card>
            )}

            {/* Recommended Books */}
            {exam.recommended_books && (
              <Card id="books" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-indigo-600" />
                    Recommended Books & Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{exam.recommended_books}</p>
                </CardContent>
              </Card>
            )}

            {/* Why Choose */}
            {exam.why_choose && (
              <Card id="why-choose" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-6 w-6 text-primary" />
                    Why Choose {exam.name}? 
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{exam.why_choose}</p>
                </CardContent>
              </Card>
            )}

            {/* FAQs */}
            {faqs.length > 0 && (
              <Card id="faqs" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-6 w-6 text-yellow-500" />
                    Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    {faqs.map((faq: any, index: number) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
    </div>
  );
}

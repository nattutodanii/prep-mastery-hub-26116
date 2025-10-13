
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Info, MapPin, Calendar, Users } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";

interface ExamSelectionProps {
  onBack: () => void;
  onExamSelected: (examId: string) => void;
}

export function ExamSelection({ onBack, onExamSelected }: ExamSelectionProps) {
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select(`
          *,
          courses (
            id,
            name,
            description,
            duration,
            intake_capacity,
            average_package
          )
        `);
      
      if (error) throw error;
      setExams(data || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (selectedExam) {
      onExamSelected(selectedExam);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading exams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Logo />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Choose Your Exam 🎯</h1>
          <p className="text-muted-foreground">
            Select the exam you're preparing for. You can change this later from your profile.
          </p>
        </div>

        {/* Exam Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {exams.map((exam) => (
            <Card 
              key={exam.id}
              className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                selectedExam === exam.id ? 'ring-2 ring-primary border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setSelectedExam(exam.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{exam.name}</CardTitle>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{exam.short_description || exam.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <CardDescription className="text-sm">
                  {exam.short_description || exam.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Quick Stats */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {exam.established_year && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
                      <Calendar className="h-3 w-3" />
                      <span>Est. {exam.established_year}</span>
                    </div>
                  )}
                  {exam.location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
                      <MapPin className="h-3 w-3" />
                      <span>{exam.location}</span>
                    </div>
                  )}
                  {exam.courses && exam.courses.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
                      <Users className="h-3 w-3" />
                      <span>{exam.courses.length} course{exam.courses.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>

                {/* Available Courses */}
                {exam.courses && exam.courses.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Available Courses:</p>
                    <div className="flex flex-wrap gap-1">
                      {exam.courses.slice(0, 3).map((course: any) => (
                        <Badge key={course.id} variant="secondary" className="text-xs">
                          {course.name}
                        </Badge>
                      ))}
                      {exam.courses.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{exam.courses.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Button 
            size="lg" 
            onClick={handleContinue}
            disabled={!selectedExam}
            className="px-8"
          >
            Continue to Course Selection 🚀
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Info } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";

interface CourseSelectionProps {
  examId: string;
  onBack: () => void;
  onCourseSelected: (courseId: string) => void;
}

export function CourseSelection({ examId, onBack, onCourseSelected }: CourseSelectionProps) {
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExamWithCourses();
  }, [examId]);

  const fetchExamWithCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select(`
          *,
          courses (
            id,
            name,
            description,
            subjects (
              id,
              name
            )
          )
        `)
        .eq('id', examId)
        .single();
      
      if (error) throw error;
      setExam(data);
    } catch (error) {
      console.error('Error fetching exam:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (selectedCourse) {
      onCourseSelected(selectedCourse);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading courses...</div>;
  }

  if (!exam) {
    return <div className="min-h-screen flex items-center justify-center">Exam not found</div>;
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
          <h1 className="text-3xl font-bold mb-4">Choose Your Course</h1>
          <p className="text-muted-foreground">
            Select the specific course within {exam.name} that you're preparing for.
          </p>
        </div>

        {/* Course Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {exam.courses?.map((course) => (
            <Card 
              key={course.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedCourse === course.id ? 'ring-2 ring-primary border-primary' : ''
              }`}
              onClick={() => setSelectedCourse(course.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{course.name}</CardTitle>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{course.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <CardDescription className="line-clamp-3">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {course.subjects.length} subject{course.subjects.length !== 1 ? 's' : ''} available
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Button 
            size="lg" 
            onClick={handleContinue}
            disabled={!selectedCourse}
            className="px-8"
          >
            Continue to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
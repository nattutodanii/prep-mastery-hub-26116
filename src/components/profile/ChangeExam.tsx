import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

interface Exam {
  id: string;
  name: string;
  description: string;
}

interface Course {
  id: string;
  name: string;
  description: string;
  exam_id: string;
}

interface ChangeExamProps {
  onClose: () => void;
}

export function ChangeExam({ onClose }: ChangeExamProps) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [step, setStep] = useState<'exam' | 'course'>('exam');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { profile, updateProfile } = useProfile();
  const { toast } = useToast();

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExam) {
      fetchCourses();
    }
  }, [selectedExam]);

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setExams(data || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('exam_id', selectedExam)
        .order('name');
      
      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleExamSelect = (examId: string) => {
    setSelectedExam(examId);
    setSelectedCourse('');
    setStep('course');
  };

  const handleCourseSelect = async (courseId: string) => {
    setSelectedCourse(courseId);
    setUpdating(true);

    try {
      await updateProfile({
        selected_exam_id: selectedExam,
        selected_course_id: courseId
      });

      toast({
        title: "Exam Changed Successfully",
        description: "Your dashboard will now show data for the new exam and course.",
      });

      // Refresh the page to update all components with new course data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to change exam. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="text-center">Loading exams...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Change Exam</h2>
          <p className="text-muted-foreground">
            {step === 'exam' ? 'Select a new exam' : 'Select a course within the exam'}
          </p>
        </div>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-2 ${step === 'exam' ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'exam' ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}>
            1
          </div>
          <span>Select Exam</span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <div className={`flex items-center gap-2 ${step === 'course' ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'course' ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}>
            2
          </div>
          <span>Select Course</span>
        </div>
      </div>

      {step === 'exam' && (
        <div className="grid gap-4">
          {exams.map((exam) => (
            <Card 
              key={exam.id} 
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                selectedExam === exam.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleExamSelect(exam.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{exam.name}</h3>
                    <p className="text-muted-foreground">{exam.description}</p>
                  </div>
                  {selectedExam === exam.id && (
                    <CheckCircle className="h-6 w-6 text-primary" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {step === 'course' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" onClick={() => setStep('exam')}>
              ← Back to Exams
            </Button>
            <div className="text-sm text-muted-foreground">
              Selected: <Badge variant="outline">{exams.find(e => e.id === selectedExam)?.name}</Badge>
            </div>
          </div>

          <div className="grid gap-4">
            {courses.map((course) => (
              <Card 
                key={course.id} 
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  selectedCourse === course.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => !updating && handleCourseSelect(course.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{course.name}</h3>
                      <p className="text-muted-foreground">{course.description}</p>
                    </div>
                    {updating && selectedCourse === course.id ? (
                      <div className="text-sm text-muted-foreground">Updating...</div>
                    ) : selectedCourse === course.id ? (
                      <CheckCircle className="h-6 w-6 text-primary" />
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
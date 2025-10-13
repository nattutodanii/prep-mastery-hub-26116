
import { useState, useEffect } from "react";
import Onboarding from "./Onboarding";
import { Authentication } from "./Authentication";
import { NameSetup } from "./NameSetup";
import { ExamSelection } from "./ExamSelection";
import { CourseSelection } from "./CourseSelection";
import { AppLayout } from "@/components/layout/AppLayout";
import { Dashboard } from "./Dashboard";
import { ChapterPractice } from "./ChapterPractice";
import { ChapterPYQs } from "./ChapterPYQs";
import { MockTests } from "./MockTests";
import { PYPTests } from "./PYPTests";
import { TestSeries } from "./TestSeries";
import { Notes } from "./Notes";
import { ShortNotes } from "./ShortNotes";
import { GoSuper } from "./GoSuper";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";

type AppStep = 'onboarding' | 'authentication' | 'name-setup' | 'exam-selection' | 'course-selection' | 'dashboard';
type CurrentPage = 'dashboard' | 'chapter-practice' | 'chapter-pyqs' | 'mock-tests' | 'pyp-tests' | 'test-series' | 'notes' | 'short-notes' | 'go-super';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>('onboarding');
  const [currentPage, setCurrentPage] = useState<CurrentPage>('dashboard');
  const [selectedExam, setSelectedExam] = useState('');
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();

  useEffect(() => {
    if (!authLoading && !profileLoading) {
      if (user && profile) {
        // User is authenticated and has a profile
        if (profile.selected_exam_id && profile.selected_course_id) {
          setCurrentStep('dashboard');
        } else {
          // User needs to complete exam/course selection
          setCurrentStep('exam-selection');
        }
      } else if (user) {
        // User is authenticated but no profile yet (should be created by trigger)
        setCurrentStep('name-setup');
      } else {
        // User is not authenticated
        setCurrentStep('onboarding');
      }
    }
  }, [user, profile, authLoading, profileLoading]);

  const handlePageChange = (page: string) => {
    setCurrentPage(page as CurrentPage);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'chapter-practice': return <ChapterPractice />;
      case 'chapter-pyqs': return <ChapterPYQs />;
      case 'mock-tests': return <MockTests />;
      case 'pyp-tests': return <PYPTests />;
      case 'test-series': return <TestSeries />;
      case 'notes': return <Notes />;
      case 'short-notes': return <ShortNotes />;
      case 'go-super': return <GoSuper />;
      default: return <Dashboard />;
    }
  };

  if (currentStep === 'onboarding') {
    return <Onboarding />;
  }

  if (authLoading || profileLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (currentStep === 'authentication') {
    return <Authentication onBack={() => setCurrentStep('onboarding')} onAuthenticated={() => setCurrentStep('name-setup')} />;
  }

  if (currentStep === 'name-setup') {
    return <NameSetup onContinue={async (name) => { 
      try {
        if (profile) {
          await updateProfile({ name });
        } else {
          // Create profile if it doesn't exist
          const { error } = await supabase
            .from('profiles')
            .insert({ user_id: user?.id, name });
          if (error) throw error;
        }
        setCurrentStep('exam-selection'); 
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }} />;
  }

  if (currentStep === 'exam-selection') {
    return <ExamSelection onBack={() => setCurrentStep('name-setup')} onExamSelected={(examId) => { setSelectedExam(examId); setCurrentStep('course-selection'); }} />;
  }

  if (currentStep === 'course-selection') {
    return <CourseSelection examId={selectedExam} onBack={() => setCurrentStep('exam-selection')} onCourseSelected={async (courseId) => {
      if (profile) {
        await updateProfile({ 
          selected_exam_id: selectedExam, 
          selected_course_id: courseId 
        });
        window.location.reload(); // Refresh to update profile state
        setCurrentStep('dashboard');
      }
    }} />;
  }

  return (
    <AppLayout 
      currentPage={currentPage} 
      userName={profile?.name || 'User'} 
      userSubscription={profile?.subscription || 'freemium'}
      onPageChange={handlePageChange}
    >
      <div className="p-6 bg-muted/30">
        {renderCurrentPage()}
      </div>
    </AppLayout>
  );
};

export default Index;

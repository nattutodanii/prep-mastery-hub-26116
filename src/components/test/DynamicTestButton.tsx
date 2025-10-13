
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, BarChart3, Lock } from "lucide-react";
import { useTestAttempt } from "@/hooks/useTestAttempt";

interface DynamicTestButtonProps {
  testName: string;
  testType: string;
  chapterId?: string;
  onStartTest: () => void;
  onContinueTest: () => void;
  onViewAnalysis: () => void;
  disabled?: boolean;
  className?: string;
}

export function DynamicTestButton({ 
  testName, 
  testType, 
  chapterId, 
  onStartTest, 
  onContinueTest, 
  onViewAnalysis,
  disabled = false,
  className = "w-full"
}: DynamicTestButtonProps) {
  const { getTestStatus, getTestAttemptData } = useTestAttempt();
  const [status, setStatus] = useState<'not_started' | 'in_progress' | 'completed'>('not_started');

  useEffect(() => {
    const currentStatus = getTestStatus(testName, testType, chapterId);
    setStatus(currentStatus);
  }, [testName, testType, chapterId, getTestStatus]);

  const getButtonText = () => {
    switch (testType) {
      case 'chapter':
      case 'chapter-practice':
        return status === 'not_started' ? 'Start Practice' :
               status === 'in_progress' ? 'Retake' : 'View Analysis';
      case 'mock':
      case 'pyp':
        return status === 'not_started' ? 'Start Exam' :
               status === 'in_progress' ? 'Retake' : 'View Analysis';
      case 'test-series':
        return status === 'not_started' ? 'Start Test' :
               status === 'in_progress' ? 'Retake' : 'View Analysis';
      default:
        return status === 'not_started' ? 'Start Test' :
               status === 'in_progress' ? 'Retake' : 'View Analysis';
    }
  };

  const getButtonIcon = () => {
    if (status === 'not_started') return <Play className="h-4 w-4 mr-2" />;
    if (status === 'in_progress') return <RotateCcw className="h-4 w-4 mr-2" />;
    return <BarChart3 className="h-4 w-4 mr-2" />;
  };

  const handleClick = () => {
    if (disabled) return;
    
    if (status === 'not_started') {
      onStartTest();
    } else if (status === 'in_progress') {
      onContinueTest();
    } else {
      onViewAnalysis();
    }
  };

  const getButtonVariant = () => {
    if (disabled) return "secondary";
    if (status === 'completed') return "outline";
    return "default";
  };

  return (
    <Button
      className={className}
      variant={getButtonVariant()}
      disabled={disabled}
      onClick={handleClick}
    >
      {disabled ? (
        <>
          <Lock className="h-4 w-4 mr-2" />
          Premium
        </>
      ) : (
        <>
          {getButtonIcon()}
          {getButtonText()}
        </>
      )}
    </Button>
  );
}

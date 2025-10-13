import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, Target, AlertCircle, Star, CheckCircle2 } from "lucide-react";

interface TestInstructionsProps {
  testType: 'chapter-practice' | 'chapter-pyq' | 'mock' | 'pyp' | 'test-series';
  mode: 'practice' | 'test';
  testName: string;
  totalQuestions: number;
  totalTime: number;
  totalMarks: number;
  syllabus: string[];
  questionTypes: string[];
  markingScheme: {
    correct: number;
    incorrect: number;
    skipped: number;
    partial?: number;
  };
  onStartTest: () => void;
  onBack: () => void;
}

export function TestInstructions({
  testType,
  mode,
  testName,
  totalQuestions,
  totalTime,
  totalMarks,
  syllabus,
  questionTypes,
  markingScheme,
  onStartTest,
  onBack
}: TestInstructionsProps) {
  const [agreedToInstructions, setAgreedToInstructions] = useState(false);

  const getTestTypeLabel = () => {
    switch (testType) {
      case 'chapter-practice': return 'Chapter Practice';
      case 'chapter-pyq': return 'Chapter PYQs';
      case 'mock': return 'Mock Test';
      case 'pyp': return 'Past Year Paper';
      case 'test-series': return 'Test Series';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Target className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Test Instructions</h1>
          <p className="text-muted-foreground">Read carefully before starting the test</p>
        </div>

        {/* Test Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Test Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Test Name:</span>
                  <span>{testName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Test Type:</span>
                  <Badge variant="secondary">{getTestTypeLabel()}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Mode:</span>
                  <Badge variant={mode === 'practice' ? 'default' : 'destructive'}>
                    {mode === 'practice' ? 'Practice Mode' : 'Test Mode'}
                  </Badge>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Total Questions:</span>
                  <span>{totalQuestions}</span>
                </div>
                {mode === 'test' && (
                  <div className="flex justify-between">
                    <span className="font-medium">Total Time:</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {totalTime} minutes
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-medium">Total Marks:</span>
                  <span>{totalMarks}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Syllabus */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Syllabus Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            {testType === 'mock' || testType === 'pyp' ? (
              <p className="text-muted-foreground">Complete syllabus coverage</p>
            ) : (
              <div className="space-y-2">
                {syllabus.map((topic, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>{topic}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Question Types & Marking */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Question Types */}
          <Card>
            <CardHeader>
              <CardTitle>Question Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {questionTypes.includes('MCQ') && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">MCQ</Badge>
                    <span className="text-sm">Multiple Choice Questions (Single correct)</span>
                  </div>
                )}
                {questionTypes.includes('MSQ') && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">MSQ</Badge>
                    <span className="text-sm">Multiple Select Questions (Multiple correct)</span>
                  </div>
                )}
                {questionTypes.includes('NAT') && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">NAT</Badge>
                    <span className="text-sm">Numerical Answer Type</span>
                  </div>
                )}
                {questionTypes.includes('SUB') && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">SUB</Badge>
                    <span className="text-sm">Subjective Questions</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Marking Scheme */}
          <Card>
            <CardHeader>
              <CardTitle>Marking Scheme</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-green-600">Correct Answer:</span>
                  <span className="font-semibold">+{markingScheme.correct}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">Incorrect Answer:</span>
                  <span className="font-semibold">{markingScheme.incorrect}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Skipped:</span>
                  <span className="font-semibold">{markingScheme.skipped}</span>
                </div>
                {markingScheme.partial && (
                  <div className="flex justify-between">
                    <span className="text-blue-600">Partial (MSQ):</span>
                    <span className="font-semibold">+{markingScheme.partial}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Important Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">General Instructions:</h4>
                <ul className="space-y-1 text-sm list-disc list-inside ml-4">
                  <li>Read each question carefully before answering</li>
                  <li>Use the navigation panel to move between questions</li>
                  <li>You can revisit any question during the test</li>
                  {mode === 'test' && (
                    <>
                      <li>Once time is up, the test will be automatically submitted</li>
                      <li>Make sure to submit your test before time runs out</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Bookmark Feature:</h4>
                <ul className="space-y-1 text-sm list-disc list-inside ml-4">
                  <li>Click on "Mark for Review" to bookmark challenging questions</li>
                  <li>Bookmarked questions will be saved to your profile</li>
                  <li>Access bookmarked questions later from your profile section</li>
                  <li>Bookmarked questions appear in a different color in navigation</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Navigation:</h4>
                <ul className="space-y-1 text-sm list-disc list-inside ml-4">
                  <li>Green: Answered questions</li>
                  <li>Red: Questions with bookmark/review</li>
                  <li>Gray: Unanswered questions</li>
                  <li>Blue: Current question</li>
                </ul>
              </div>

              {mode === 'practice' && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Practice Mode Features:</h4>
                  <ul className="space-y-1 text-sm list-disc list-inside ml-4">
                    <li>Get immediate feedback after answering each question</li>
                    <li>View detailed solutions and explanations</li>
                    <li>No time pressure - take as long as you need</li>
                    <li>Cannot reattempt questions once answered</li>
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Agreement & Start */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="instructions-agreement"
                  checked={agreedToInstructions}
                  onCheckedChange={(checked) => setAgreedToInstructions(checked === true)}
                />
                <label 
                  htmlFor="instructions-agreement" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I have read and understood all instructions and am ready to start the test
                </label>
              </div>

              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={onBack}>
                  ← Back
                </Button>
                <Button 
                  onClick={onStartTest}
                  disabled={!agreedToInstructions}
                  size="lg"
                  className="px-8"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Start {mode === 'practice' ? 'Practice' : 'Test'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
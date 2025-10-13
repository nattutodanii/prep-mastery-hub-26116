import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Clock, BookOpen } from "lucide-react";

interface TestModeSelectorProps {
  onModeSelect: (mode: 'practice' | 'test') => void;
  onBack: () => void;
}

export function TestModeSelector({ onModeSelect, onBack }: TestModeSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Select Practice Mode</h1>
          <p className="text-muted-foreground">Choose how you want to practice this chapter</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onModeSelect('practice')}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Practice Mode</CardTitle>
              <CardDescription>Learn with immediate feedback</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>See answers and solutions immediately</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>No time pressure - learn at your pace</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Perfect for understanding concepts</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Review previous answers anytime</span>
                </div>
              </div>
              <Button className="w-full" size="lg">
                <Play className="h-4 w-4 mr-2" />
                Start Practice
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onModeSelect('test')}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full w-fit">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-xl">Test Mode</CardTitle>
              <CardDescription>Simulate real exam conditions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Timed questions with countdown</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>No immediate feedback during test</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Complete analysis after submission</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Track performance and ranking</span>
                </div>
              </div>
              <Button className="w-full" size="lg" variant="outline">
                <Clock className="h-4 w-4 mr-2" />
                Start Test
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button variant="ghost" onClick={onBack}>
            ← Back to Chapter List
          </Button>
        </div>
      </div>
    </div>
  );
}
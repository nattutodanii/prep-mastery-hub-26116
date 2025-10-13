
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users, Star } from "lucide-react";

interface ExamCardProps {
  exam: {
    id: string;
    name: string;
    short_description: string;
    location: string;
    established_year: number;
    courses: { id: string; name: string; }[];
  };
  onExamClick: (examId: string) => void;
}

export function ExamCard({ exam, onExamClick }: ExamCardProps) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 hover:border-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
              {exam.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {exam.short_description}
            </p>
          </div>
          <Badge variant="secondary" className="ml-2">
            <Star className="w-3 h-3 mr-1" />
            Top Tier
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {exam.location}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Est. {exam.established_year}
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {exam.courses.length} Courses
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {exam.courses.slice(0, 3).map((course) => (
            <Badge key={course.id} variant="outline" className="text-xs">
              {course.name}
            </Badge>
          ))}
          {exam.courses.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{exam.courses.length - 3} more
            </Badge>
          )}
        </div>

        <Button 
          onClick={() => onExamClick(exam.id)}
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          variant="outline"
        >
          Explore Programs 🚀
        </Button>
      </CardContent>
    </Card>
  );
}

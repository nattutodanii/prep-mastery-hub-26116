import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, BookOpen, Eye, Lock } from "lucide-react";
import { PremiumBadge } from "@/components/ui/premium-badge";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { FullScreenTestLayout } from "@/components/test/FullScreenTestLayout";
import { NoteViewer } from "@/components/notes/NoteViewer";

export function Notes() {
  const { profile } = useProfile();
  const [openSubjects, setOpenSubjects] = useState<string[]>([]);
  const [openUnits, setOpenUnits] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<string>('');
  const [selectedNoteTitle, setSelectedNoteTitle] = useState<string>('');
  const [viewingNote, setViewingNote] = useState(false);

  const isPremium = profile?.subscription === 'premium';

  // Fetch subjects and chapters with notes
  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.selected_course_id) return;
      
      try {
        const { data } = await supabase
          .from('subjects')
          .select(`
            *,
            units (
              *,
              chapters (
                id, name, notes, order_index
              )
            )
          `)
          .eq('course_id', profile.selected_course_id)
          .order('order_index');

        setSubjects(data || []);
      } catch (error) {
        console.error('Error fetching notes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile?.selected_course_id]);

  // Check for task context and auto-open notes if present
  useEffect(() => {
    const checkTaskContext = () => {
      const taskContextStr = sessionStorage.getItem('taskContext');
      if (taskContextStr) {
        const taskContext = JSON.parse(taskContextStr);
        if (taskContext.autoStart && taskContext.taskType === 'notes' && taskContext.chapterId) {
          // Clear the context so it doesn't auto-start again
          sessionStorage.removeItem('taskContext');
          
          // Wait for subjects to load
          if (subjects.length > 0) {
            // Find the chapter
            let foundChapter = null;
            for (const subject of subjects) {
              for (const unit of subject.units || []) {
                const chapter = unit.chapters?.find(c => c.id === taskContext.chapterId);
                if (chapter) {
                  foundChapter = chapter;
                  break;
                }
              }
              if (foundChapter) break;
            }
            
            if (foundChapter && foundChapter.notes) {
              handleReadNote(foundChapter.notes, `${foundChapter.name} - Notes`);
            }
          }
        }
      }
    };
    
    if (!loading && subjects.length > 0) {
      checkTaskContext();
    }
  }, [loading, subjects]);

  const toggleSubject = (subjectId: string) => {
    setOpenSubjects(prev => 
      prev.includes(subjectId) 
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const toggleUnit = (unitId: string) => {
    setOpenUnits(prev => 
      prev.includes(unitId) 
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };

  const isFirstChapter = (subjectIndex: number, unitIndex: number, chapterIndex: number) => {
    return subjectIndex === 0 && unitIndex === 0 && chapterIndex === 0;
  };

  const handleReadNote = (noteContent: string, noteTitle: string) => {
    setSelectedNote(noteContent);
    setSelectedNoteTitle(noteTitle);
    setViewingNote(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Full screen note viewer
  if (viewingNote) {
    return (
      <FullScreenTestLayout onExit={() => setViewingNote(false)}>
        <NoteViewer content={selectedNote} onClose={() => setViewingNote(false)} title={selectedNoteTitle} isShortNotes={false} />
      </FullScreenTestLayout>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Notes</h1>
        <p className="text-muted-foreground">Comprehensive study materials for exam preparation</p>
      </div>

      {/* Subjects */}
      <div className="space-y-4">
        {subjects.map((subject, subjectIndex) => (
          <Card key={subject.id}>
            <Collapsible open={openSubjects.includes(subject.id)} onOpenChange={() => toggleSubject(subject.id)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-green-600" />
                      <CardTitle className="text-xl">{subject.name}</CardTitle>
                    </div>
                    <ChevronDown className={`h-5 w-5 transition-transform ${openSubjects.includes(subject.id) ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  {subject.units?.map((unit: any, unitIndex: number) => (
                    <Card key={unit.id} className="bg-muted/30">
                      <Collapsible open={openUnits.includes(unit.id)} onOpenChange={() => toggleUnit(unit.id)}>
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{unit.name}</CardTitle>
                              <ChevronDown className={`h-4 w-4 transition-transform ${openUnits.includes(unit.id) ? 'rotate-180' : ''}`} />
                            </div>
                          </CardHeader>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent>
                          <CardContent className="space-y-3">
                            {unit.chapters?.map((chapter: any, chapterIndex: number) => {
                              const isFree = isFirstChapter(subjectIndex, unitIndex, chapterIndex);
                              const isAccessible = isPremium || isFree;
                              const hasNotes = chapter.notes && chapter.notes.trim() !== '';
                              
                              return (
                                <div
                                  key={chapter.id}
                                  className={`flex items-center justify-between p-4 rounded-lg border ${
                                    isAccessible ? 'bg-white' : 'bg-muted/50'
                                  }`}
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <h4 className="font-medium">{chapter.name}</h4>
                                      {!isAccessible && <PremiumBadge />}
                                      <Badge variant="outline" className="text-green-600 border-green-600">
                                        Detailed Notes
                                      </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {hasNotes ? 'In-depth coverage with examples and illustrations' : 'Notes coming soon'}
                                    </div>
                                  </div>
                                  
                                  <Button
                                    variant={isAccessible ? "default" : "secondary"}
                                    disabled={!isAccessible || !hasNotes}
                                    className="flex items-center gap-2"
                                    onClick={() => hasNotes && handleReadNote(chapter.notes, chapter.name)}
                                  >
                                    {isAccessible ? (
                                      hasNotes ? <Eye className="h-4 w-4" /> : <Lock className="h-4 w-4" />
                                    ) : (
                                      <Lock className="h-4 w-4" />
                                    )}
                                    {isAccessible && hasNotes ? "Read" : "Premium"}
                                  </Button>
                                </div>
                              );
                            })}
                          </CardContent>
                        </CollapsibleContent>
                      </Collapsible>
                    </Card>
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      {/* Features Section */}
      <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-200">
        <CardHeader>
          <CardTitle>What's in our Notes?</CardTitle>
          <CardDescription>High-quality study materials designed by experts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Step-by-step explanations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Illustrated examples</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Important formulas highlighted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Practice problems included</span>
            </div>
          </div>
          {!isPremium && (
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
              Access All Notes
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

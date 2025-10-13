import { useState, useEffect } from "react";
import { BookOpen, Clock, Star, Download, Share2, Eye, ChevronLeft, ChevronRight, Search, Bookmark } from "lucide-react";
import { LaTeXRenderer } from "@/components/test/LaTeXRenderer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface EnhancedNoteViewerProps {
  title: string;
  content: string;
  isShortNotes?: boolean;
  onClose: () => void;
}

export function EnhancedNoteViewer({ title, content, isShortNotes = false, onClose }: EnhancedNoteViewerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [readTime, setReadTime] = useState(0);
  const [progress, setProgress] = useState(0);

  // Calculate reading time (average 200 words per minute)
  useEffect(() => {
    const wordCount = content.split(/\s+/).length;
    const estimatedTime = Math.ceil(wordCount / 200);
    setReadTime(estimatedTime);
  }, [content]);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const element = e.target as HTMLElement;
      const scrollTop = element.scrollTop;
      const scrollHeight = element.scrollHeight - element.clientHeight;
      const scrollProgress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setProgress(scrollProgress);
    };

    const scrollArea = document.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollArea) {
      scrollArea.addEventListener('scroll', handleScroll);
      return () => scrollArea.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? "Bookmark removed" : "Bookmarked for later");
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Notes downloaded successfully");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out these ${isShortNotes ? 'short notes' : 'notes'}: ${title}`,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying to clipboard
      const shareText = `${title}\n\n${content.substring(0, 200)}...`;
      await navigator.clipboard.writeText(shareText);
      toast.success("Notes copied to clipboard");
    }
  };

  // Filter content based on search term
  const highlightedContent = searchTerm 
    ? content.replace(
        new RegExp(`(${searchTerm})`, 'gi'),
        '<mark class="bg-yellow-200 px-1 py-0.5 rounded">$1</mark>'
      )
    : content;

  return (
    <div className="fixed inset-0 bg-white z-50">
      <Card className="w-full h-full flex flex-col bg-white border-0 rounded-none shadow-none">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                {isShortNotes && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    Quick Notes
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{readTime} min read</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>Interactive view</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Search button */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search within notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-200">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>


        {/* Content */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-none">
            {isShortNotes ? (
              <div className="grid gap-6">
                {/* Short notes get special card-based layout */}
                {highlightedContent.split('\n\n').map((section, index) => (
                  <Card key={index} className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500">
                    <LaTeXRenderer content={section} />
                  </Card>
                ))}
              </div>
            ) : (
              <div className="prose prose-lg max-w-none">
                <LaTeXRenderer content={highlightedContent} />
              </div>
            )}
          </div>
        </ScrollArea>

      </Card>
    </div>
  );
}

import { EnhancedNoteViewer } from "./EnhancedNoteViewer";

interface NoteViewerProps {
  content: string;
  onClose: () => void;
  title?: string;
  isShortNotes?: boolean;
}

export function NoteViewer({ content, onClose, title = "Study Notes", isShortNotes = false }: NoteViewerProps) {
  return (
    <EnhancedNoteViewer
      title={title}
      content={content}
      onClose={onClose}
      isShortNotes={isShortNotes}
    />
  );
}

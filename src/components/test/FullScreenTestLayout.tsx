import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FullScreenTestLayoutProps {
  children: ReactNode;
  onExit?: () => void;
  showExitButton?: boolean;
}

export function FullScreenTestLayout({ children, onExit, showExitButton = true }: FullScreenTestLayoutProps) {
  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {showExitButton && onExit && (
        <div className="sticky top-4 right-4 z-10 flex justify-end p-4">
          <Button variant="ghost" size="icon" onClick={onExit}>
            <X className="h-6 w-6" />
          </Button>
        </div>
      )}
      <div className="min-h-full w-full">
        {children}
      </div>
    </div>
  );
}
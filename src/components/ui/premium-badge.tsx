import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumBadgeProps {
  className?: string;
}

export function PremiumBadge({ className }: PremiumBadgeProps) {
  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
      "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
      className
    )}>
      <Crown className="h-3 w-3" />
      Premium
    </div>
  );
}
import { Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PremiumBadgeProps {
  className?: string;
}

export function PremiumBadge({ className = "" }: PremiumBadgeProps) {
  return (
    <Badge 
      variant="secondary" 
      className={`bg-gradient-to-r from-yellow-500 to-orange-500 text-white ${className}`}
    >
      <Crown className="h-3 w-3 mr-1" />
      Premium
    </Badge>
  );
}
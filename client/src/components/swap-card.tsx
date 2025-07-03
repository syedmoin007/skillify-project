import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface SwapCardProps {
  swap: {
    id: number;
    status: string;
    partner: {
      id: string;
      firstName: string;
      lastName: string;
      profileImageUrl?: string;
    };
    requesterSkill: {
      id: number;
      name: string;
    };
    providerSkill: {
      id: number;
      name: string;
    };
    isRequester: boolean;
  };
}

export default function SwapCard({ swap }: SwapCardProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "accepted":
        return "default";
      case "pending":
        return "secondary";
      case "completed":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "accepted":
        return "status-active";
      case "pending":
        return "status-pending";
      case "completed":
        return "status-completed";
      default:
        return "status-pending";
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/10">
      <div className="flex items-center">
        <Avatar className="h-10 w-10">
          <AvatarImage src={swap.partner.profileImageUrl} alt={`${swap.partner.firstName} ${swap.partner.lastName}`} />
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-gray-900">
            {swap.partner.firstName} {swap.partner.lastName}
          </h3>
          <p className="text-xs text-muted-foreground">
            {swap.requesterSkill.name} ↔ {swap.providerSkill.name}
          </p>
        </div>
      </div>
      <div className="flex items-center">
        <Badge variant={getStatusVariant(swap.status)} className={`text-xs ${getStatusClass(swap.status)}`}>
          {swap.status === "accepted" ? "In Progress" : swap.status}
        </Badge>
      </div>
    </div>
  );
}

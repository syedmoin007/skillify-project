import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Handshake, MapPin, User } from "lucide-react";

interface SkillMatch {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  location?: string;
  wantsToLearn: {
    id: number;
    name: string;
  };
  offersToTeach: {
    id: number;
    name: string;
  };
}

interface SkillMatchCardProps {
  match: SkillMatch;
}

export default function SkillMatchCard({ match }: SkillMatchCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sendSwapRequestMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/swaps', {
        providerId: match.id,
        requesterSkillId: match.offersToTeach.id,
        providerSkillId: match.wantsToLearn.id,
        message: `Hi ${match.firstName}! I'd love to learn ${match.offersToTeach.name} from you in exchange for teaching you ${match.wantsToLearn.name}. Let's connect!`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/swaps'] });
      queryClient.invalidateQueries({ queryKey: ['/api/swap-matches'] });
      toast({
        title: "Swap request sent!",
        description: `Your skill swap request has been sent to ${match.firstName}.`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send swap request. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <Card className="skill-match-gradient border border-primary/20 hover-lift">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar className="h-12 w-12">
              <AvatarImage src={match.profileImageUrl} alt={`${match.firstName} ${match.lastName}`} />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">
                {match.firstName} {match.lastName}
              </h3>
              {match.location && (
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {match.location}
                </p>
              )}
              <div className="flex items-center mt-2">
                <span className="text-xs text-primary font-medium">Wants to learn:</span>
                <Badge variant="secondary" className="ml-2 text-xs bg-primary/10 text-primary">
                  {match.wantsToLearn.name}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="text-right mr-4">
              <p className="text-xs text-muted-foreground">Offers to teach:</p>
              <Badge variant="secondary" className="text-xs bg-secondary/10 text-secondary">
                {match.offersToTeach.name}
              </Badge>
            </div>
            <Button
              size="sm"
              onClick={() => sendSwapRequestMutation.mutate()}
              disabled={sendSwapRequestMutation.isPending}
              className="bg-primary text-white hover:bg-primary/90"
            >
              <Handshake className="h-4 w-4 mr-1" />
              {sendSwapRequestMutation.isPending ? "Sending..." : "Swap"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

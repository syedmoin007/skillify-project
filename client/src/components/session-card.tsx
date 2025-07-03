import { Button } from "@/components/ui/button";
import { Calendar, Video, Clock } from "lucide-react";
import { format, isToday, isTomorrow } from "date-fns";

interface SessionCardProps {
  session: {
    id: number;
    title: string;
    scheduledAt: string;
    duration: number;
    meetingLink?: string;
    isTeacher: boolean;
    partner: {
      id: string;
      firstName: string;
      lastName: string;
    };
    skill: {
      id: number;
      name: string;
    };
  };
}

export default function SessionCard({ session }: SessionCardProps) {
  const sessionDate = new Date(session.scheduledAt);
  const isUpcoming = sessionDate > new Date();
  
  const getDateDisplay = () => {
    if (isToday(sessionDate)) {
      return `Today, ${format(sessionDate, 'h:mm a')}`;
    } else if (isTomorrow(sessionDate)) {
      return `Tomorrow, ${format(sessionDate, 'h:mm a')}`;
    } else {
      return format(sessionDate, 'MMM d, h:mm a');
    }
  };

  const handleJoinSession = () => {
    if (session.meetingLink) {
      window.open(session.meetingLink, '_blank');
    } else {
      // Generate a simple meeting room URL
      const roomId = `skillify-${session.id}`;
      const meetingUrl = `https://meet.jit.si/${roomId}`;
      window.open(meetingUrl, '_blank');
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${
      isUpcoming && isToday(sessionDate) 
        ? 'session-gradient border-primary/20' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">{session.skill.name}</h3>
          <p className="text-xs text-muted-foreground">
            with {session.partner.firstName} {session.partner.lastName}
          </p>
          <div className="flex items-center mt-2">
            <Calendar className="h-3 w-3 text-muted-foreground mr-1" />
            <span className="text-xs text-muted-foreground">{getDateDisplay()}</span>
            <Clock className="h-3 w-3 text-muted-foreground mr-1 ml-3" />
            <span className="text-xs text-muted-foreground">{session.duration} min</span>
          </div>
        </div>
        {isUpcoming && isToday(sessionDate) ? (
          <Button 
            size="sm" 
            onClick={handleJoinSession}
            className="bg-primary text-white hover:bg-primary/90"
          >
            <Video className="h-4 w-4 mr-1" />
            Join
          </Button>
        ) : (
          <Button 
            size="sm" 
            variant="secondary"
            disabled
          >
            <Clock className="h-4 w-4 mr-1" />
            Scheduled
          </Button>
        )}
      </div>
    </div>
  );
}

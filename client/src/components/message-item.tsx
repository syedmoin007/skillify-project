import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface MessageItemProps {
  message: {
    id: number;
    content: string;
    createdAt: string;
    readAt?: string;
    swapId: number;
    sender: {
      id: string;
      firstName: string;
      lastName: string;
      profileImageUrl?: string;
    };
    isFromUser: boolean;
  };
}

export default function MessageItem({ message }: MessageItemProps) {
  const timeAgo = formatDistanceToNow(new Date(message.createdAt), { addSuffix: true });
  const isUnread = !message.readAt && !message.isFromUser;

  return (
    <div className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
      <div className="flex-shrink-0 relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={message.sender.profileImageUrl} alt={`${message.sender.firstName} ${message.sender.lastName}`} />
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        {isUnread && (
          <div className="online-indicator bg-primary"></div>
        )}
      </div>
      <div className="ml-3 flex-1">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">
            {message.sender.firstName} {message.sender.lastName}
          </h3>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
        <p className="text-sm text-muted-foreground truncate mt-1">
          {message.content}
        </p>
      </div>
      {isUnread && (
        <div className="ml-2">
          <Badge className="message-unread">New</Badge>
        </div>
      )}
    </div>
  );
}

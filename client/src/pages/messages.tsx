import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Send, MessageCircle, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSwapId, setSelectedSwapId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const { data: swaps } = useQuery({
    queryKey: ['/api/swaps'],
  });

  const { data: messages } = useQuery({
    queryKey: [`/api/messages/${selectedSwapId}`],
    enabled: !!selectedSwapId,
  });

  const { data: recentMessages } = useQuery({
    queryKey: ['/api/messages'],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { swapId: number; receiverId: string; content: string }) => {
      await apiRequest('POST', '/api/messages', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${selectedSwapId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      setNewMessage("");
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
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // WebSocket connection for real-time messaging
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'message' && data.swapId === selectedSwapId) {
            queryClient.invalidateQueries({ queryKey: [`/api/messages/${selectedSwapId}`] });
            queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [selectedSwapId, queryClient]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedSwapId) return;

    const selectedSwap = swaps?.find(swap => swap.id === selectedSwapId);
    if (!selectedSwap) return;

    const receiverId = selectedSwap.partner.id;

    sendMessageMutation.mutate({
      swapId: selectedSwapId,
      receiverId,
      content: newMessage.trim(),
    });

    // Send WebSocket message for real-time updates
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        swapId: selectedSwapId,
        senderId: user?.id,
        content: newMessage.trim(),
      }));
    }
  };

  const acceptedSwaps = swaps?.filter(swap => swap.status === 'accepted') || [];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
        <p className="text-lg text-muted-foreground">
          Communicate with your skill swap partners
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {acceptedSwaps.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No active swaps to message</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Accept some swap requests to start conversations
                  </p>
                </div>
              ) : (
                acceptedSwaps.map((swap) => {
                  const lastMessage = recentMessages?.find(msg => msg.swapId === swap.id);
                  const isUnread = lastMessage && !lastMessage.readAt && !lastMessage.isFromUser;
                  
                  return (
                    <div
                      key={swap.id}
                      onClick={() => setSelectedSwapId(swap.id)}
                      className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedSwapId === swap.id ? 'bg-primary/5 border-r-2 border-primary' : ''
                      }`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={swap.partner.profileImageUrl} alt={`${swap.partner.firstName} ${swap.partner.lastName}`} />
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {swap.partner.firstName} {swap.partner.lastName}
                          </p>
                          {lastMessage && (
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {swap.requesterSkill.name} ↔ {swap.providerSkill.name}
                        </p>
                        {lastMessage && (
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {lastMessage.content}
                          </p>
                        )}
                      </div>
                      {isUnread && (
                        <Badge className="message-unread ml-2">New</Badge>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Message Thread */}
        <Card className="col-span-2">
          {selectedSwapId ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center">
                  {(() => {
                    const selectedSwap = swaps?.find(swap => swap.id === selectedSwapId);
                    return selectedSwap ? (
                      <>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={selectedSwap.partner.profileImageUrl} alt={`${selectedSwap.partner.firstName} ${selectedSwap.partner.lastName}`} />
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <CardTitle className="text-lg">
                            {selectedSwap.partner.firstName} {selectedSwap.partner.lastName}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {selectedSwap.requesterSkill.name} ↔ {selectedSwap.providerSkill.name}
                          </p>
                        </div>
                      </>
                    ) : null;
                  })()}
                </div>
              </CardHeader>
              <CardContent className="p-0 flex flex-col h-[450px]">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages?.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No messages yet</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Start the conversation by sending a message
                      </p>
                    </div>
                  ) : (
                    messages?.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender.id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender.id === user?.id
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender.id === user?.id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Send Message Form */}
                <div className="border-t p-4">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">Select a conversation</p>
                <p className="text-muted-foreground">
                  Choose a conversation from the left to start messaging
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </main>
  );
}

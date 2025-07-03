import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Video, Calendar, Clock, Plus, User, Star, BookOpen, Play, CheckCircle } from "lucide-react";
import { format, isToday, isTomorrow, addHours } from "date-fns";

export default function LearnSpace() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedSwap, setSelectedSwap] = useState<any>(null);
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionDescription, setSessionDescription] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [sessionDuration, setSessionDuration] = useState("60");

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['/api/sessions'],
  });

  const { data: upcomingSessions } = useQuery({
    queryKey: ['/api/sessions/upcoming'],
  });

  const { data: swaps } = useQuery({
    queryKey: ['/api/swaps'],
  });

  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      await apiRequest('POST', '/api/sessions', sessionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sessions/upcoming'] });
      setIsScheduleDialogOpen(false);
      resetForm();
      toast({
        title: "Session scheduled",
        description: "Your learning session has been scheduled successfully.",
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
        description: "Failed to schedule session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateSessionStatusMutation = useMutation({
    mutationFn: async ({ sessionId, status }: { sessionId: number; status: string }) => {
      await apiRequest('PUT', `/api/sessions/${sessionId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sessions/upcoming'] });
      toast({
        title: "Session updated",
        description: "The session status has been updated successfully.",
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
        description: "Failed to update session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSessionTitle("");
    setSessionDescription("");
    setSessionDate("");
    setSessionTime("");
    setSessionDuration("60");
    setSelectedSwap(null);
  };

  const handleScheduleSession = () => {
    if (!selectedSwap || !sessionTitle || !sessionDate || !sessionTime) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const scheduledAt = new Date(`${sessionDate}T${sessionTime}`);
    
    createSessionMutation.mutate({
      swapId: selectedSwap.id,
      teacherId: selectedSwap.partner.id, // Assume partner is teaching
      studentId: selectedSwap.isRequester ? selectedSwap.partner.id : selectedSwap.requesterId,
      skillId: selectedSwap.providerSkill.id,
      title: sessionTitle,
      description: sessionDescription,
      scheduledAt: scheduledAt.toISOString(),
      duration: parseInt(sessionDuration),
      meetingLink: `https://meet.jit.si/skillify-${Date.now()}`,
    });
  };

  const handleJoinSession = (session: any) => {
    if (session.meetingLink) {
      window.open(session.meetingLink, '_blank');
    } else {
      const roomId = `skillify-${session.id}`;
      const meetingUrl = `https://meet.jit.si/${roomId}`;
      window.open(meetingUrl, '_blank');
    }
  };

  const getDateDisplay = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return `Today, ${format(date, 'h:mm a')}`;
    } else if (isTomorrow(date)) {
      return `Tomorrow, ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "scheduled":
        return "status-pending";
      case "in_progress":
        return "status-active";
      case "completed":
        return "status-completed";
      case "cancelled":
        return "status-cancelled";
      default:
        return "status-pending";
    }
  };

  const activeSwaps = swaps?.filter(swap => swap.status === 'accepted') || [];
  const scheduledSessions = sessions?.filter(session => session.status === 'scheduled') || [];
  const completedSessions = sessions?.filter(session => session.status === 'completed') || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">LearnSpace</h1>
          <p className="text-lg text-muted-foreground">
            Schedule and manage your learning sessions
          </p>
        </div>
        <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Session
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Schedule a Learning Session</DialogTitle>
              <DialogDescription>
                Create a new learning session with one of your skill swap partners
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="swap">Skill Swap</Label>
                <Select onValueChange={(value) => setSelectedSwap(activeSwaps.find(s => s.id === parseInt(value)))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a skill swap" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeSwaps.map((swap) => (
                      <SelectItem key={swap.id} value={swap.id.toString()}>
                        {swap.partner.firstName} {swap.partner.lastName} - {swap.providerSkill.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Session Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Photography Basics - Composition"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="What will you cover in this session?"
                  value={sessionDescription}
                  onChange={(e) => setSessionDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={sessionTime}
                    onChange={(e) => setSessionTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select value={sessionDuration} onValueChange={setSessionDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleScheduleSession}
                disabled={createSessionMutation.isPending}
              >
                {createSessionMutation.isPending ? "Scheduling..." : "Schedule Session"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upcoming Sessions */}
      {upcomingSessions && upcomingSessions.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              Upcoming Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 session-gradient border border-primary/20 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{session.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        with {session.partner.firstName} {session.partner.lastName}
                      </p>
                    </div>
                    <Badge className="status-active">
                      {session.isTeacher ? "Teaching" : "Learning"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {getDateDisplay(session.scheduledAt)} • {session.duration} min
                    </div>
                    {isToday(new Date(session.scheduledAt)) && (
                      <Button 
                        size="sm"
                        onClick={() => handleJoinSession(session)}
                      >
                        <Video className="h-4 w-4 mr-1" />
                        Join
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="scheduled" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scheduled" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Scheduled ({scheduledSessions.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Completed ({completedSessions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scheduled" className="mt-6">
          {scheduledSessions.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No scheduled sessions</h3>
                  <p className="text-muted-foreground mb-4">
                    Schedule your first learning session with a skill swap partner
                  </p>
                  <Button onClick={() => setIsScheduleDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {scheduledSessions.map((session) => (
                <Card key={session.id} className="hover-lift">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={session.partner.profileImageUrl} />
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <h3 className="font-medium text-gray-900">{session.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {session.partner.firstName} {session.partner.lastName}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusClass(session.status)}>
                        {session.isTeacher ? "Teaching" : "Learning"}
                      </Badge>
                    </div>
                    
                    {session.description && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {session.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center mb-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          {getDateDisplay(session.scheduledAt)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {session.duration} minutes
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateSessionStatusMutation.mutate({ sessionId: session.id, status: 'cancelled' })}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleJoinSession(session)}
                        >
                          <Video className="h-4 w-4 mr-1" />
                          Join
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedSessions.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No completed sessions yet</h3>
                  <p className="text-muted-foreground">
                    Complete your first learning session to see it here
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {completedSessions.map((session) => (
                <Card key={session.id} className="hover-lift">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={session.partner.profileImageUrl} />
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <h3 className="font-medium text-gray-900">{session.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {session.partner.firstName} {session.partner.lastName}
                          </p>
                        </div>
                      </div>
                      <Badge className="status-completed">
                        Completed
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-4">
                      <div className="flex items-center mb-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(session.scheduledAt), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {session.duration} minutes
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <Button variant="outline" size="sm">
                        <Star className="h-4 w-4 mr-1" />
                        Rate Session
                      </Button>
                      <Button variant="ghost" size="sm">
                        View Notes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}

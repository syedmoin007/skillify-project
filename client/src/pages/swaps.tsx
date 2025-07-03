import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { User, Handshake, CheckCircle, XCircle, MessageCircle, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Swaps() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: swaps, isLoading } = useQuery({
    queryKey: ['/api/swaps'],
  });

  const updateSwapStatusMutation = useMutation({
    mutationFn: async ({ swapId, status }: { swapId: number; status: string }) => {
      await apiRequest('PUT', `/api/swaps/${swapId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/swaps'] });
      toast({
        title: "Swap updated",
        description: "The swap status has been updated successfully.",
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
        description: "Failed to update swap status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "accepted":
        return "default";
      case "pending":
        return "secondary";
      case "completed":
        return "outline";
      case "rejected":
        return "destructive";
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
      case "rejected":
        return "status-cancelled";
      default:
        return "status-pending";
    }
  };

  const pendingSwaps = swaps?.filter(swap => swap.status === 'pending') || [];
  const activeSwaps = swaps?.filter(swap => swap.status === 'accepted') || [];
  const completedSwaps = swaps?.filter(swap => swap.status === 'completed') || [];

  const SwapCard = ({ swap }: { swap: any }) => (
    <Card key={swap.id} className="hover-lift">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Avatar className="h-12 w-12">
              <AvatarImage src={swap.partner.profileImageUrl} alt={`${swap.partner.firstName} ${swap.partner.lastName}`} />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                {swap.partner.firstName} {swap.partner.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(swap.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          <Badge variant={getStatusVariant(swap.status)} className={getStatusClass(swap.status)}>
            {swap.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-primary/5 rounded-lg">
            <p className="text-xs text-primary font-medium mb-1">
              {swap.isRequester ? "You teach" : "They teach"}
            </p>
            <p className="font-medium">{swap.requesterSkill.name}</p>
          </div>
          <div className="p-3 bg-secondary/5 rounded-lg">
            <p className="text-xs text-secondary font-medium mb-1">
              {swap.isRequester ? "They teach" : "You teach"}
            </p>
            <p className="font-medium">{swap.providerSkill.name}</p>
          </div>
        </div>

        {swap.message && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">"{swap.message}"</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = `/messages?swap=${swap.id}`}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Message
            </Button>
            {swap.status === 'accepted' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/learnspace'}
              >
                <Calendar className="h-4 w-4 mr-1" />
                Schedule
              </Button>
            )}
          </div>
          
          {swap.status === 'pending' && !swap.isRequester && (
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => updateSwapStatusMutation.mutate({ swapId: swap.id, status: 'rejected' })}
                disabled={updateSwapStatusMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Decline
              </Button>
              <Button
                size="sm"
                onClick={() => updateSwapStatusMutation.mutate({ swapId: swap.id, status: 'accepted' })}
                disabled={updateSwapStatusMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Accept
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Skill Swaps</h1>
        <p className="text-lg text-muted-foreground">
          Manage your skill exchange requests and active learning partnerships
        </p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="flex items-center">
            <Handshake className="h-4 w-4 mr-2" />
            Active ({activeSwaps.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center">
            <MessageCircle className="h-4 w-4 mr-2" />
            Pending ({pendingSwaps.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Completed ({completedSwaps.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {activeSwaps.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Handshake className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No active swaps</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by browsing available skills and sending swap requests
                  </p>
                  <Button onClick={() => window.location.href = '/discover'}>
                    Browse Skills
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeSwaps.map((swap) => (
                <SwapCard key={swap.id} swap={swap} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          {pendingSwaps.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
                  <p className="text-muted-foreground">
                    All caught up! No pending swap requests at the moment.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pendingSwaps.map((swap) => (
                <SwapCard key={swap.id} swap={swap} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedSwaps.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No completed swaps yet</h3>
                  <p className="text-muted-foreground">
                    Complete your first skill swap to see it here
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {completedSwaps.map((swap) => (
                <SwapCard key={swap.id} swap={swap} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}

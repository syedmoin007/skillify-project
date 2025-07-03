import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, GraduationCap, MessageCircle, Star, Calendar, Search, Plus } from "lucide-react";
import StatsCard from "@/components/stats-card";
import SkillMatchCard from "@/components/skill-match-card";
import SwapCard from "@/components/swap-card";
import MessageItem from "@/components/message-item";
import SessionCard from "@/components/session-card";
import ProgressBar from "@/components/progress-bar";

export default function Home() {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
  });

  const { data: matches } = useQuery({
    queryKey: ['/api/swap-matches'],
  });

  const { data: swaps } = useQuery({
    queryKey: ['/api/swaps'],
  });

  const { data: upcomingSessions } = useQuery({
    queryKey: ['/api/sessions/upcoming'],
  });

  const { data: recentMessages } = useQuery({
    queryKey: ['/api/messages'],
  });

  const { data: userSkills } = useQuery({
    queryKey: ['/api/user-skills'],
  });

  const activeSwaps = swaps?.filter(swap => swap.status === 'accepted') || [];
  const learningSkills = userSkills?.filter(skill => skill.type === 'learn') || [];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <section className="mb-12 animate-fade-in">
        <div className="welcome-gradient rounded-2xl p-8 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl font-bold mb-4">
                Welcome back, {user?.firstName || 'there'}!
              </h1>
              <p className="text-xl mb-6 text-blue-100">
                Ready to share your skills and learn something new today?
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-blue-50"
                  onClick={() => window.location.href = '/discover'}
                >
                  <Search className="mr-2 h-5 w-5" />
                  Browse Skills
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white text-white hover:bg-white hover:text-primary"
                  onClick={() => window.location.href = '/profile'}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add Skills
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="People collaborating and learning together" 
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="mb-12 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            icon={<Users className="h-6 w-6 text-primary" />}
            label="Active Swaps"
            value={stats?.activeSwaps || 0}
          />
          <StatsCard
            icon={<GraduationCap className="h-6 w-6 text-secondary" />}
            label="Sessions Completed"
            value={stats?.totalSessions || 0}
          />
          <StatsCard
            icon={<MessageCircle className="h-6 w-6 text-accent" />}
            label="Messages"
            value={recentMessages?.length || 0}
          />
          <StatsCard
            icon={<Star className="h-6 w-6 text-yellow-500" />}
            label="Rating"
            value={stats?.avgRating || 0}
          />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Skill Matchmaking */}
        <div className="lg:col-span-2">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg">Skill Matches For You</CardTitle>
              <CardDescription>
                People who want to learn what you teach
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {matches?.length === 0 ? (
                  <div className="text-center py-8">
                    <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No matches found yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Add more skills to your profile to find matches
                    </p>
                  </div>
                ) : (
                  matches?.map((match) => (
                    <SkillMatchCard key={match.id} match={match} />
                  ))
                )}
              </div>
              {matches?.length > 0 && (
                <div className="mt-6 text-center">
                  <Button 
                    variant="ghost" 
                    className="text-primary hover:text-primary/80"
                    onClick={() => window.location.href = '/discover'}
                  >
                    See More Matches
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Active Swaps */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg">Active Swaps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeSwaps.length === 0 ? (
                  <div className="text-center py-4">
                    <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No active swaps</p>
                  </div>
                ) : (
                  activeSwaps.slice(0, 3).map((swap) => (
                    <SwapCard key={swap.id} swap={swap} />
                  ))
                )}
              </div>
              {activeSwaps.length > 0 && (
                <div className="mt-4 text-center">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-primary hover:text-primary/80"
                    onClick={() => window.location.href = '/swaps'}
                  >
                    View All Swaps
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Sessions */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingSessions?.length === 0 ? (
                  <div className="text-center py-4">
                    <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No upcoming sessions</p>
                  </div>
                ) : (
                  upcomingSessions?.slice(0, 2).map((session) => (
                    <SessionCard key={session.id} session={session} />
                  ))
                )}
              </div>
              {upcomingSessions?.length > 0 && (
                <div className="mt-4 text-center">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-primary hover:text-primary/80"
                    onClick={() => window.location.href = '/learnspace'}
                  >
                    View All Sessions
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Learning Progress */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg">Learning Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {learningSkills.length === 0 ? (
                  <div className="text-center py-4">
                    <GraduationCap className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No learning skills yet</p>
                  </div>
                ) : (
                  learningSkills.slice(0, 3).map((skill) => (
                    <ProgressBar 
                      key={skill.id} 
                      skill={skill} 
                      progress={Math.random() * 100} // This would come from actual progress tracking
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Messages */}
      <section className="mt-12 animate-fade-in">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Messages</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-primary hover:text-primary/80"
                onClick={() => window.location.href = '/messages'}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMessages?.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No messages yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Start a conversation with your skill swap partners
                  </p>
                </div>
              ) : (
                recentMessages?.slice(0, 3).map((message) => (
                  <MessageItem key={message.id} message={message} />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Quick Actions */}
      <section className="mt-12 animate-fade-in">
        <div className="actions-gradient rounded-xl p-8 border border-border">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to grow your skills?</h2>
            <p className="text-muted-foreground">Connect with learners and teachers in your area</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center hover-lift cursor-pointer" onClick={() => window.location.href = '/discover'}>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg mb-2">Browse Skills</CardTitle>
                <CardDescription className="mb-4">
                  Discover amazing skills offered by people in your community
                </CardDescription>
                <Button className="w-full">
                  Explore Now
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover-lift cursor-pointer" onClick={() => window.location.href = '/profile'}>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle className="text-lg mb-2">Add Skills</CardTitle>
                <CardDescription className="mb-4">
                  Share your expertise and help others learn something new
                </CardDescription>
                <Button variant="secondary" className="w-full">
                  Add Skills
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover-lift cursor-pointer" onClick={() => window.location.href = '/learnspace'}>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-lg mb-2">Schedule Session</CardTitle>
                <CardDescription className="mb-4">
                  Book a learning session with one of your skill swap partners
                </CardDescription>
                <Button variant="outline" className="w-full">
                  Schedule Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}

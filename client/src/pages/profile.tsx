import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, X, MapPin, Mail, Star, User, GraduationCap, Award } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillType, setNewSkillType] = useState("teach");
  const [newSkillLevel, setNewSkillLevel] = useState("intermediate");
  const [newSkillDescription, setNewSkillDescription] = useState("");

  const { data: profile } = useQuery({
    queryKey: ['/api/profile'],
    onSuccess: (data) => {
      setBio(data.bio || "");
      setLocation(data.location || "");
    }
  });

  const { data: skills } = useQuery({
    queryKey: ['/api/skills'],
  });

  const { data: userSkills } = useQuery({
    queryKey: ['/api/user-skills'],
  });

  const { data: reviews } = useQuery({
    queryKey: [`/api/reviews/${user?.id}`],
    enabled: !!user?.id,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { bio: string; location: string }) => {
      await apiRequest('PUT', '/api/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
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
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addSkillMutation = useMutation({
    mutationFn: async (data: { skillId: number; type: string; level: string; description: string }) => {
      await apiRequest('POST', '/api/user-skills', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-skills'] });
      setNewSkillName("");
      setNewSkillDescription("");
      toast({
        title: "Skill added",
        description: "Your skill has been added successfully.",
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
        description: "Failed to add skill. Please try again.",
        variant: "destructive",
      });
    },
  });

  const removeSkillMutation = useMutation({
    mutationFn: async (skillId: number) => {
      await apiRequest('DELETE', `/api/user-skills/${skillId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-skills'] });
      toast({
        title: "Skill removed",
        description: "Your skill has been removed successfully.",
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
        description: "Failed to remove skill. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleProfileUpdate = () => {
    updateProfileMutation.mutate({ bio, location });
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a skill name.",
        variant: "destructive",
      });
      return;
    }

    // For now, we'll create a simple skill mapping
    // In a real app, you'd have a proper skill selection system
    const skillId = Math.floor(Math.random() * 1000) + 1;
    
    addSkillMutation.mutate({
      skillId,
      type: newSkillType,
      level: newSkillLevel,
      description: newSkillDescription,
    });
  };

  const teachingSkills = userSkills?.filter(skill => skill.type === 'teach') || [];
  const learningSkills = userSkills?.filter(skill => skill.type === 'learn') || [];

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.profileImageUrl || ""} alt={user?.firstName || ""} />
                <AvatarFallback>
                  <User className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h1>
                <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {user?.email}
                  </div>
                  {profile?.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {profile.location}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                    {profile?.rating || 0}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your profile information to help others find you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell others about yourself..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Enter your location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleProfileUpdate}
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            {/* Add New Skill */}
            <Card>
              <CardHeader>
                <CardTitle>Add New Skill</CardTitle>
                <CardDescription>
                  Add skills you can teach or want to learn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="skill-name">Skill Name</Label>
                    <Input
                      id="skill-name"
                      placeholder="e.g., Photography, Guitar, Cooking"
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="skill-type">Type</Label>
                    <Select value={newSkillType} onValueChange={setNewSkillType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teach">I can teach this</SelectItem>
                        <SelectItem value="learn">I want to learn this</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skill-level">Level</Label>
                  <Select value={newSkillLevel} onValueChange={setNewSkillLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skill-description">Description (Optional)</Label>
                  <Textarea
                    id="skill-description"
                    placeholder="Describe your experience with this skill..."
                    value={newSkillDescription}
                    onChange={(e) => setNewSkillDescription(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleAddSkill}
                  disabled={addSkillMutation.isPending}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {addSkillMutation.isPending ? "Adding..." : "Add Skill"}
                </Button>
              </CardContent>
            </Card>

            {/* Skills I Can Teach */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2 text-primary" />
                  Skills I Can Teach
                </CardTitle>
              </CardHeader>
              <CardContent>
                {teachingSkills.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No teaching skills added yet. Add skills you can teach to help others learn!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teachingSkills.map((skill) => (
                      <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{skill.skillId}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {skill.level}
                            </Badge>
                          </div>
                          {skill.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {skill.description}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSkillMutation.mutate(skill.skillId)}
                          disabled={removeSkillMutation.isPending}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills I Want to Learn */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-secondary" />
                  Skills I Want to Learn
                </CardTitle>
              </CardHeader>
              <CardContent>
                {learningSkills.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No learning skills added yet. Add skills you want to learn to find teachers!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {learningSkills.map((skill) => (
                      <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{skill.skillId}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {skill.level}
                            </Badge>
                          </div>
                          {skill.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {skill.description}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSkillMutation.mutate(skill.skillId)}
                          disabled={removeSkillMutation.isPending}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reviews & Feedback</CardTitle>
                <CardDescription>
                  See what others are saying about your teaching
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reviews?.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No reviews yet. Complete some skill swaps to receive feedback!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {reviews?.map((review) => (
                      <div key={review.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={review.reviewer.profileImageUrl} />
                              <AvatarFallback>
                                {review.reviewer.firstName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">
                              {review.reviewer.firstName} {review.reviewer.lastName}
                            </span>
                          </div>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating 
                                    ? 'text-yellow-400 fill-current' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Session: {review.session.title}
                        </p>
                        <p className="text-sm">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Active Swaps</p>
                      <p className="text-2xl font-bold">{profile?.stats?.activeSwaps || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <GraduationCap className="h-8 w-8 text-secondary" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                      <p className="text-2xl font-bold">{profile?.stats?.totalSessions || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Award className="h-8 w-8 text-accent" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Skills Teaching</p>
                      <p className="text-2xl font-bold">{teachingSkills.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Star className="h-8 w-8 text-yellow-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                      <p className="text-2xl font-bold">{profile?.stats?.avgRating || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

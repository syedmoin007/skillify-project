import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MapPin, Star, Users, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SkillMatchCard from "@/components/skill-match-card";

export default function Discover() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const { data: matches, isLoading } = useQuery({
    queryKey: ['/api/swap-matches'],
  });

  const { data: skills } = useQuery({
    queryKey: ['/api/skills'],
  });

  const categories = [...new Set(skills?.map(skill => skill.category) || [])];

  const filteredMatches = matches?.filter(match => {
    const matchesSearch = !searchTerm || 
      match.wantsToLearn.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.offersToTeach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${match.firstName} ${match.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  }) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Skills</h1>
        <p className="text-lg text-muted-foreground">
          Find people who want to learn what you teach and can teach what you want to learn
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search skills or people..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="in-person">In Person</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {filteredMatches.length} {filteredMatches.length === 1 ? 'Match' : 'Matches'} Found
          </h2>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>Sort by relevance</span>
          </div>
        </div>

        {filteredMatches.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or add more skills to your profile
                </p>
                <Button onClick={() => window.location.href = '/profile'}>
                  Update Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredMatches.map((match) => (
              <SkillMatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </div>

      {/* Featured Skills */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-6">Popular Skills</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {skills?.slice(0, 12).map((skill) => (
            <Card key={skill.id} className="hover-lift cursor-pointer">
              <CardContent className="p-4 text-center">
                <h3 className="font-medium text-sm mb-1">{skill.name}</h3>
                <Badge variant="secondary" className="text-xs">
                  {skill.category}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">1,234</p>
            <p className="text-sm text-muted-foreground">Active Learners</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">567</p>
            <p className="text-sm text-muted-foreground">Skills Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <MapPin className="h-8 w-8 text-secondary mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">89</p>
            <p className="text-sm text-muted-foreground">Cities Covered</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

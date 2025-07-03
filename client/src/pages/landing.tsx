import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, MessageCircle, Calendar, Star, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center items-center mb-8">
              <GraduationCap className="h-16 w-16 text-primary mr-4" />
              <h1 className="text-6xl font-bold text-gray-900">Skillify</h1>
            </div>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Empowering local skills through shared learning. Connect, learn, and grow together with our community of passionate learners and teachers.
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                size="lg" 
                className="px-8 py-3 text-lg"
                onClick={() => window.location.href = '/api/login'}
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-3 text-lg"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How Skillify Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to start your skill-sharing journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover-lift">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Create Your Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  List your skills and what you'd like to learn. Set your availability and location preferences.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover-lift">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle className="text-lg">Find Matches</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Discover people who want to learn your skills and can teach you something new.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover-lift">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-lg">Connect & Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Send skill swap requests and chat with potential learning partners to plan your exchange.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover-lift">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Learn Together</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Schedule sessions in our LearnSpace and start your skill-sharing journey with structured learning.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose Skillify?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-4 mt-1">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Community-Driven</h3>
                    <p className="text-gray-600">Join a supportive community of learners and teachers who believe in the power of shared knowledge.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center mr-4 mt-1">
                    <Star className="h-4 w-4 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Skill-Based Exchange</h3>
                    <p className="text-gray-600">Trade skills instead of money. Learn guitar while teaching photography - it's that simple.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center mr-4 mt-1">
                    <Calendar className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Flexible Learning</h3>
                    <p className="text-gray-600">Learn at your own pace with flexible scheduling that fits your lifestyle.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:text-right">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="People learning together" 
                className="rounded-lg shadow-lg w-full max-w-md mx-auto lg:mx-0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of learners and teachers already sharing skills on Skillify
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="px-8 py-3 text-lg"
            onClick={() => window.location.href = '/api/login'}
          >
            Join Skillify Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <GraduationCap className="h-8 w-8 text-primary mr-2" />
                <span className="text-xl font-bold">Skillify</span>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Empowering local skills through shared learning. Connect, learn, and grow together with our community of passionate learners and teachers.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Browse Skills</a></li>
                <li><a href="#" className="hover:text-white transition-colors">LearnSpace</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Safety Guidelines</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community Forum</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-400">
              © 2024 Skillify. All rights reserved. Made with ❤️ for learners everywhere.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { Link } from "react-router-dom";
import { Users, BookOpen, MessageSquare, Calendar, Search, Star, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Welcome = () => {
  const features = [
    {
      icon: BookOpen,
      title: "Share Resources",
      description: "Share study materials, notes, and academic resources with your campus community.",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: Users,
      title: "Request Help",
      description: "Need something? Request resources, study partners, or assistance from fellow students.",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: MessageSquare,
      title: "Connect & Chat",
      description: "Create private chats and build meaningful connections within your campus.",
      color: "from-green-500 to-blue-600"
    },
    {
      icon: Calendar,
      title: "Schedule Meetups",
      description: "Organize study sessions, group projects, and campus events with ease.",
      color: "from-orange-500 to-red-600"
    }
  ];

  const benefits = [
    "Connect with students across your campus",
    "Share and access academic resources instantly",
    "Build study groups and project teams",
    "Never miss campus events and opportunities",
    "Create lasting friendships and networks"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 text-center">
        <div className="max-w-6xl mx-auto">
          <div className="relative">
            <h1 className="text-6xl md:text-8xl font-bold mb-6">
              <span className="gradient-text">Campus</span>
              <br />
              <span className="gradient-text">Connect</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              The ultimate platform for students to connect, share resources, and build meaningful relationships within their campus community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/signup">
                <Button className="btn-hero text-lg px-8 py-4">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-border/50 hover:border-primary/50">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 gradient-text">Everything You Need</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover all the tools and features that make campus life easier and more connected.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="glass-card hover-lift group border-0">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl text-black/90 font-bold mb-6">Why Students Love CampusConnect</h2>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-black">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="w-80 h-80 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full absolute -top-10 -left-10 blur-3xl"></div>
                <div className="relative glass-card p-8 text-center">
                  <Star className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-2xl text-black font-bold mb-2">Join Today</h3>
                  <p className="text-black mb-6">
                    Become part of a thriving campus community
                  </p>
                  <Link to="/signup">
                    <Button className="btn-hero w-full">
                      Start Connecting
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Ready to Transform Your Campus Experience?</span></h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of students already connecting and sharing on CampusConnect.
          </p>
          <Link to="/signup">
            <Button className="btn-hero text-lg px-12 py-4">
              Join CampusConnect Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Welcome;

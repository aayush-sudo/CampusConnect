import { useState } from "react";
import { Search, Plus, Clock, CheckCircle, BookOpen, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const Homepage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data
  const userRequests = [
    {
      id: 1,
      title: "Looking for Calculus II Notes",
      description: "Need comprehensive notes for midterm prep",
      status: "pending",
      responses: 3,
      timeAgo: "2 hours ago"
    },
    {
      id: 2,
      title: "Study Partner for Organic Chemistry",
      description: "Looking for someone to study with for upcoming exam",
      status: "complete",
      responses: 1,
      timeAgo: "1 day ago"
    }
  ];

  const userContributions = [
    {
      id: 1,
      title: "Data Structures Cheat Sheet",
      description: "Complete guide with examples and time complexities",
      likes: 24,
      downloads: 156,
      timeAgo: "3 days ago"
    },
    {
      id: 2,
      title: "Physics Lab Report Template",
      description: "Professional template for lab reports",
      likes: 18,
      downloads: 89,
      timeAgo: "1 week ago"
    }
  ];

  const trendingPosts = [
    {
      id: 1,
      title: "Complete React.js Tutorial Series",
      author: "Sarah Chen",
      likes: 145,
      category: "Programming"
    },
    {
      id: 2,
      title: "Linear Algebra Study Guide",
      author: "Mike Johnson",
      likes: 98,
      category: "Mathematics"
    },
    {
      id: 3,
      title: "Psychology Research Methods Notes",
      author: "Emma Davis",
      likes: 76,
      category: "Psychology"
    }
  ];

  const filteredPosts = trendingPosts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-24 px-4 pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2"><span className="gradient-text">Welcome back! 👋</span></h1>
          <p className="text-muted-foreground text-lg">Here's what's happening in your campus community</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search for posts, resources, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-3 text-lg glass-card border-0"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Your Requests */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <Clock className="w-6 h-6 mr-2 text-primary" />
                  <span className="gradient-text">Your Recent Requests</span>
                </h2>
                <Link to="/request">
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    New Request
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-4">
                {userRequests.map((request) => (
                  <Card key={request.id} className="glass-card hover-lift border-0">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-lg">{request.title}</h3>
                        <Badge className={request.status === 'pending' ? 'status-pending' : 'status-complete'}>
                          {request.status === 'pending' ? 'Pending' : 'Complete'}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">{request.description}</p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{request.responses} responses</span>
                        <span>{request.timeAgo}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Trending Posts */}
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-primary" />
                <span className="gradient-text">
                {searchQuery ? `Search Results (${filteredPosts.length})` : 'Trending Posts'}
                </span>
              </h2>
              
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <Card key={post.id} className="glass-card hover-lift border-0">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {post.category}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{post.likes} likes</span>
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{post.title}</h3>
                      <p className="text-muted-foreground">by {post.author}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Your Contributions */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <BookOpen className="w-5 h-5 mr-2 text-primary" />
                  Your Contributions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userContributions.map((contribution) => (
                  <div key={contribution.id} className="space-y-2">
                    <h4 className="font-medium">{contribution.title}</h4>
                    <p className="text-sm text-muted-foreground">{contribution.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{contribution.likes} likes</span>
                      <span>{contribution.downloads} downloads</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{contribution.timeAgo}</div>
                  </div>
                ))}
                <Link to="/posts">
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    View All Posts
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/request" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    Make a Request
                  </Button>
                </Link>
                <Link to="/posts" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Share Resource
                  </Button>
                </Link>
                <Link to="/chat" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Start Chat
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;

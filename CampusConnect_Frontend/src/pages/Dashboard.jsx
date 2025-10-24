import { useState } from "react";
import { Clock, CheckCircle, Users, TrendingUp, Search, Filter, Calendar, MapPin, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [activePopupId, setActivePopupId] = useState(null);

  // Mock incoming requests data
  const incomingRequests = [
    {
      id: 1,
      title: "Looking for Machine Learning Study Partner",
      description: "Need someone to practice coding interviews and ML concepts with. Available weekends.",
      requester: {
        name: "Aayush Hardas",
        avatar: "/placeholder.svg",
        year: "3rd Year",
        major: "Computer Science"
      },
      category: "Study Partner",
      urgency: "medium",
      location: "Library Study Room",
      timeAgo: "2 hours ago",
      responses: 0,
      tags: ["machine-learning", "coding", "interviews"]
    },
    {
      id: 2,
      title: "Need Data Structures Assignment Help",
      description: "Struggling with binary trees and graph algorithms. Looking for tutoring or study group.",
      requester: {
        name: "Aditya Sontakke",
        avatar: "/placeholder.svg",
        year: "2nd Year",
        major: "Computer Science"
      },
      category: "Tutoring",
      urgency: "high",
      location: "Computer Lab",
      timeAgo: "4 hours ago",
      responses: 2,
      tags: ["data-structures", "algorithms", "tutoring"]
    },
    {
      id: 3,
      title: "Organic Chemistry Lab Report Examples",
      description: "Looking for well-formatted lab report examples for organic chemistry course.",
      requester: {
        name: "Anirudh Navuduri",
        avatar: "/placeholder.svg",
        year: "2nd Year",
        major: "Chemistry"
      },
      category: "Study Material",
      urgency: "medium",
      location: "Chemistry Building",
      timeAgo: "1 day ago",
      responses: 1,
      tags: ["chemistry", "lab-report", "examples"]
    },
    {
      id: 4,
      title: "Linear Algebra Study Group",
      description: "Starting a study group for linear algebra. Meeting twice a week before midterm.",
      requester: {
        name: "Arya Patil",
        avatar: "/placeholder.svg",
        year: "1st Year",
        major: "Mathematics"
      },
      category: "Study Group",
      urgency: "low",
      location: "Math Building",
      timeAgo: "2 days ago",
      responses: 3,
      tags: ["linear-algebra", "study-group", "midterm"]
    },
    {
      id: 5,
      title: "React.js Project Team Member Needed",
      description: "Working on a web app project for CS course. Need someone with React/Node.js experience.",
      requester: {
        name: "Aarush Jain",
        avatar: "/placeholder.svg",
        year: "3rd Year",
        major: "Computer Science"
      },
      category: "Project Team",
      urgency: "high",
      location: "Innovation Hub",
      timeAgo: "3 days ago",
      responses: 4,
      tags: ["react", "nodejs", "web-development", "project"]
    }
  ];

  const filteredRequests = incomingRequests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.requester.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || request.category.toLowerCase().includes(filterCategory.toLowerCase());
    
    let matchesTime = true;
    if (timeFilter !== "all") {
      const now = new Date();
      const requestTime = new Date();
      
      switch (timeFilter) {
        case "today":
          matchesTime = request.timeAgo.includes("hour");
          break;
        case "week":
          matchesTime = request.timeAgo.includes("day") && !request.timeAgo.includes("week");
          break;
        case "month":
          matchesTime = request.timeAgo.includes("week") || request.timeAgo.includes("day");
          break;
      }
    }
    
    return matchesSearch && matchesCategory && matchesTime;
  });

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "high": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Study Partner": return <Users className="w-4 h-4" />;
      case "Study Group": return <Users className="w-4 h-4" />;
      case "Tutoring": return <Users className="w-4 h-4" />;
      case "Project Team": return <Users className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleRespond = (requestId) => {
    setActivePopupId(activePopupId === requestId ? null : requestId);
    // Mock response - will integrate with backend later
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2"><span className="gradient-text">Request Dashboard</span></h1>
          <p className="text-muted-foreground text-lg">
            Help your fellow students by responding to their requests
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Helped Today</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">156</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Response Rate</p>
                  <p className="text-2xl font-bold">92%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search requests by title, description, or requester..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-card border-0"
            />
          </div>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48 glass-card border-0">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="study">Study Related</SelectItem>
              <SelectItem value="project">Project Team</SelectItem>
              <SelectItem value="tutoring">Tutoring</SelectItem>
              <SelectItem value="material">Study Material</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-32 glass-card border-0">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Requests List */}
        <div className="space-y-6">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="glass-card hover-lift border-0">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={request.requester.avatar} />
                      <AvatarFallback>{request.requester.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="p-1 bg-primary/20 rounded">
                          {getCategoryIcon(request.category)}
                        </div>
                        <h3 className="font-semibold text-xl">{request.title}</h3>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-2 text-sm text-muted-foreground">
                        <span className="font-medium">{request.requester.name}</span>
                        <span>•</span>
                        <span>{request.requester.year}</span>
                        <span>•</span>
                        <span>{request.requester.major}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={getUrgencyColor(request.urgency)}>
                      {request.urgency}
                    </Badge>
                    <Badge variant="secondary">{request.category}</Badge>
                  </div>
                </div>

                <p className="text-muted-foreground mb-4">{request.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {request.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {request.location}
                    </span>
                    <span className="flex items-center">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      {request.responses} responses
                    </span>
                    <span>{request.timeAgo}</span>
                  </div>
                  
                  <div className="relative">
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRespond(request.id)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Respond
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="btn-hero"
                    >
                      Help Out
                    </Button>
                  </div>

                  {activePopupId === request.id && (
                <div className="absolute bottom-12 right-0 bg-gradient-to-tr from-blue-900 via-indigo-800 to-purple-800 text-white rounded-xl shadow-xl border border-white/20 p-4 w-72 transition-all duration-300 transform translate-y-2 opacity-100 z-50">
                  <p className="font-semibold text-lg mb-3">Upload Your Response</p>

                  <div className="space-y-3 text-sm">
                    <label className="block cursor-pointer hover:text-indigo-300 transition-colors">
                      <input type="file" accept="image/*" className="hidden" id={`image-upload-${request.id}`} />
                      <label htmlFor={`image-upload-${request.id}`} className="flex items-center space-x-2">
                        <span>📷</span>
                        <span>Upload Image</span>
                      </label>
                    </label>

                    <label className="block cursor-pointer hover:text-indigo-300 transition-colors">
                      <input type="file" accept="video/*" className="hidden" id={`video-upload-${request.id}`} />
                      <label htmlFor={`video-upload-${request.id}`} className="flex items-center space-x-2">
                        <span>🎥</span>
                        <span>Upload Video</span>
                      </label>
                    </label>

                    <label className="block cursor-pointer hover:text-indigo-300 transition-colors">
                      <input type="file" className="hidden" id={`file-upload-${request.id}`} />
                      <label htmlFor={`file-upload-${request.id}`} className="flex items-center space-x-2">
                        <span>📁</span>
                        <span>Upload File</span>
                      </label>
                    </label>

                    <button
                      onClick={() => setActivePopupId(null)}
                      className="mt-2 text-sm text-red-300 hover:text-red-100 transition-colors"
                    >
                      ✖ Cancel
                    </button>
                  </div>
                </div>
              )}

                </div>

                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No requests found</h3>
            <p className="text-muted-foreground">
              {searchQuery || filterCategory !== "all" || timeFilter !== "all"
                ? "Try adjusting your search or filters"
                : "No new requests at the moment"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

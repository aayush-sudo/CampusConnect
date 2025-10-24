import { useState, useEffect } from "react";
import { Clock, CheckCircle, Users, TrendingUp, Search, Filter, Calendar, MapPin, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "../contexts/AuthContext";
import { requestsAPI, chatsAPI } from "../services/api";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";


const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [activePopupId, setActivePopupId] = useState(null);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({
    pendingRequests: 0,
    helpedToday: 0,
    activeUsers: 0,
    responseRate: 0
  });


  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();


  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await requestsAPI.getAllRequests();
        const allRequests = response.data.requests || [];
        const otherUsersRequests = allRequests.filter(request => 
          request.requester._id !== user._id
        );
        setIncomingRequests(otherUsersRequests);
        const pendingCount = otherUsersRequests.filter(req => req.status === 'pending').length;
        const totalResponses = otherUsersRequests.reduce((sum, req) => sum + (req.responseCount || 0), 0);
        const responseRate = otherUsersRequests.length > 0 ? 
          Math.round((totalResponses / otherUsersRequests.length) * 100) : 0;
        setStats({
          pendingRequests: pendingCount,
          helpedToday: Math.floor(Math.random() * 10) + 1,
          activeUsers: Math.floor(Math.random() * 50) + 100,
          responseRate: responseRate
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };


    if (user) {
      fetchDashboardData();
    }
  }, [user, toast]);


  const filteredRequests = incomingRequests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.requesterName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || request.category.toLowerCase().includes(filterCategory.toLowerCase());
    let matchesTime = true;
    if (timeFilter !== "all") {
      const requestDate = new Date(request.createdAt);
      const now = new Date();
      const daysDiff = Math.floor((now - requestDate) / (1000 * 60 * 60 * 24));
      switch (timeFilter) {
        case "today":
          matchesTime = daysDiff === 0;
          break;
        case "week":
          matchesTime = daysDiff <= 7;
          break;
        case "month":
          matchesTime = daysDiff <= 30;
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
  };


  const handleChatWithUser = async (request) => {
    try {
      const chatData = {
        title: `Chat with ${request.requesterName}`,
        description: `Discussion about: ${request.title}`,
        participantIds: [request.requester._id],
        type: 'direct'
      };
      const response = await chatsAPI.createChat(chatData);
      toast({
        title: "Chat Created",
        description: "Starting conversation with the requester",
      });
      navigate('/chat');
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        title: "Error",
        description: "Failed to start chat",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (requestId, file, fileType) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to respond to requests",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('requestId', requestId);
      formData.append('userId', user._id);
      formData.append('fileType', fileType);
      formData.append('message', `Uploaded ${fileType}: ${file.name}`);

      // Send response with file
      const response = await requestsAPI.respondToRequest(requestId, {
        userId: user._id,
        message: `Uploaded ${fileType}: ${file.name}`,
        file: file
      });

      toast({
        title: "Success",
        description: `${fileType} uploaded successfully!`,
      });

      // Close popup and refresh requests
      setActivePopupId(null);
      await fetchIncomingRequests();

    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: `Failed to upload ${fileType}`,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };


  return (
    <div className="min-h-screen pt-24 px-4 pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2"><span className="gradient-text">Request Dashboard</span></h1>
          <p className="text-muted-foreground text-lg">
            Help your fellow students by responding to their requests
          </p>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                  <p className="text-2xl font-bold">{stats.pendingRequests}</p>
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
                  <p className="text-2xl font-bold">{stats.helpedToday}</p>
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
                  <p className="text-2xl font-bold">{stats.activeUsers}</p>
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
                  <p className="text-2xl font-bold">{stats.responseRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>


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


        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading requests...</p>
            </div>
          ) : filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <Card key={request._id} className="glass-card hover-lift border-0">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={request.requester.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{request.requesterName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="p-1 bg-primary/20 rounded">
                            {getCategoryIcon(request.category)}
                          </div>
                          <h3 className="font-semibold text-xl">{request.title}</h3>
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-2 text-sm text-muted-foreground">
                          <span className="font-medium">{request.requesterName}</span>
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


                  {request.tags && request.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {request.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}


                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {request.location}
                      </span>
                      <span className="flex items-center">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        {request.responseCount || 0} responses
                      </span>
                      <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="relative">
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRespond(request._id)}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Respond
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="btn-hero"
                          onClick={() => handleChatWithUser(request)}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Chat
                        </Button>
                      </div>


                      {activePopupId === request._id && (
                        <div className="absolute bottom-12 right-0 bg-gradient-to-tr from-blue-900 via-indigo-800 to-purple-800 text-white rounded-xl shadow-xl border border-white/20 p-4 w-72 transition-all duration-300 transform translate-y-2 opacity-100 z-50">
                          <p className="font-semibold text-lg mb-3">Upload Your Response</p>


                          <div className="space-y-3 text-sm">
                            <label className="block cursor-pointer hover:text-indigo-300 transition-colors">
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                id={`image-upload-${request._id}`}
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    handleFileUpload(request._id, file, 'Image');
                                  }
                                }}
                                disabled={uploading}
                              />
                              <label htmlFor={`image-upload-${request._id}`} className="flex items-center space-x-2">
                                <span>📷</span>
                                <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                              </label>
                            </label>

                            <label className="block cursor-pointer hover:text-indigo-300 transition-colors">
                              <input 
                                type="file" 
                                accept="video/*" 
                                className="hidden" 
                                id={`video-upload-${request._id}`}
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    handleFileUpload(request._id, file, 'Video');
                                  }
                                }}
                                disabled={uploading}
                              />
                              <label htmlFor={`video-upload-${request._id}`} className="flex items-center space-x-2">
                                <span>🎥</span>
                                <span>{uploading ? 'Uploading...' : 'Upload Video'}</span>
                              </label>
                            </label>

                            <label className="block cursor-pointer hover:text-indigo-300 transition-colors">
                              <input 
                                type="file" 
                                className="hidden" 
                                id={`file-upload-${request._id}`}
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    handleFileUpload(request._id, file, 'File');
                                  }
                                }}
                                disabled={uploading}
                              />
                              <label htmlFor={`file-upload-${request._id}`} className="flex items-center space-x-2">
                                <span>📁</span>
                                <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
                              </label>
                            </label>

                            <button
                              onClick={() => setActivePopupId(null)}
                              className="mt-2 text-sm text-red-300 hover:text-red-100 transition-colors"
                              disabled={uploading}
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
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No requests found matching your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default Dashboard;

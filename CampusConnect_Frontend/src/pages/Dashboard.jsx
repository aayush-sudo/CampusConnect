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
import axios from "axios";


const API_URL = "http://localhost:5000/api";


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
    requestsResponded: 0, // Changed from helpedToday
    totalUsers: 0, // Changed from activeUsers
    responseRate: 0
  });


  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();


  // Fetch total user count
  const fetchTotalUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/count`);
      return response.data.count;
    } catch (error) {
      console.error('Error fetching total users:', error);
      return 0;
    }
  };


  // Fetch current user's requests responded count
  const fetchRequestsResponded = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/users/me/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data.requestsResponded;
    } catch (error) {
      console.error('Error fetching requests responded:', error);
      return 0;
    }
  };


  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch requests
      const response = await requestsAPI.getAllRequests();
      const allRequests = response.data.requests || [];
      const otherUsersRequests = allRequests.filter(request => 
        request.requester._id !== user._id
      );
      setIncomingRequests(otherUsersRequests);
      
      // Calculate stats
      const pendingCount = otherUsersRequests.filter(req => req.status === 'pending').length;
      const totalResponses = otherUsersRequests.reduce((sum, req) => sum + (req.responseCount || 0), 0);
      const responseRate = otherUsersRequests.length > 0 ? 
        Math.round((totalResponses / otherUsersRequests.length) * 100) : 0;
      
      // Fetch total users and user's requests responded
      const [totalUsers, requestsResponded] = await Promise.all([
        fetchTotalUsers(),
        fetchRequestsResponded()
      ]);
      
      setStats({
        pendingRequests: pendingCount,
        requestsResponded: requestsResponded,
        totalUsers: totalUsers,
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


  useEffect(() => {
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


  // ============================================
  // UPDATED: File upload handler
  // ============================================
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

      // Use the API service which already handles FormData correctly
      const response = await requestsAPI.respondToRequest(requestId, {
        message: `Uploaded ${fileType}: ${file.name}`,
        file: file  // Pass the file object directly
      });

      // Increment the local count immediately for better UX
      setStats(prevStats => ({
        ...prevStats,
        requestsResponded: prevStats.requestsResponded + 1
      }));

      toast({
        title: "Success",
        description: `${fileType} uploaded successfully!`,
      });

      // Close popup and refresh requests
      setActivePopupId(null);
      // Refresh the dashboard data to show updated requests
      await fetchDashboardData();

    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || `Failed to upload ${fileType}`,
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


          {/* UPDATED: Requests Responded */}
          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Requests Responded</p>
                  <p className="text-2xl font-bold">{stats.requestsResponded}</p>
                </div>
              </div>
            </CardContent>
          </Card>


          {/* UPDATED: No. of Users */}
          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">No. of Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
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
                        <div className="absolute bottom-12 right-0 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-80 transition-all duration-300 transform translate-y-2 opacity-100 z-50 backdrop-blur-sm">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                              Upload Response
                            </h3>
                            <button
                              onClick={() => setActivePopupId(null)}
                              disabled={uploading}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                              <span className="text-2xl">×</span>
                            </button>
                          </div>


                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Choose a file type to upload your response
                          </p>


                          <div className="space-y-3">
                            {/* Image Upload */}
                            <label className="block">
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
                              <label
                                htmlFor={`image-upload-${request._id}`}
                                className={`flex items-center space-x-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${uploading
                                    ? 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 cursor-not-allowed opacity-60'
                                    : 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950 hover:border-blue-400 hover:bg-blue-100 dark:hover:border-blue-700 dark:hover:bg-blue-900 hover:shadow-md'
                                  }`}
                              >
                                <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                  <span className="text-2xl">📷</span>
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900 dark:text-white">
                                    {uploading ? 'Uploading...' : 'Upload Image'}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    JPG, PNG, GIF
                                  </p>
                                </div>
                              </label>
                            </label>


                            {/* Video Upload */}
                            <label className="block">
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
                              <label
                                htmlFor={`video-upload-${request._id}`}
                                className={`flex items-center space-x-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${uploading
                                    ? 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 cursor-not-allowed opacity-60'
                                    : 'border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950 hover:border-purple-400 hover:bg-purple-100 dark:hover:border-purple-700 dark:hover:bg-purple-900 hover:shadow-md'
                                  }`}
                              >
                                <div className="flex-shrink-0 w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                                  <span className="text-2xl">🎥</span>
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900 dark:text-white">
                                    {uploading ? 'Uploading...' : 'Upload Video'}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    MP4, MOV, AVI
                                  </p>
                                </div>
                              </label>
                            </label>


                            {/* File Upload */}
                            <label className="block">
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
                              <label
                                htmlFor={`file-upload-${request._id}`}
                                className={`flex items-center space-x-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${uploading
                                    ? 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 cursor-not-allowed opacity-60'
                                    : 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950 hover:border-green-400 hover:bg-green-100 dark:hover:border-green-700 dark:hover:bg-green-900 hover:shadow-md'
                                  }`}
                              >
                                <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                                  <span className="text-2xl">📁</span>
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900 dark:text-white">
                                    {uploading ? 'Uploading...' : 'Upload File'}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    PDF, DOC, TXT
                                  </p>
                                </div>
                              </label>
                            </label>
                          </div>


                          {uploading && (
                            <div className="mt-4 flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                              <span className="text-sm font-medium">Uploading...</span>
                            </div>
                          )}
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

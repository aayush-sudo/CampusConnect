import { useState, useEffect } from "react";
import { Plus, Clock, CheckCircle, Search, Filter, BookOpen, Users, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "../contexts/AuthContext";
import { requestsAPI } from "../services/api";
import { useToast } from "@/hooks/use-toast";

const Request = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRequest, setNewRequest] = useState({
    title: "",
    description: "",
    category: "",
    urgency: "",
    meetupLocation: ""
  });

  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user's requests on component mount
  useEffect(() => {
    const fetchUserRequests = async () => {
      if (user) {
        try {
          setLoading(true);
          const response = await requestsAPI.getUserRequests(user._id);
          setRequests(response.data);
        } catch (error) {
          console.error('Error fetching requests:', error);
          toast({
            title: "Error",
            description: "Failed to load your requests",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserRequests();
  }, [user, toast]);

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || request.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a request",
        variant: "destructive",
      });
      return;
    }

    try {
      const requestData = {
        title: newRequest.title,
        description: newRequest.description,
        category: newRequest.category,
        urgency: newRequest.urgency,
        location: newRequest.meetupLocation || "Not specified",
        tags: [] // You can add tag functionality later
      };

      const response = await requestsAPI.createRequest(requestData);
      
      toast({
        title: "Success",
        description: "Request created successfully!",
      });

      // Reset form
      setNewRequest({
        title: "",
        description: "",
        category: "",
        urgency: "",
        meetupLocation: ""
      });

      // Refresh requests list
      const updatedResponse = await requestsAPI.getUserRequests(user._id);
      setRequests(updatedResponse.data);

    } catch (error) {
      console.error('Error creating request:', error);
      toast({
        title: "Error",
        description: "Failed to create request",
        variant: "destructive",
      });
    }
  };

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
      case "Study Material": return <BookOpen className="w-4 h-4" />;
      case "Study Partner": return <Users className="w-4 h-4" />;
      case "Project Team": return <Users className="w-4 h-4" />;
      case "Textbook": return <BookOpen className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="gradient-text">
              Your Requests
              </span>
              </h1>
            <p className="text-muted-foreground text-lg">Manage your resource requests and find what you need</p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="btn-hero">
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-0">
              <DialogHeader>
                <DialogTitle>Create New Request</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateRequest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="What do you need?"
                    value={newRequest.title}
                    onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide more details about what you're looking for..."
                    value={newRequest.description}
                    onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={newRequest.category} onValueChange={(value) => setNewRequest({ ...newRequest, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Study Material">Study Material</SelectItem>
                        <SelectItem value="Study Partner">Study Partner</SelectItem>
                        <SelectItem value="Project Team">Project Team</SelectItem>
                        <SelectItem value="Textbook">Textbook</SelectItem>
                        <SelectItem value="Equipment">Equipment</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="urgency">Urgency</Label>
                    <Select value={newRequest.urgency} onValueChange={(value) => setNewRequest({ ...newRequest, urgency: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Preferred Meetup Location (Optional)</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Library, Student Center"
                    value={newRequest.meetupLocation}
                    onChange={(e) => setNewRequest({ ...newRequest, meetupLocation: e.target.value })}
                  />
                </div>

                <Button type="submit" className="btn-hero w-full">
                  Create Request
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search your requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-card border-0"
            />
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48 glass-card border-0">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Requests List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading your requests...</p>
            </div>
          ) : filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <Card key={request._id} className="glass-card hover-lift border-0">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/20 rounded-lg">
                        {getCategoryIcon(request.category)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-xl">{request.title}</h3>
                        <p className="text-muted-foreground">{request.category}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={getUrgencyColor(request.urgency)}>
                        {request.urgency}
                      </Badge>
                      <Badge className={request.status === 'pending' ? 'status-pending' : 'status-complete'}>
                        {request.status === 'pending' ? (
                          <>
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Complete
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-4">{request.description}</p>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <span>{request.responseCount || 0} responses</span>
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {request.location}
                      </span>
                    </div>
                    <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No requests found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || filterStatus !== "all"
                  ? "Try adjusting your search or filters"
                  : "You haven't made any requests yet"}
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="btn-hero">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Request
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Request;

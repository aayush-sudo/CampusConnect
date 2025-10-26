import { useState, useEffect } from "react";
import { Search, Plus, Clock, CheckCircle, BookOpen, Users, TrendingUp, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { homepageAPI } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

const Homepage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [userRequests, setUserRequests] = useState([]);
  const [userContributions, setUserContributions] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch homepage data
  useEffect(() => {
    const fetchHomepageData = async () => {
      console.log('User data:', user);
      console.log('User ID:', user?._id);
      
      if (!user?._id) {
        console.log('No user ID found, skipping fetch');
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching homepage data for user:', user._id);
        
        const [requestsResponse, contributionsResponse, trendingResponse] = await Promise.all([
          homepageAPI.getUserRecentRequests(user._id, 5),
          homepageAPI.getUserContributions(user._id, 5),
          homepageAPI.getTrendingPosts(10)
        ]);
        
        console.log('API responses:', {
          requests: requestsResponse.data,
          contributions: contributionsResponse.data,
          trending: trendingResponse.data
        });
        
        setUserRequests(requestsResponse.data || []);
        setUserContributions(contributionsResponse.data || []);
        setTrendingPosts(trendingResponse.data || []);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
        console.error('Error details:', err.response?.data);
        setError('Failed to load homepage data');
      } finally {
        setLoading(false);
      }
    };

    fetchHomepageData();
  }, [user?._id]);

  const filteredPosts = trendingPosts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle refresh
  const handleRefresh = async () => {
    if (!user?._id) {
      console.log('No user ID found, skipping refresh');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Refreshing homepage data for user:', user._id);
      
      const [requestsResponse, contributionsResponse, trendingResponse] = await Promise.all([
        homepageAPI.getUserRecentRequests(user._id, 5),
        homepageAPI.getUserContributions(user._id, 5),
        homepageAPI.getTrendingPosts(10)
      ]);
      
      console.log('Refreshed API responses:', {
        requests: requestsResponse.data,
        contributions: contributionsResponse.data,
        trending: trendingResponse.data
      });
      
      setUserRequests(requestsResponse.data || []);
      setUserContributions(contributionsResponse.data || []);
      setTrendingPosts(trendingResponse.data || []);
      
      toast({
        title: "Refreshed",
        description: "Homepage data has been refreshed"
      });
    } catch (err) {
      console.error('Error refreshing homepage data:', err);
      console.error('Error details:', err.response?.data);
      setError('Failed to refresh homepage data');
      toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 pb-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen pt-24 px-4 pb-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="gradient-text">Welcome back{user?.firstName ? `, ${user.firstName}` : ''}! 👋</span>
            </h1>
            <p className="text-muted-foreground text-lg">Here's what's happening in your campus community</p>
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            className="mr-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
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
                {userRequests.length > 0 ? (
                  userRequests.map((request) => (
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
                  ))
                ) : (
                  <Card className="glass-card border-0">
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground mb-4">You haven't made any requests yet.</p>
                      <Link to="/request">
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Make Your First Request
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
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
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
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
                  ))
                ) : (
                  <Card className="glass-card border-0">
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">
                        {searchQuery ? 'No posts found matching your search.' : 'No trending posts available.'}
                      </p>
                    </CardContent>
                  </Card>
                )}
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
                {userContributions.length > 0 ? (
                  <>
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
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">You haven't shared any resources yet.</p>
                    <Link to="/posts">
                      <Button variant="outline" size="sm" className="w-full">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Share Your First Resource
                      </Button>
                    </Link>
                  </div>
                )}
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

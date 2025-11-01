import { useState, useEffect } from "react";
import { Plus, Heart, Download, Search, Filter, BookOpen, Upload, Eye, Share2, RefreshCw, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";


const API_URL = "https://campusconnect-rgx2.onrender.com/api";


const Posts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [userPosts, setUserPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewPostDialog, setViewPostDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postToEdit, setPostToEdit] = useState(null);
  const [postToDelete, setPostToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const [newPost, setNewPost] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
    fileType: ""
  });


  const [editPost, setEditPost] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
    fileType: ""
  });


  // Get user from localStorage
  const getUserId = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?._id;
  };


  const getAuthToken = () => {
    return localStorage.getItem('token');
  };


  // Fetch all posts
  const fetchAllPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/posts`, {
        params: {
          category: filterCategory === 'all' ? undefined : filterCategory,
          search: searchQuery || undefined
        }
      });
      setAllPosts(response.data.posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };


  // Fetch user's posts
  const fetchUserPosts = async () => {
    const userId = getUserId();
    if (!userId) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/posts/user/${userId}`);
      setUserPosts(response.data);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch your posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };


  // Initial load
  useEffect(() => {
    fetchAllPosts();
    fetchUserPosts();
  }, []);


  // Refresh when filter or search changes
  useEffect(() => {
    fetchAllPosts();
  }, [filterCategory, searchQuery]);


  // ============================================
  // STEP 2: NEW - Check for shared post in URL
  // ============================================
  useEffect(() => {
    // Check if there's a postId in URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('postId');
    
    if (postId) {
      // Find the post and open the view dialog
      const findAndOpenPost = async () => {
        try {
          const response = await axios.get(`${API_URL}/posts/${postId}`);
          if (response.data) {
            // Don't increment view count again, just open dialog
            setSelectedPost(response.data);
            setViewPostDialog(true);
          }
        } catch (error) {
          console.error('Error loading shared post:', error);
          toast({
            title: "Error",
            description: "Could not load the shared post",
            variant: "destructive"
          });
        }
      };
      
      findAndOpenPost();
      
      // Optional: Clean up URL after opening (removes the ?postId= from URL)
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []); // Empty dependency array means this runs only once on mount


  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };


  // Create new post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }


    try {
      const formData = new FormData();
      formData.append('title', newPost.title);
      formData.append('description', newPost.description);
      formData.append('category', newPost.category);
      formData.append('tags', newPost.tags);
      formData.append('fileType', newPost.fileType);
      formData.append('file', selectedFile);


      const token = getAuthToken();
      await axios.post(`${API_URL}/posts`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });


      toast({
        title: "Success",
        description: "Post created successfully!"
      });


      // Reset form
      setNewPost({
        title: "",
        description: "",
        category: "",
        tags: "",
        fileType: ""
      });
      setSelectedFile(null);
      setIsDialogOpen(false);


      // Refresh posts
      fetchAllPosts();
      fetchUserPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create post",
        variant: "destructive"
      });
    }
  };


  // Edit post
  const handleEditPost = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('title', editPost.title);
      formData.append('description', editPost.description);
      formData.append('category', editPost.category);
      formData.append('tags', editPost.tags);
      formData.append('fileType', editPost.fileType);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }


      const token = getAuthToken();
      await axios.put(`${API_URL}/posts/${postToEdit._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });


      toast({
        title: "Success",
        description: "Post updated successfully!"
      });


      setSelectedFile(null);
      setIsEditDialogOpen(false);
      setPostToEdit(null);


      // Refresh posts
      fetchAllPosts();
      fetchUserPosts();
    } catch (error) {
      console.error("Error updating post:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update post",
        variant: "destructive"
      });
    }
  };


  // Delete post
  const handleDeletePost = async () => {
    try {
      const token = getAuthToken();
      await axios.delete(`${API_URL}/posts/${postToDelete._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });


      toast({
        title: "Success",
        description: "Post deleted successfully!"
      });


      setDeleteDialogOpen(false);
      setPostToDelete(null);


      // Refresh posts
      fetchAllPosts();
      fetchUserPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete post",
        variant: "destructive"
      });
    }
  };


  // Download post - UPDATED to use new endpoint
  const handleDownload = async (postId, title) => {
    try {
      // Increment download count
      await axios.post(`${API_URL}/posts/${postId}/download`);
      
      // Use the file download route
      window.open(`${API_URL}/posts/${postId}/file`, '_blank');


      toast({
        title: "Success",
        description: "Download started!"
      });


      // Refresh posts to update count
      fetchAllPosts();
      fetchUserPosts();
    } catch (error) {
      console.error("Error downloading:", error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive"
      });
    }
  };


  // View post details
  const handleViewPost = async (post) => {
    try {
      // Increment view count
      await axios.post(`${API_URL}/posts/${post._id}/view`);
      setSelectedPost(post);
      setViewPostDialog(true);
      
      // Refresh posts to update count
      fetchAllPosts();
      fetchUserPosts();
    } catch (error) {
      console.error("Error viewing post:", error);
    }
  };


  // Open edit dialog
  const openEditDialog = (post) => {
    setPostToEdit(post);
    setEditPost({
      title: post.title,
      description: post.description,
      category: post.category,
      tags: post.tags.join(', '),
      fileType: post.fileType
    });
    setIsEditDialogOpen(true);
  };


  // Open delete dialog
  const openDeleteDialog = (post) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };


  // Handle refresh
  const handleRefresh = () => {
    fetchAllPosts();
    fetchUserPosts();
    toast({
      title: "Refreshed",
      description: "Posts have been refreshed"
    });
  };


  const getFileTypeColor = (fileType) => {
    switch (fileType?.toLowerCase()) {
      case "pdf": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "docx":
      case "doc": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "video": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "pptx":
      case "ppt": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };


  // ============================================
  // UPDATED PostCard Component
  // ============================================
  const PostCard = ({ post, showAuthor = true, isUserPost = false }) => {
    const { toast } = useToast();
    const userId = getUserId();
    const token = getAuthToken();

    // NEW: Local state for likes (no page refresh needed)
    const [likes, setLikes] = useState(post.likes || 0);
    const [isLiked, setIsLiked] = useState(post.likedBy?.includes(userId) || false);
    
    // NEW: Local state for share feedback
    const [copied, setCopied] = useState(false);

    // NEW: Handle like/unlike without page refresh
    const handleLikeClick = async () => {
      if (!token) {
        toast({
          title: "Error",
          description: "Please login to like posts",
          variant: "destructive"
        });
        return;
      }

      // Optimistic UI update
      const originalLikes = likes;
      const originalIsLiked = isLiked;

      setLikes(isLiked ? likes - 1 : likes + 1);
      setIsLiked(!isLiked);

      try {
        const response = await axios.post(
          `${API_URL}/posts/${post._id}/like`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        // Sync with server response
        setLikes(response.data.likes);
        setIsLiked(response.data.hasLiked);
      } catch (error) {
        console.error("Error liking post:", error);
        // Revert on error
        setLikes(originalLikes);
        setIsLiked(originalIsLiked);
        toast({
          title: "Error",
          description: "Failed to like post",
          variant: "destructive"
        });
      }
    };

    // NEW: Handle share with copy link
    const handleShareClick = () => {
      // Create URL with query parameter
      const postUrl = `${window.location.origin}${window.location.pathname}?postId=${post._id}`;

      navigator.clipboard.writeText(postUrl).then(() => {
        setCopied(true);
        toast({
          title: "Success",
          description: "Link copied to clipboard!"
        });
        setTimeout(() => setCopied(false), 2000);
      }).catch(err => {
        console.error('Failed to copy link:', err);
        toast({
          title: "Error",
          description: "Could not copy link",
          variant: "destructive"
        });
      });
    };


    return (
      <Card 
        className="glass-card hover-lift border-0 cursor-pointer" 
        onClick={() => handleViewPost(post)}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-xl">{post.title}</h3>
                <p className="text-muted-foreground">
                  {showAuthor ? `by ${post.authorName}` : new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{post.category}</Badge>
              <Badge className={getFileTypeColor(post.fileType)}>
                {post.fileType}
              </Badge>
            </div>
          </div>

          <p className="text-muted-foreground mb-4">{post.description}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags?.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span className="flex items-center">
                <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                {likes}
              </span>
              <span className="flex items-center">
                <Download className="w-4 h-4 mr-1" />
                {post.downloads || 0}
              </span>
              <span className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {post.views || 0}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {isUserPost ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditDialog(post);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteDialog(post);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLikeClick();
                    }}
                  >
                    <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    {isLiked ? 'Unlike' : 'Like'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(post._id, post.title);
                    }}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareClick();
                    }}
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    {copied ? 'Copied!' : 'Share'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };


  return (
    <div className="min-h-screen pt-24 px-4 pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="gradient-text">Resource Posts</span>
            </h1>
            <p className="text-muted-foreground text-lg">Share and discover academic resources</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              className="mr-2"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-hero">
                  <Plus className="w-4 h-4 mr-2" />
                  Share Resource
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-0 max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Share a Resource</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreatePost} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Give your resource a descriptive title"
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what this resource contains and who it might help..."
                      value={newPost.description}
                      onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select 
                        value={newPost.category} 
                        onValueChange={(value) => setNewPost({ ...newPost, category: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Programming">Programming</SelectItem>
                          <SelectItem value="Mathematics">Mathematics</SelectItem>
                          <SelectItem value="Physics">Physics</SelectItem>
                          <SelectItem value="Chemistry">Chemistry</SelectItem>
                          <SelectItem value="Biology">Biology</SelectItem>
                          <SelectItem value="Psychology">Psychology</SelectItem>
                          <SelectItem value="Business">Business</SelectItem>
                          <SelectItem value="Engineering">Engineering</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fileType">File Type</Label>
                      <Select 
                        value={newPost.fileType} 
                        onValueChange={(value) => setNewPost({ ...newPost, fileType: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="File type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PDF">PDF</SelectItem>
                          <SelectItem value="DOC">Word Document</SelectItem>
                          <SelectItem value="PPT">PowerPoint</SelectItem>
                          <SelectItem value="VIDEO">Video</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      placeholder="e.g., algorithms, study-guide, midterm"
                      value={newPost.tags}
                      onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file">Upload File</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      {selectedFile ? (
                        <p className="text-sm mb-2">Selected: {selectedFile.name}</p>
                      ) : (
                        <p className="text-muted-foreground mb-2">Drag and drop your file here, or</p>
                      )}
                      <Input
                        id="file"
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Button 
                        variant="outline" 
                        type="button"
                        onClick={() => document.getElementById('file').click()}
                      >
                        Choose File
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="btn-hero w-full">
                    Share Resource
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search posts..."
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
              <SelectItem value="Programming">Programming</SelectItem>
              <SelectItem value="Mathematics">Mathematics</SelectItem>
              <SelectItem value="Physics">Physics</SelectItem>
              <SelectItem value="Psychology">Psychology</SelectItem>
              <SelectItem value="Engineering">Engineering</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2 glass-card border-0">
            <TabsTrigger value="all">All Posts</TabsTrigger>
            <TabsTrigger value="mine">My Posts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-6 mt-8">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : allPosts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No posts found
              </div>
            ) : (
              allPosts.map((post) => (
                <PostCard key={post._id} post={post} showAuthor={true} />
              ))
            )}
          </TabsContent>
          
          <TabsContent value="mine" className="space-y-6 mt-8">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : userPosts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                You haven't created any posts yet. Click "Share Resource" to create your first post!
              </div>
            ) : (
              userPosts.map((post) => (
                <PostCard key={post._id} post={post} showAuthor={false} isUserPost={true} />
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Post Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="glass-card border-0 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Resource</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditPost} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  placeholder="Give your resource a descriptive title"
                  value={editPost.title}
                  onChange={(e) => setEditPost({ ...editPost, title: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Describe what this resource contains and who it might help..."
                  value={editPost.description}
                  onChange={(e) => setEditPost({ ...editPost, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select 
                    value={editPost.category} 
                    onValueChange={(value) => setEditPost({ ...editPost, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Programming">Programming</SelectItem>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Chemistry">Chemistry</SelectItem>
                      <SelectItem value="Biology">Biology</SelectItem>
                      <SelectItem value="Psychology">Psychology</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-fileType">File Type</Label>
                  <Select 
                    value={editPost.fileType} 
                    onValueChange={(value) => setEditPost({ ...editPost, fileType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="File type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PDF">PDF</SelectItem>
                      <SelectItem value="DOC">Word Document</SelectItem>
                      <SelectItem value="PPT">PowerPoint</SelectItem>
                      <SelectItem value="VIDEO">Video</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
                <Input
                  id="edit-tags"
                  placeholder="e.g., algorithms, study-guide, midterm"
                  value={editPost.tags}
                  onChange={(e) => setEditPost({ ...editPost, tags: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-file">Upload New File (Optional)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  {selectedFile ? (
                    <p className="text-sm mb-2">Selected: {selectedFile.name}</p>
                  ) : (
                    <p className="text-muted-foreground mb-2">Leave empty to keep existing file</p>
                  )}
                  <Input
                    id="edit-file"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    type="button"
                    onClick={() => document.getElementById('edit-file').click()}
                  >
                    Choose File
                  </Button>
                </div>
              </div>

              <Button type="submit" className="btn-hero w-full">
                Update Resource
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="glass-card border-0">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your post
                "{postToDelete?.title}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeletePost}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* View Post Dialog */}
        <Dialog open={viewPostDialog} onOpenChange={setViewPostDialog}>
          <DialogContent className="glass-card border-0 max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedPost?.title}</DialogTitle>
            </DialogHeader>
            {selectedPost && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{selectedPost.category}</Badge>
                  <Badge className={getFileTypeColor(selectedPost.fileType)}>
                    {selectedPost.fileType}
                  </Badge>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedPost.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Author</h4>
                  <p className="text-muted-foreground">{selectedPost.authorName}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPost.tags?.map((tag, index) => (
                      <Badge key={index} variant="outline">#{tag}</Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Heart className="w-4 h-4 mr-1" />
                    {selectedPost.likes || 0} Likes
                  </span>
                  <span className="flex items-center">
                    <Download className="w-4 h-4 mr-1" />
                    {selectedPost.downloads || 0} Downloads
                  </span>
                  <span className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {selectedPost.views || 0} Views
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="flex-1"
                    onClick={() => handleDownload(selectedPost._id, selectedPost.title)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const token = getAuthToken();
                      if (!token) {
                        toast({
                          title: "Error",
                          description: "Please login to like posts",
                          variant: "destructive"
                        });
                        return;
                      }
                      axios.post(`${API_URL}/posts/${selectedPost._id}/like`, {}, {
                        headers: { 'Authorization': `Bearer ${token}` }
                      }).then(() => {
                        toast({ title: "Success", description: "Post liked!" });
                        fetchAllPosts();
                        fetchUserPosts();
                      }).catch(() => {
                        toast({ title: "Error", description: "Failed to like post", variant: "destructive" });
                      });
                    }}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Like
                  </Button>
                  {/* ============================================ */}
                  {/* STEP 3: UPDATED Share button in dialog */}
                  {/* ============================================ */}
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const postUrl = `${window.location.origin}${window.location.pathname}?postId=${selectedPost._id}`;
                      navigator.clipboard.writeText(postUrl).then(() => {
                        toast({ title: "Success", description: "Link copied to clipboard!" });
                      }).catch(() => {
                        toast({ title: "Error", description: "Could not copy link", variant: "destructive" });
                      });
                    }}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};


export default Posts;

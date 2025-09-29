import { useState } from "react";
import { Plus, Heart, Download, Search, Filter, BookOpen, Upload, Eye, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Posts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [newPost, setNewPost] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
    fileType: ""
  });

  // Mock posts data
  const userPosts = [
    {
      id: 1,
      title: "Data Structures Cheat Sheet",
      description: "Complete guide with examples, time complexities, and implementation details for all major data structures.",
      category: "Programming",
      tags: ["algorithms", "coding", "computer-science"],
      likes: 24,
      downloads: 156,
      views: 340,
      timeAgo: "3 days ago",
      fileType: "PDF"
    },
    {
      id: 2,
      title: "Physics Lab Report Template",
      description: "Professional template for physics lab reports with proper formatting and structure.",
      category: "Physics",
      tags: ["lab-report", "template", "physics"],
      likes: 18,
      downloads: 89,
      views: 210,
      timeAgo: "1 week ago",
      fileType: "DOCX"
    },
    {
      id: 3,
      title: "Calculus Study Guide",
      description: "Comprehensive study guide covering derivatives, integrals, and applications.",
      category: "Mathematics",
      tags: ["calculus", "math", "study-guide"],
      likes: 31,
      downloads: 203,
      views: 450,
      timeAgo: "2 weeks ago",
      fileType: "PDF"
    }
  ];

  const allPosts = [
    {
      id: 4,
      title: "Complete React.js Tutorial Series",
      author: "Aayush Hardas",
      description: "Step-by-step guide to building modern web applications with React, including hooks and context.",
      category: "Programming",
      tags: ["react", "javascript", "web-development"],
      likes: 145,
      downloads: 567,
      views: 1240,
      timeAgo: "1 day ago",
      fileType: "Video"
    },
    {
      id: 5,
      title: "Linear Algebra Study Guide",
      author: "Aditya Sontakke",
      description: "Essential concepts in linear algebra with solved examples and practice problems.",
      category: "Mathematics",
      tags: ["linear-algebra", "matrices", "vectors"],
      likes: 98,
      downloads: 234,
      views: 890,
      timeAgo: "2 days ago",
      fileType: "PDF"
    },
    {
      id: 6,
      title: "Psychology Research Methods Notes",
      author: "Anirudh Navuduri",
      description: "Comprehensive notes on research methodologies in psychology, including statistical analysis.",
      category: "Psychology",
      tags: ["research", "statistics", "psychology"],
      likes: 76,
      downloads: 167,
      views: 560,
      timeAgo: "4 days ago",
      fileType: "PDF"
    }
  ];

  const filteredUserPosts = userPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterCategory === "all" || post.category.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const filteredAllPosts = allPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterCategory === "all" || post.category.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const handleCreatePost = (e) => {
    e.preventDefault();
    console.log("Creating post:", newPost);
    // Reset form
    setNewPost({
      title: "",
      description: "",
      category: "",
      tags: "",
      fileType: ""
    });
  };

  const getFileTypeColor = (fileType) => {
    switch (fileType.toLowerCase()) {
      case "pdf": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "docx": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "video": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "pptx": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2"><span className="gradient-text">Resource Posts</span></h1>
            <p className="text-muted-foreground text-lg">Share and discover academic resources</p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="btn-hero">
                <Plus className="w-4 h-4 mr-2" />
                Share Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-0">
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
                    <Select value={newPost.category} onValueChange={(value) => setNewPost({ ...newPost, category: value })}>
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
                    <Select value={newPost.fileType} onValueChange={(value) => setNewPost({ ...newPost, fileType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="File type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PDF">PDF</SelectItem>
                        <SelectItem value="DOCX">Word Document</SelectItem>
                        <SelectItem value="PPTX">PowerPoint</SelectItem>
                        <SelectItem value="Video">Video</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
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
                    <p className="text-muted-foreground mb-2">Drag and drop your file here, or</p>
                    <Button variant="outline" type="button">
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
              <SelectItem value="programming">Programming</SelectItem>
              <SelectItem value="mathematics">Mathematics</SelectItem>
              <SelectItem value="physics">Physics</SelectItem>
              <SelectItem value="psychology">Psychology</SelectItem>
              <SelectItem value="other">Other</SelectItem>
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
            {filteredAllPosts.map((post) => (
              <Card key={post.id} className="glass-card hover-lift border-0">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/20 rounded-lg">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-xl">{post.title}</h3>
                        <p className="text-muted-foreground">by {post.author}</p>
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
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Heart className="w-4 h-4 mr-1" />
                        {post.likes}
                      </span>
                      <span className="flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        {post.downloads}
                      </span>
                      <span className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {post.views}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Heart className="w-4 h-4 mr-1" />
                        Like
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="mine" className="space-y-6 mt-8">
            {filteredUserPosts.map((post) => (
              <Card key={post.id} className="glass-card hover-lift border-0">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/20 rounded-lg">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-xl">{post.title}</h3>
                        <p className="text-muted-foreground">{post.timeAgo}</p>
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
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Heart className="w-4 h-4 mr-1" />
                        {post.likes}
                      </span>
                      <span className="flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        {post.downloads}
                      </span>
                      <span className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {post.views}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Posts;

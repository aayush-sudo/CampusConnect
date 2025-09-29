import { useState } from "react";
import { Plus, Send, Search, MoreVertical, Phone, Video, Smile, Paperclip, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState(1);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [newChatData, setNewChatData] = useState({
    participants: "",
    title: "",
    description: ""
  });

  // Mock chat data
  const chats = [
    {
      id: 1,
      title: "Machine Learning Study Group",
      participants: ["Aditya Sontakke", "Aayush Hardas", "Anirudh Navdhuri"],
      lastMessage: "Let's meet tomorrow at 3 PM",
      timestamp: "2 min ago",
      unread: 2,
      type: "group"
    },
    {
      id: 2,
      title: "React Project Team",
      participants: ["Aditya Sontakke", "Aayush Hardas", "Anirudh Navdhuri"],
      lastMessage: "I've pushed the latest changes to GitHub",
      timestamp: "1 hour ago",
      unread: 0,
      type: "group"
    },
    {
      id: 3,
      title: "Aditya",
      participants: ["Aditya"],
      lastMessage: "Thanks for helping with the algorithms!",
      timestamp: "3 hours ago",
      unread: 1,
      type: "direct"
    },
    {
      id: 4,
      title: "Calculus Help",
      participants: ["Aayush", "Anirudh"],
      lastMessage: "The derivative of that function would be...",
      timestamp: "1 day ago",
      unread: 0,
      type: "group"
    }
  ];

  const messages = [
    {
      id: 1,
      sender: "Anirudh Navdhuri",
      content: "Hey everyone! Are we still meeting tomorrow to go over the ML assignment?",
      timestamp: "10:30 AM",
      isCurrentUser: false,
      avatar: "/placeholder.svg"
    },
    {
      id: 2,
      sender: "You",
      content: "Yes! I'll be there. I've prepared some notes on neural networks.",
      timestamp: "10:32 AM",
      isCurrentUser: true,
      avatar: "/placeholder.svg"
    },
    {
      id: 3,
      sender: "Aayush Hardas",
      content: "Perfect! I'm working on the data preprocessing part. Should we divide the topics?",
      timestamp: "10:35 AM",
      isCurrentUser: false,
      avatar: "/placeholder.svg"
    },
    {
      id: 4,
      sender: "Aayush Hardas",
      content: "Great idea! I can cover the evaluation metrics section.",
      timestamp: "10:38 AM",
      isCurrentUser: false,
      avatar: "/placeholder.svg"
    },
    {
      id: 5,
      sender: "You",
      content: "Sounds like a plan! Let's meet at the library study room 204.",
      timestamp: "10:40 AM",
      isCurrentUser: true,
      avatar: "/placeholder.svg"
    }
  ];

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.participants.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const currentChat = chats.find(chat => chat.id === selectedChat);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      console.log("Sending message:", newMessage);
      setNewMessage("");
    }
  };

  const handleCreateChat = (e) => {
    e.preventDefault();
    console.log("Creating chat:", newChatData);
    setNewChatData({ participants: "", title: "", description: "" });
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex h-[calc(100vh-12rem)] glass-card border-0 rounded-xl overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 border-r border-border/50 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-black">Messages</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="btn-hero">
                      <Plus className="w-4 h-4 mr-2" />
                      New Chat
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-card border-0">
                    <DialogHeader>
                      <DialogTitle>Create New Chat</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateChat} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Chat Title</Label>
                        <Input
                          id="title"
                          placeholder="Enter chat title"
                          value={newChatData.title}
                          onChange={(e) => setNewChatData({ ...newChatData, title: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="participants">Participants (comma-separated)</Label>
                        <Input
                          id="participants"
                          placeholder="john.doe@university.edu, jane.smith@university.edu"
                          value={newChatData.participants}
                          onChange={(e) => setNewChatData({ ...newChatData, participants: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                          id="description"
                          placeholder="Brief description of the chat purpose"
                          value={newChatData.description}
                          onChange={(e) => setNewChatData({ ...newChatData, description: e.target.value })}
                          rows={2}
                        />
                      </div>

                      <Button type="submit" className="btn-hero w-full">
                        Create Chat
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
            </div>

            {/* Chat List */}
            <ScrollArea className="flex-1">
              <div className="p-2">
                {filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedChat(chat.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 mb-2 ${
                      selectedChat === chat.id
                        ? "bg-primary/20 border border-primary/30"
                        : "hover:bg-accent/50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        {chat.type === "group" ? (
                          <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                        ) : (
                          <Avatar className="w-10 h-10">
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback>{chat.participants[0]?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                        )}
                        {chat.unread > 0 && (
                          <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-primary text-xs">
                            {chat.unread}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium truncate text-black">{chat.title}</h3>
                          <span className="text-xs text-muted-foreground">{chat.timestamp}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                        <div className="flex items-center mt-1">
                          <Badge variant="outline" className="text-xs">
                            {chat.participants.length} {chat.participants.length === 1 ? 'member' : 'members'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {currentChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border/50 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {currentChat.type === "group" ? (
                      <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <Avatar className="w-10 h-10">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>{currentChat.participants[0]?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <h3 className="font-semibold text-black">{currentChat.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {currentChat.participants.join(", ")}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex items-start space-x-3 ${
                          message.isCurrentUser ? "flex-row-reverse space-x-reverse" : ""
                        }`}
                      >
                        {!message.isCurrentUser && (
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={message.avatar} />
                            <AvatarFallback>{message.sender.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className={`max-w-xs lg:max-w-md ${message.isCurrentUser ? "ml-auto" : ""}`}>
                          {!message.isCurrentUser && (
                            <p className="text-xs font-medium text-muted-foreground mb-1">{message.sender}</p>
                          )}
                          <div
                            className={`rounded-lg p-3 ${
                              message.isCurrentUser
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 text-right">
                            {message.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t border-border/50">
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                    <Button type="button" variant="ghost" size="icon">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="pr-10"
                      />
                      <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 transform -translate-y-1/2">
                        <Smile className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <Button type="submit" className="btn-hero">
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Welcome to CampusConnect Chat</h3>
                  <p className="text-muted-foreground">Select a chat to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

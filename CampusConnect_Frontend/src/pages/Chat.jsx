import { useState, useEffect } from "react";
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
import { useAuth } from "../contexts/AuthContext";
import { chatsAPI } from "../services/api";
import { authAPI } from "../services/api";
import { useToast } from "@/hooks/use-toast";

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newChatData, setNewChatData] = useState({
    participants: "",
    title: "",
    description: ""
  });

  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user's chats on component mount
  useEffect(() => {
    const fetchUserChats = async () => {
      if (user) {
        try {
          setLoading(true);
          const response = await chatsAPI.getUserChats(user._id);
          setChats(response.data);
        } catch (error) {
          console.error('Error fetching chats:', error);
          toast({
            title: "Error",
            description: "Failed to load chats",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserChats();
  }, [user, toast]);

  // Fetch messages when a chat is selected
  useEffect(() => {
    const fetchChatMessages = async () => {
      if (selectedChat) {
        try {
          const response = await chatsAPI.getChatMessages(selectedChat._id);
          setMessages(response.data);
        } catch (error) {
          console.error('Error fetching messages:', error);
          toast({
            title: "Error",
            description: "Failed to load messages",
            variant: "destructive",
          });
        }
      }
    };

    fetchChatMessages();
  }, [selectedChat, toast]);

  // Poll for new messages every 1 second when a chat is selected
  useEffect(() => {
    let intervalId;
    
    if (selectedChat) {
      const pollMessages = async () => {
        try {
          const response = await chatsAPI.getChatMessages(selectedChat._id);
          setMessages(response.data);
        } catch (error) {
          console.error('Error polling messages:', error);
          // Don't show toast for polling errors to avoid spam
        }
      };

      // Set up interval to poll every 1 second
      intervalId = setInterval(pollMessages, 1000);
    }

    // Cleanup interval on unmount or when selectedChat changes
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [selectedChat]);

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.participants.some(p => p.userName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const currentChat = chats.find(chat => chat._id === selectedChat?._id);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() && selectedChat) {
      try {
        const messageData = {
          content: newMessage
        };
        
        await chatsAPI.sendMessage(selectedChat._id, messageData);
        
        // Refresh messages
        const messagesResponse = await chatsAPI.getChatMessages(selectedChat._id);
        setMessages(messagesResponse.data);
        
        setNewMessage("");
      } catch (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error",
          description: error.response?.data?.error || "Failed to send message",
          variant: "destructive",
        });
      }
    }
  };

  const handleCreateChat = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a chat",
        variant: "destructive",
      });
      return;
    }

    try {
      // Parse participant emails
      const participantEmails = newChatData.participants
        .split(',')
        .map(email => email.trim())
        .filter(email => email);

      if (participantEmails.length === 0) {
        toast({
          title: "Error",
          description: "Please enter at least one participant email",
          variant: "destructive",
        });
        return;
      }

      // Look up users by email
      const usersResponse = await authAPI.searchUsersByEmail(participantEmails);
      const foundUsers = usersResponse.data;

      if (foundUsers.length === 0) {
        toast({
          title: "Error",
          description: "No users found with the provided emails",
          variant: "destructive",
        });
        return;
      }

      // Check if any emails were not found
      const foundEmails = foundUsers.map(u => u.email);
      const notFoundEmails = participantEmails.filter(email => !foundEmails.includes(email));
      
      if (notFoundEmails.length > 0) {
        toast({
          title: "Warning",
          description: `Some users not found: ${notFoundEmails.join(', ')}`,
          variant: "destructive",
        });
      }

      // Create the chat with found user IDs
      const chatData = {
        title: newChatData.title,
        description: newChatData.description,
        participantIds: foundUsers.map(u => u._id),
        type: foundUsers.length === 1 ? 'direct' : 'group'
      };

      const response = await chatsAPI.createChat(chatData);
      
      toast({
        title: "Success",
        description: `Chat created with ${foundUsers.length} participant(s)!`,
      });

      // Reset form
      setNewChatData({ participants: "", title: "", description: "" });

      // Refresh chats list
      const updatedResponse = await chatsAPI.getUserChats(user._id);
      setChats(updatedResponse.data);

    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create chat",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex h-[calc(100vh-12rem)] glass-card border-0 rounded-xl overflow-hidden">
          {/* Sidebar */}
          <div className="w-110 border-r border-border/50 flex flex-col">
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
                          placeholder="aayush.hardas@somaiya.edu, aditya.sontakke@somaiya.edu,..."
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
                {loading ? (
                  <div className="flex items-center justify-center p-4">
                    <p className="text-muted-foreground">Loading chats...</p>
                  </div>
                ) : filteredChats.length === 0 ? (
                  <div className="flex items-center justify-center p-4">
                    <p className="text-muted-foreground">No chats found</p>
                  </div>
                ) : (
                  filteredChats.map((chat) => (
                    <div
                      key={chat._id}
                      onClick={() => setSelectedChat(chat)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 mb-2 ${
                        selectedChat?._id === chat._id
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
                              <AvatarFallback>{chat.participants[0]?.userName?.split(' ').map(n => n[0]).join('') || 'U'}</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium truncate text-black">{chat.title}</h3>
                            <span className="text-xs text-muted-foreground">
                              {new Date(chat.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{chat.description || 'No messages yet'}</p>
                          <div className="flex items-center mt-1">
                            <Badge variant="outline" className="text-xs">
                              {chat.participants.length} {chat.participants.length === 1 ? 'member' : 'members'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
                        <AvatarFallback>{currentChat.participants[0]?.userName?.split(' ').map(n => n[0]).join('') || 'U'}</AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <h3 className="font-semibold text-black">{currentChat.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {currentChat.participants.map(p => p.userName).join(", ")}
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
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isCurrentUser = message.sender === user._id;
                        return (
                          <div
                            key={message._id}
                            className={`flex items-start space-x-3 ${
                              isCurrentUser ? "flex-row-reverse space-x-reverse" : ""
                            }`}
                          >
                            {!isCurrentUser && (
                              <Avatar className="w-8 h-8">
                                <AvatarImage src="/placeholder.svg" />
                                <AvatarFallback>{message.senderName?.split(' ').map(n => n[0]).join('') || 'U'}</AvatarFallback>
                              </Avatar>
                            )}
                            
                            <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? "ml-auto" : ""}`}>
                              {!isCurrentUser && (
                                <p className="text-xs font-medium text-muted-foreground mb-1">{message.senderName}</p>
                              )}
                              <div
                                className={`rounded-lg p-3 ${
                                  isCurrentUser
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 text-right">
                                {new Date(message.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
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

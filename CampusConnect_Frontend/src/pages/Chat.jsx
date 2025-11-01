import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
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
import { stringToHslColor } from "@/lib/utils";
import EmojiPicker from 'emoji-picker-react';


const Chat = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [newChatData, setNewChatData] = useState({
    participants: "",
    title: "",
    description: ""
  });

  const emojiPickerRef = useRef(null);
  const location = useLocation();

  const { user } = useAuth();
  const { toast } = useToast();

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch user's chats on component mount
  useEffect(() => {
    const fetchUserChats = async () => {
      if (user) {
        try {
          setLoading(true);
          const response = await chatsAPI.getUserChats(user._id);
          setChats(response.data);
          
          // Check if we have a chatId in location state (from navigation)
          const chatIdFromState = location.state?.chatId;
          if (chatIdFromState) {
            // Find and select the chat with the given ID
            const chatToSelect = response.data.find(chat => chat._id === chatIdFromState);
            if (chatToSelect) {
              setSelectedChat(chatToSelect);
            }
            // Clear the state after using it
            window.history.replaceState({}, document.title);
          }
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
  }, [user, toast, location.state]);

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
        }
      };

      intervalId = setInterval(pollMessages, 1000);
    }

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

  const handleEmojiClick = (emojiObject) => {
    setNewMessage(prevMessage => prevMessage + emojiObject.emoji);
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

      const foundEmails = foundUsers.map(u => u.email);
      const notFoundEmails = participantEmails.filter(email => !foundEmails.includes(email));
      
      if (notFoundEmails.length > 0) {
        toast({
          title: "Warning",
          description: `Some users not found: ${notFoundEmails.join(', ')}`,
          variant: "destructive",
        });
      }

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

      setNewChatData({ participants: "", title: "", description: "" });

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
        <div className="flex h-[calc(100vh-12rem)] glass-card border-0 rounded-xl overflow-hidden shadow-2xl">
          {/* Sidebar with gradient header */}
          <div className="w-110 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Header with Purple-Green Gradient */}
            <div className="p-4 bg-gradient-to-r from-purple-600 via-violet-600 to-emerald-500">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-white">Messages</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-white hover:bg-gray-100 text-purple-600 shadow-md font-semibold">
                      <Plus className="w-4 h-4 mr-2" />
                      New Chat
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-card border-0 shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="gradient-text text-2xl">Create New Chat</DialogTitle>
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
                          className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="participants">Participants (comma-separated)</Label>
                        <Input
                          id="participants"
                          placeholder="email1@example.com, email2@example.com"
                          value={newChatData.participants}
                          onChange={(e) => setNewChatData({ ...newChatData, participants: e.target.value })}
                          required
                          className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
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
                          className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/90 dark:bg-gray-700 border-none rounded-lg backdrop-blur-sm text-black dark:text-white"
                />
              </div>
            </div>

            {/* Chat List */}
            <ScrollArea className="flex-1 bg-white dark:bg-gray-800">
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent"></div>
                  </div>
                ) : filteredChats.length === 0 ? (
                  <div className="flex items-center justify-center p-8">
                    <p className="text-gray-500">No chats found</p>
                  </div>
                ) : (
                  filteredChats.map((chat) => (
                    <div
                      key={chat._id}
                      onClick={() => setSelectedChat(chat)}
                      className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-emerald-50 dark:hover:from-purple-900/20 dark:hover:to-emerald-900/20 ${
                        selectedChat?._id === chat._id
                          ? "bg-gradient-to-r from-purple-100 to-emerald-100 dark:from-purple-900/30 dark:to-emerald-900/30 border-l-4 border-purple-600"
                          : ""
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative flex-shrink-0">
                          {chat.type === "group" ? (
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-violet-500 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
                              <Users className="w-6 h-6 text-white" />
                            </div>
                          ) : (
                            <Avatar className="w-12 h-12 ring-2 ring-purple-200 dark:ring-purple-600">
                              {chat.participants[0]?.avatar && (
                                <AvatarImage src={chat.participants[0].avatar} />
                              )}
                              <AvatarFallback
                                className="text-white font-semibold"
                                style={{
                                  backgroundColor: stringToHslColor(
                                    chat.participants[0]?.userName || chat.participants[0]?._id || "user"
                                  ),
                                }}
                              >
                                {chat.participants[0]?.userName?.split(' ').map(n => n[0]).join('') || 'U'}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{chat.title}</h3>
                            <span className="text-xs text-gray-500 ml-2">
                              {new Date(chat.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {chat.description || 'Start a conversation'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
            {currentChat ? (
              <>
                {/* Chat Header with Gradient */}
                <div className="p-4 bg-gradient-to-r from-purple-600 via-violet-600 to-emerald-500 flex items-center justify-between shadow-lg">
                  <div className="flex items-center space-x-3">
                    {currentChat.type === "group" ? (
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                        <Users className="w-5 h-5 text-purple-600" />
                      </div>
                    ) : (
                      <Avatar className="w-10 h-10 ring-2 ring-white">
                        {currentChat.participants[0]?.avatar && (
                          <AvatarImage src={currentChat.participants[0].avatar} />
                        )}
                        <AvatarFallback
                          className="text-white font-semibold"
                          style={{
                            backgroundColor: stringToHslColor(
                              currentChat.participants[0]?.userName || currentChat.participants[0]?._id || "user"
                            ),
                          }}
                        >
                          {currentChat.participants[0]?.userName?.split(' ').map(n => n[0]).join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <h3 className="font-semibold text-white">{currentChat.title}</h3>
                      <p className="text-xs text-white/90">
                        {currentChat.participants.map(p => p.userName).join(", ")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <ScrollArea 
                  className="flex-1 p-4" 
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e9d5ff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                  }}
                >
                  <div className="space-y-3">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center glass-card p-8 shadow-lg">
                          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-emerald-400 rounded-full flex items-center justify-center">
                            <Users className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 font-medium">No messages yet</p>
                          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Start the conversation!</p>
                        </div>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isCurrentUser = message.sender === user._id;
                        const avatarSrc = isCurrentUser ? user?.avatar : message.senderAvatar;
                        const avatarName = isCurrentUser ? (user?.userName || user?.name || user?.email) : message.senderName;

                        return (
                          <div
                            key={message._id}
                            className={`flex items-end space-x-2 ${isCurrentUser ? "flex-row-reverse space-x-reverse" : ""}`}
                          >
                            <Avatar className="w-8 h-8 mb-1 ring-2 ring-gray-200 dark:ring-gray-700">
                              {avatarSrc && <AvatarImage src={avatarSrc} />}
                              <AvatarFallback
                                className="text-white text-xs font-semibold"
                                style={{ backgroundColor: stringToHslColor(avatarName || message.sender || "user") }}
                              >
                                {avatarName?.split(' ').map(n => n[0]).join('') || 'U'}
                              </AvatarFallback>
                            </Avatar>

                            <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? "ml-auto" : ""}`}>
                              <div
                                className={`rounded-2xl px-4 py-2 shadow-md ${
                                  isCurrentUser
                                    ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-br-none"
                                    : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none border border-gray-200 dark:border-gray-700"
                                }`}
                              >
                                {!isCurrentUser && (
                                  <p className="text-xs font-semibold gradient-text-green mb-1">{message.senderName}</p>
                                )}
                                <p className="text-sm leading-relaxed">{message.content}</p>
                                <p className={`text-xs mt-1 ${isCurrentUser ? 'text-purple-100' : 'text-gray-500 dark:text-gray-400'}`}>
                                  {new Date(message.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                    {/* Emoji Picker Button */}
                    <div className="relative" ref={emojiPickerRef}>
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 rounded-full transition-all bg-transparent hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-violet-500/10"
                      >
                        <Smile className="w-5 h-5" />
                      </button>
                      
                      {/* Emoji Picker Popup */}
                      {showEmojiPicker && (
                        <div className="absolute bottom-14 left-0 z-50 shadow-2xl rounded-lg">
                          <EmojiPicker 
                            onEmojiClick={handleEmojiClick}
                            theme="auto"
                            width={350}
                            height={450}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <Input
                        placeholder="Type a message"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-full px-6 focus:ring-2 focus:ring-purple-500 text-black dark:text-white"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      size="icon"
                      className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-full h-11 w-11 shadow-lg hover:shadow-xl transition-all"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-purple-50 via-violet-50 to-emerald-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-900">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-purple-500 via-violet-500 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl">
                    <Users className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold gradient-text mb-2">
                    CampusConnect Chat
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Select a chat to start messaging
                  </p>
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

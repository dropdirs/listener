import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Settings, MessageSquare } from "lucide-react";

interface Conversation {
  id: string;
  contact_name: string;
  last_message: string;
  timestamp: string;
  unread_count: number;
  avatar_url?: string;
}

interface ConversationListProps {
  onSelectConversation?: (conversationId: string) => void;
  selectedConversationId?: string;
}

const ConversationList = ({
  onSelectConversation = () => {},
  selectedConversationId = "",
}: ConversationListProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      contact_name: "John Doe",
      last_message: "Hey, how are you doing?",
      timestamp: "2023-06-15T14:30:00Z",
      unread_count: 3,
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
    },
    {
      id: "2",
      contact_name: "Jane Smith",
      last_message: "Can we meet tomorrow?",
      timestamp: "2023-06-15T10:15:00Z",
      unread_count: 0,
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
    },
    {
      id: "3",
      contact_name: "Team Project",
      last_message: "Meeting at 3pm",
      timestamp: "2023-06-14T18:45:00Z",
      unread_count: 5,
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=team",
    },
    {
      id: "4",
      contact_name: "Alex Johnson",
      last_message: "I sent you the files",
      timestamp: "2023-06-14T09:20:00Z",
      unread_count: 0,
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    },
    {
      id: "5",
      contact_name: "Sarah Williams",
      last_message: "Thanks for your help!",
      timestamp: "2023-06-13T16:50:00Z",
      unread_count: 0,
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Supabase client
  const supabaseUrl = "https://xybpqwvxdsozmyqbcrfz.supabase.co";
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5YnBxd3Z4ZHNvem15cWJjcmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5NzQyNzMsImV4cCI6MjA2MTU1MDI3M30.-JZ2ejXJxS3oDH9vKkJKjzceFo4SdBvOyexbnc43KTQ";
  const supabase = createClient(supabaseUrl, supabaseKey);

  useEffect(() => {
    // This would be replaced with actual Supabase subscription
    // For now, we're using the mock data initialized in state
    const fetchConversations = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, this would fetch from Supabase
        // const { data, error } = await supabase
        //   .from('conversations')
        //   .select('*')
        //   .order('timestamp', { ascending: false });

        // if (error) throw error;
        // if (data) setConversations(data);

        // Using mock data for now
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching conversations:", error);
        setIsLoading(false);
      }
    };

    fetchConversations();

    // Set up real-time subscription
    // This would be implemented with Supabase's real-time features
    // const subscription = supabase
    //   .channel('conversations')
    //   .on('INSERT', payload => {
    //     setConversations(prev => [payload.new, ...prev]);
    //   })
    //   .on('UPDATE', payload => {
    //     setConversations(prev =>
    //       prev.map(conv => conv.id === payload.new.id ? payload.new : conv)
    //     );
    //   })
    //   .subscribe();

    // return () => {
    //   subscription.unsubscribe();
    // };
  }, []);

  const filteredConversations = conversations.filter((conversation) =>
    conversation.contact_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) {
      // Today: show time
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      // Yesterday
      return "Yesterday";
    } else if (diffDays < 7) {
      // This week: show day name
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      // Older: show date
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const truncateMessage = (message: string, maxLength: number = 30) => {
    return message.length > maxLength
      ? `${message.substring(0, maxLength)}...`
      : message;
  };

  return (
    <div className="flex flex-col h-full border-r bg-background">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Avatar>
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-semibold">Chats</h2>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations"
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <p>Loading conversations...</p>
          </div>
        ) : filteredConversations.length > 0 ? (
          <div className="space-y-1">
            {filteredConversations.map((conversation) => (
              <div key={conversation.id}>
                <button
                  className={`w-full text-left px-4 py-3 hover:bg-accent/50 transition-colors ${selectedConversationId === conversation.id ? "bg-accent" : ""}`}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={conversation.avatar_url} />
                      <AvatarFallback>
                        {conversation.contact_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium truncate">
                          {conversation.contact_name}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(conversation.timestamp)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-sm text-muted-foreground truncate">
                          {truncateMessage(conversation.last_message)}
                        </p>
                        {conversation.unread_count > 0 && (
                          <Badge
                            variant="default"
                            className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                          >
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
                <Separator />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-center p-4">
            <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No conversations found</p>
            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-1">
                Try a different search term
              </p>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ConversationList;

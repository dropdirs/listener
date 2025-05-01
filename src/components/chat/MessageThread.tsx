import React, { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Terminal, Radio, Cpu, AlertTriangle, Wifi } from "lucide-react";
import AvatarDisplay from "./AvatarDisplay";

interface Message {
  id: string;
  content?: string;
  text?: string;
  sender_id?: string;
  senderId?: string;
  conversation_id?: string;
  created_at?: string;
  timestamp?: string;
  read?: boolean;
  status?: "sent" | "delivered" | "read";
  username?: string; // Added username field
  name?: string; // Added name field
  link?: string; // Added link field
}

interface User {
  id: string;
  username: string;
  avatar_url?: string;
}

interface MessageThreadProps {
  conversationId?: string;
  currentUserId?: string;
  recipientUser?: User;
  messages?: Message[];
  onSendMessage?: (text: string) => void;
  conversation?: any;
}

// Color palette for different usernames - retro robotic theme with gradients
const userGradients = [
  "linear-gradient(to right, #00FF00, #00FFAA)", // Green to Teal
  "linear-gradient(to right, #00FFFF, #0088FF)", // Cyan to Blue
  "linear-gradient(to right, #FF00FF, #FF0088)", // Magenta to Pink
  "linear-gradient(to right, #FFFF00, #FFAA00)", // Yellow to Orange
  "linear-gradient(to right, #FF0000, #FF8800)", // Red to Orange
  "linear-gradient(to right, #0000FF, #8800FF)", // Blue to Purple
  "linear-gradient(to right, #FF8000, #FFAA00)", // Orange to Amber
  "linear-gradient(to right, #00FF80, #00FFFF)", // Mint to Cyan
  "linear-gradient(to right, #8000FF, #FF00FF)", // Purple to Magenta
  "linear-gradient(to right, #FF0080, #FF00FF)", // Pink to Magenta
];

// Fallback solid colors for cases where gradients can't be applied
const userColors = [
  "#00FF00", // Bright Green
  "#00FFFF", // Cyan
  "#FF00FF", // Magenta
  "#FFFF00", // Yellow
  "#FF0000", // Red
  "#0000FF", // Blue
  "#FF8000", // Orange
  "#00FF80", // Mint
  "#8000FF", // Purple
  "#FF0080", // Pink
];

// Background colors for message bubbles based on username
const userBubbleColors = [
  "rgba(0, 255, 0, 0.15)", // Green tint
  "rgba(0, 255, 255, 0.15)", // Cyan tint
  "rgba(255, 0, 255, 0.15)", // Magenta tint
  "rgba(255, 255, 0, 0.15)", // Yellow tint
  "rgba(255, 0, 0, 0.15)", // Red tint
  "rgba(0, 0, 255, 0.15)", // Blue tint
  "rgba(255, 128, 0, 0.15)", // Orange tint
  "rgba(0, 255, 128, 0.15)", // Mint tint
  "rgba(128, 0, 255, 0.15)", // Purple tint
  "rgba(255, 0, 128, 0.15)", // Pink tint
];

// Function to get a consistent color and gradient for a username
const getUserStyles = (username: string) => {
  // Simple hash function to get a consistent index for a username
  const hash = username.split("").reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);

  const index = hash % userColors.length;
  return {
    color: userColors[index],
    gradient: userGradients[index],
    bubbleColor: userBubbleColors[index],
  };
};

const MessageThread: React.FC<MessageThreadProps> = ({
  conversationId = "1",
  currentUserId = "user-1",
  recipientUser = {
    id: "channel-1",
    username: "ROBOTIC NEWS",
    avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=robot1",
  },
  messages = [],
  onSendMessage = () => {},
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getMessageContent = (message: Message) => {
    return message.content || message.text || "";
  };

  // Function to detect and format links in message content
  const formatMessageWithLinks = (text: string) => {
    if (!text) return "";

    // Regex to match URLs (http, https, ftp) and www. links
    const urlRegex =
      /(https?:\/\/|www\.)[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;

    // Replace URLs with anchor tags
    return text.replace(urlRegex, (url) => {
      // Add https:// prefix if the URL starts with www.
      const href = url.startsWith("www.") ? `https://${url}` : url;
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-retro-glow underline hover:text-retro-accent">${url}</a>`;
    });
  };

  const getSenderId = (message: Message) => {
    return message.sender_id || message.senderId || "";
  };

  const getUsername = (message: Message) => {
    return (
      message.name ||
      message.username ||
      (getSenderId(message) === currentUserId ? "You" : recipientUser.username)
    );
  };

  const getTimestamp = (message: Message) => {
    return formatTime(message.created_at || message.timestamp);
  };

  const getMessageStatus = (message: Message) => {
    if (message.read) return "read";
    if (message.status) return message.status;
    return "sent";
  };

  // Track previous username to determine when to show username and create zigzag layout
  const renderMessages = () => {
    let prevUsername: string | null = null;
    let prevSide: "left" | "right" | null = null;

    return messages.map((message, index) => {
      const senderId = getSenderId(message);
      const username = getUsername(message);
      const isCurrentUser = senderId === currentUserId;
      const showUsername = username !== prevUsername;
      const userStyles = getUserStyles(username);
      const messageStatus = getMessageStatus(message);

      // Determine which side to show the message on (zigzag pattern)
      let side: "left" | "right";

      if (showUsername) {
        // If username changed, switch sides
        side = prevSide === "left" ? "right" : "left";
      } else {
        // If same username, keep on same side
        side = prevSide || "left";
      }

      // Update previous values for next iteration
      prevUsername = username;
      prevSide = side;

      return (
        <div
          key={message.id}
          className="flex justify-center mb-2 sm:mb-3 w-full px-2 sm:px-4"
        >
          <div className="flex flex-col w-full max-w-full overflow-hidden">
            <Card
              className={`p-1 sm:p-3 border ${side === "right" ? "border-retro-glow" : "border-retro-border"} ${
                side === "right" ? "text-retro-glow" : "text-retro-text"
              }`}
              style={{
                backgroundColor: userStyles.bubbleColor,
                backgroundImage:
                  side === "right"
                    ? "linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.3))"
                    : "linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.2))",
              }}
            >
              <div className="flex flex-col">
                <div className="flex items-center mb-1 gap-1 sm:gap-2">
                  <AvatarDisplay
                    username={username}
                    isCurrentUser={isCurrentUser}
                    userColor={userStyles.color}
                    size="sm"
                  />
                  <div className="flex flex-1 justify-between items-center gap-1 sm:gap-2">
                    <a
                      href="#"
                      className="text-[10px] sm:text-xs font-bold tracking-wider px-1 sm:px-2 py-0.5 rounded"
                      style={{
                        fontFamily: "'Press Start 2P', 'VT323', monospace",
                        textShadow: "0 0 2px rgba(255,255,255,0.3)",
                        color: userStyles.color,
                        filter: "brightness(1.5)",
                      }}
                    >
                      {username}
                    </a>
                    <span className="text-[8px] sm:text-xs opacity-70 font-mono bg-black bg-opacity-30 px-1 sm:px-2 py-0.5 rounded whitespace-nowrap">
                      {getTimestamp(message)}
                    </span>
                  </div>
                </div>
                <div
                  className="border-t border-dashed border-opacity-30 my-1"
                  style={{ borderColor: userStyles.color }}
                ></div>
                <div
                  className="font-mono text-white break-words text-xs sm:text-base w-full overflow-hidden"
                  style={{
                    textShadow: "0 0 1px rgba(0,0,0,0.5)",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: formatMessageWithLinks(getMessageContent(message)),
                  }}
                ></div>
              </div>
              <div className="flex items-center justify-end gap-1 mt-2 text-xs">
                {isCurrentUser ? (
                  <div className="flex items-center gap-1">
                    <span className="text-retro-accent">
                      {messageStatus === "read" ? "[RECEIVED]" : "[SENT]"}
                    </span>
                    {messageStatus === "read" ? (
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="text-retro-accent">
                      {message.read ? (
                        "[READ]"
                      ) : (
                        <a
                          href={message.link || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center gap-1"
                          title={message.link}
                        >
                          <Terminal className="h-3 w-3" />
                        </a>
                      )}
                    </span>
                    {message.read && (
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      );
    });
  };

  // Get current time in WIB (UTC+7)
  const getCurrentTimeWIB = () => {
    const now = new Date();
    return now.toLocaleTimeString("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const [currentTimeWIB, setCurrentTimeWIB] = useState(getCurrentTimeWIB());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeWIB(getCurrentTimeWIB());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full bg-retro-terminal border-2 border-retro-border mx-2 sm:mx-4 my-2">
      {/* Header */}
      <div className="flex items-center justify-between p-2 sm:p-3 bg-retro-header text-retro-text border-b-2 border-retro-border">
        <div className="flex items-center gap-2 sm:gap-3">
          <AvatarDisplay
            username={recipientUser.username}
            isCurrentUser={false}
            userColor="var(--retro-robot)"
            size="md"
          />
          <div>
            <h2 className="font-retro tracking-wider text-sm sm:text-base">
              {recipientUser.username}
            </h2>
            <div className="flex items-center text-[10px] sm:text-xs text-retro-glow">
              <Wifi className="h-2 w-2 sm:h-3 sm:w-3 mr-1 animate-pulse" />
              <span>Airdrop Channel Listener</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-xs font-mono text-retro-glow mb-1">
            {currentTimeWIB} WIB
          </div>
          <div className="flex space-x-2">
            <Terminal className="h-4 w-4 sm:h-5 sm:w-5 text-retro-glow" />
            <Radio className="h-4 w-4 sm:h-5 sm:w-5 text-retro-glow animate-pulse" />
            <Cpu className="h-4 w-4 sm:h-5 sm:w-5 text-retro-glow" />
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 sm:p-6 bg-retro-bg">
        <div className="space-y-2">
          <div className="text-center mb-4">
            <div className="inline-block px-3 py-1 bg-retro-terminal border border-retro-border rounded-md">
              <span className="text-xs font-retro text-retro-glow">
                Airdrop Channel Listener
              </span>
            </div>
          </div>
          {renderMessages()}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Read-only mode notice */}
      <div className="p-2 sm:p-3 border-t-2 border-retro-border bg-retro-terminal">
        <div className="flex items-center justify-center">
          <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-retro-accent mr-1 sm:mr-2 animate-pulse" />
          <p className="text-retro-text font-retro text-xs sm:text-sm tracking-wider">
            READ-ONLY TERMINAL - MONITORING ACTIVE
          </p>
        </div>
      </div>
    </div>
  );
};

export default MessageThread;

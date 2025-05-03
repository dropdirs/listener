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
  isRead?: boolean; // Client-side read status
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

// Color palette for different usernames - white, red, yellow, green gradient theme
const userGradients = [
  "linear-gradient(to right, #FFFFFF, #FF0000, #FFFF00, #00FF00)", // White, Red, Yellow, Green
  "linear-gradient(to right, #F0F0F0, #FF3333, #FFFF33, #33FF33)", // Slight variations
  "linear-gradient(to right, #E0E0E0, #FF6666, #FFFF66, #66FF66)", // More variations
  "linear-gradient(to right, #D0D0D0, #FF9999, #FFFF99, #99FF99)", // Even more variations
  "linear-gradient(to right, #FFFFFF, #FF0000, #FFFF00, #00FF00)", // Repeat base gradient
  "linear-gradient(to right, #F0F0F0, #FF3333, #FFFF33, #33FF33)", // Repeat variations
  "linear-gradient(to right, #E0E0E0, #FF6666, #FFFF66, #66FF66)", // Repeat more variations
  "linear-gradient(to right, #D0D0D0, #FF9999, #FFFF99, #99FF99)", // Repeat even more variations
  "linear-gradient(to right, #FFFFFF, #FF0000, #FFFF00, #00FF00)", // Repeat base gradient again
  "linear-gradient(to right, #F0F0F0, #FF3333, #FFFF33, #33FF33)", // Repeat variations again
];

// Fallback solid colors for cases where gradients can't be applied - white, red, yellow, green theme
const userColors = [
  "#00FF00", // Green (end of gradient)
  "#33FF33", // Light Green
  "#FFFF00", // Yellow
  "#FFFF33", // Light Yellow
  "#FF0000", // Red
  "#FF3333", // Light Red
  "#FFFFFF", // White
  "#F0F0F0", // Light White
  "#E0E0E0", // Lighter White
  "#D0D0D0", // Even Lighter White
];

// Background colors for message bubbles based on username - aligned with retro theme
const userBubbleColors = [
  "rgba(0, 255, 0, 0.2)", // Green tint - more vibrant
  "rgba(51, 255, 51, 0.2)", // Light Green tint - more vibrant
  "rgba(255, 255, 0, 0.2)", // Yellow tint - more vibrant
  "rgba(255, 255, 51, 0.2)", // Light Yellow tint - more vibrant
  "rgba(255, 0, 0, 0.2)", // Red tint - more vibrant
  "rgba(255, 51, 51, 0.2)", // Light Red tint - more vibrant
  "rgba(128, 0, 128, 0.2)", // Purple tint - added for theme
  "rgba(160, 32, 240, 0.2)", // Purple tint variant - added for theme
  "rgba(75, 0, 130, 0.2)", // Indigo tint - added for theme
  "rgba(138, 43, 226, 0.2)", // Violet tint - added for theme
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
    username: "Dropdir.xyz",
    avatar_url: "https://unavatar.io/x/drop_dir",
  },
  messages = [],
  onSendMessage = () => {},
}) => {
  // Sound preferences state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const savedPreference = localStorage.getItem("soundEnabled");
    return savedPreference !== null ? savedPreference === "true" : true;
  });

  // Toggle sound function
  const toggleSound = () => {
    const newSoundState = !soundEnabled;
    setSoundEnabled(newSoundState);
    localStorage.setItem("soundEnabled", String(newSoundState));
  };
  // Track which messages have been read by the client
  const [readMessageIds, setReadMessageIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Previous messages reference for detecting new messages
  const prevMessagesRef = useRef<Message[]>([]);

  // Scroll to bottom of messages when messages change, mark visible messages as read, and play sound for new messages
  useEffect(() => {
    scrollToBottom();
    markVisibleMessagesAsRead();

    // Check for new messages from others and play notification sound
    if (prevMessagesRef.current.length < messages.length) {
      const newMessages = messages.filter(
        (message) =>
          !prevMessagesRef.current.some((prevMsg) => prevMsg.id === message.id),
      );

      // Play sound for each new message that's not from current user
      newMessages.forEach((message) => {
        const senderId = getSenderId(message);
        if (senderId !== currentUserId && soundEnabled) {
          // Create a new Audio instance for each notification to bypass autoplay restrictions
          const sound = new Audio("/sounds/bird-notification.mp3");
          sound.volume = 0.5; // Set volume to 50%
          sound.play().catch((error) => {
            console.error("Error playing notification sound:", error);
          });
        }
      });
    }

    // Update previous messages reference
    prevMessagesRef.current = [...messages];
  }, [messages]);

  // Function to mark messages as read when they are visible in the viewport
  const markVisibleMessagesAsRead = () => {
    // For simplicity, we'll mark all messages as read when they're loaded
    // In a real implementation, you would use IntersectionObserver to check visibility
    const newReadMessageIds = new Set(readMessageIds);

    messages.forEach((message) => {
      const senderId = getSenderId(message);
      // Only mark messages from others as read (not our own messages)
      if (senderId !== currentUserId) {
        newReadMessageIds.add(message.id);
      }
    });

    if (newReadMessageIds.size !== readMessageIds.size) {
      setReadMessageIds(newReadMessageIds);
    }
  };

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
    // Check client-side read status first
    if (readMessageIds.has(message.id) || message.isRead || message.read)
      return "read";
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
          <div className="flex flex-col w-full max-w-[98%] sm:max-w-[75%] md:max-w-[65%] overflow-hidden">
            <Card
              className={`p-1 sm:p-3 border ${side === "right" ? "border-retro-glow" : "border-retro-border"} ${
                side === "right" ? "text-retro-glow" : "text-retro-text"
              }`}
              style={{
                backgroundColor: userStyles.bubbleColor,
                backgroundImage:
                  side === "right"
                    ? `linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.35)), linear-gradient(to right, rgba(128,0,128,0.15), rgba(160,32,240,0.15), rgba(75,0,130,0.15), rgba(0,255,0,0.15))`
                    : `linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.25)), linear-gradient(to right, rgba(128,0,128,0.1), rgba(160,32,240,0.1), rgba(75,0,130,0.1), rgba(0,255,0,0.1))`,
                boxShadow:
                  side === "right"
                    ? "0 0 8px rgba(0,255,0,0.25)"
                    : "0 0 5px rgba(128,0,128,0.25)",
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
                        background: userStyles.gradient,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        filter: "brightness(1.5)",
                      }}
                    >
                      {username}
                    </a>
                    <span className="text-[8px] sm:text-xs text-white font-mono bg-black bg-opacity-30 px-1 sm:px-2 py-0.5 rounded whitespace-nowrap">
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
            <button
              onClick={toggleSound}
              className="focus:outline-none"
              title={
                soundEnabled ? "Mute notifications" : "Enable notifications"
              }
            >
              {soundEnabled ? (
                <Radio className="h-4 w-4 sm:h-5 sm:w-5 text-retro-glow animate-pulse" />
              ) : (
                <Radio className="h-4 w-4 sm:h-5 sm:w-5 text-retro-text opacity-50" />
              )}
            </button>
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

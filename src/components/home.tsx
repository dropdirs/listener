import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import MessageThread from "./chat/MessageThread";

// Initialize Supabase client
const supabaseUrl = "https://xybpqwvxdsozmyqbcrfz.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5YnBxd3Z4ZHNvem15cWJjcmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5NzQyNzMsImV4cCI6MjA2MTU1MDI3M30.-JZ2ejXJxS3oDH9vKkJKjzceFo4SdBvOyexbnc43KTQ";
const supabase = createClient(supabaseUrl, supabaseKey);

// Define interfaces for telegram data from Supabase
interface TelegramMessage {
  id: string;
  username: string;
  message: string;
  sent_at: string;
  channel_id?: string;
}

interface TelegramChannel {
  id: string;
  name: string;
  description: string;
  last_message: string;
  last_activity: string;
  subscriber_count: number;
  avatar_url?: string;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
  username: string;
  channelId: string;
}

const Home = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [channels, setChannels] = useState<TelegramChannel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string>("1");

  // Fetch channels from database
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would fetch from Supabase
        // const { data, error } = await supabase
        //   .from('telegram_channels')
        //   .select('*')
        //   .order('last_activity', { ascending: false });

        // if (error) throw error;

        // Mock data for channels
        const mockChannels: TelegramChannel[] = [
          {
            id: "1",
            name: "ROBOTIC NEWS",
            description: "Latest updates from the robot world",
            last_message: "New firmware update available",
            last_activity: new Date().toISOString(),
            subscriber_count: 1250,
            avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=robot1",
          },
          {
            id: "2",
            name: "TECH 1970",
            description: "Retro technology discussions",
            last_message: "Remember punch cards?",
            last_activity: new Date(Date.now() - 3600000).toISOString(),
            subscriber_count: 870,
            avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=tech",
          },
          {
            id: "3",
            name: "SPACE PROGRAM",
            description: "Updates from space missions",
            last_message: "Moon landing footage analysis",
            last_activity: new Date(Date.now() - 7200000).toISOString(),
            subscriber_count: 2100,
            avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=space",
          },
          {
            id: "4",
            name: "MAINFRAME ALERTS",
            description: "Critical system notifications",
            last_message: "System reboot scheduled",
            last_activity: new Date(Date.now() - 86400000).toISOString(),
            subscriber_count: 450,
            avatar_url:
              "https://api.dicebear.com/7.x/bottts/svg?seed=mainframe",
          },
          {
            id: "5",
            name: "BINARY CLUB",
            description: "For binary code enthusiasts",
            last_message: "01001000 01101001",
            last_activity: new Date(Date.now() - 172800000).toISOString(),
            subscriber_count: 760,
            avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=binary",
          },
        ];

        setChannels(mockChannels);
        if (mockChannels.length > 0) {
          setSelectedChannelId(mockChannels[0].id);
        }
      } catch (error) {
        console.error("Error fetching channels:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  // Fetch messages from Supabase
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        // Fetch real data from Supabase
        const { data, error } = await supabase
          .from("telegram_messages")
          .select("*")
          .order("sent_at", { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          // Transform Supabase data to Message format
          const supabaseMessages: Message[] = data.map(
            (msg: TelegramMessage) => ({
              id: msg.id,
              senderId: msg.username,
              text: msg.message,
              timestamp: msg.sent_at,
              status: "delivered",
              username: msg.username,
              channelId: msg.channel_id || "1",
            }),
          );
          setMessages(supabaseMessages);
        } else {
          // If no data in Supabase, use mock data as fallback
          const mockMessages: Message[] = generateMockMessagesForChannel("1");
          setMessages(mockMessages);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        // Use mock data as fallback on error
        const mockMessages: Message[] = generateMockMessagesForChannel("1");
        setMessages(mockMessages);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Set up real-time subscription for all telegram messages
    const messagesSubscription = supabase
      .channel(`telegram_messages_realtime`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "telegram_messages",
        },
        (payload) => {
          console.log("New telegram message:", payload);

          const newMessage = payload.new as TelegramMessage;
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: newMessage.id,
              senderId: newMessage.username,
              text: newMessage.message,
              timestamp: newMessage.sent_at,
              status: "delivered",
              username: newMessage.username,
              channelId: newMessage.channel_id || "1",
            },
          ]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesSubscription);
    };
  }, []);

  // Generate mock messages for a channel
  const generateMockMessagesForChannel = (channelId: string): Message[] => {
    const selectedChannel = channels.find((c) => c.id === channelId);
    if (!selectedChannel) return [];

    const botNames = [
      "SYSTEM",
      "BOT-9000",
      "MAINFRAME",
      "DATANODE",
      "TERMINAL",
    ];
    const usernames = ["USER-X", "OPERATOR", "ADMIN", "GUEST-7", "TECHNICIAN"];

    const messageCount = 10 + Math.floor(Math.random() * 15);
    const messages: Message[] = [];

    // Generate messages based on channel theme
    for (let i = 0; i < messageCount; i++) {
      const isBot = Math.random() > 0.3;
      const username = isBot
        ? botNames[Math.floor(Math.random() * botNames.length)]
        : usernames[Math.floor(Math.random() * usernames.length)];

      let messageText = "";

      // Generate themed messages based on channel
      switch (channelId) {
        case "1": // ROBOTIC NEWS
          messageText = isBot
            ? getRandomItem([
                "FIRMWARE UPDATE V7.2.1 AVAILABLE",
                "SENSOR CALIBRATION REQUIRED",
                "NEW ROBOT MODEL ANNOUNCED",
                "BATTERY EFFICIENCY IMPROVED BY 15%",
              ])
            : getRandomItem([
                "When will the update be available?",
                "Has anyone tested the new sensors?",
                "Can we get more details on the battery improvements?",
              ]);
          break;
        case "2": // TECH 1970
          messageText = isBot
            ? getRandomItem([
                "PUNCH CARD SYSTEM OFFLINE",
                "VACUUM TUBE REPLACEMENT NEEDED",
                "MAGNETIC TAPE BACKUP COMPLETE",
                "TRANSISTOR COUNT: 1,500",
              ])
            : getRandomItem([
                "Remember when 1MB was a lot of storage?",
                "I still have my original BASIC manual",
                "Anyone still using FORTRAN here?",
              ]);
          break;
        case "3": // SPACE PROGRAM
          messageText = isBot
            ? getRandomItem([
                "TELEMETRY DATA RECEIVED",
                "ORBIT CALCULATION COMPLETE",
                "RADIO SIGNAL DETECTED FROM SECTOR 7",
                "OXYGEN LEVELS NOMINAL",
              ])
            : getRandomItem([
                "When is the next launch scheduled?",
                "Has anyone analyzed the new crater images?",
                "Signal strength seems better today",
              ]);
          break;
        case "4": // MAINFRAME ALERTS
          messageText = isBot
            ? getRandomItem([
                "SYSTEM REBOOT SCHEDULED: 0200 HOURS",
                "DISK SPACE WARNING: 85% FULL",
                "UNAUTHORIZED ACCESS ATTEMPT DETECTED",
                "COOLING SYSTEM OPERATIONAL",
              ])
            : getRandomItem([
                "Can we postpone the reboot?",
                "I'll clean up some disk space",
                "Was the access attempt logged?",
              ]);
          break;
        case "5": // BINARY CLUB
          messageText = isBot
            ? getRandomItem([
                "01001000 01000101 01001100 01001100 01001111",
                "10101010 10101010",
                "01010011 01011001 01010011 01010100 01000101 01001101",
              ])
            : getRandomItem([
                "01001000 01101001",
                "Anyone translate this to ASCII?",
                "01001110 01101001 01100011 01100101",
              ]);
          break;
        default:
          messageText = "NO DATA AVAILABLE";
      }

      const timestamp = new Date(
        Date.now() - (messageCount - i) * 300000 - Math.random() * 60000,
      ).toISOString();

      messages.push({
        id: `${channelId}-msg-${i}`,
        senderId: username,
        text: messageText,
        timestamp: timestamp,
        status: "read",
        username: username,
        channelId: channelId,
      });
    }

    return messages.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  };

  // Helper function to get random item from array
  const getRandomItem = (items: string[]): string => {
    return items[Math.floor(Math.random() * items.length)];
  };

  if (loading && channels.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-retro-bg">
        <div className="font-retro text-retro-text text-xl">
          <div className="animate-pulse">INITIALIZING SYSTEM...</div>
          <div className="mt-4 animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-retro-glow"></div>
        </div>
      </div>
    );
  }

  const selectedChannel =
    channels.find((c) => c.id === selectedChannelId) || channels[0];

  return (
    <div className="h-screen bg-retro-bg flex flex-col">
      <div className="bg-retro-terminal text-retro-text p-2 font-retro text-center border-b-2 border-retro-border">
        <h1 className="text-xl tracking-wider">
          MULTI-TELEGRAM CHANNEL MONITOR{" "}
          <span className="text-retro-robot">1970</span>
        </h1>
      </div>
      <div className="h-full overflow-hidden">
        <div className="h-full">
          <MessageThread
            messages={messages}
            recipientUser={{
              id: "telegram-feed",
              username: "TELEGRAM FEED",
              avatar_url:
                "https://api.dicebear.com/7.x/bottts/svg?seed=telegram",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;

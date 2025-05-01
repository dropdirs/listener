import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

// Initialize Supabase client
const supabaseUrl = "https://xybpqwvxdsozmyqbcrfz.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5YnBxd3Z4ZHNvem15cWJjcmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5NzQyNzMsImV4cCI6MjA2MTU1MDI3M30.-JZ2ejXJxS3oDH9vKkJKjzceFo4SdBvOyexbnc43KTQ";
const supabase = createClient(supabaseUrl, supabaseKey);

const MessageSimulator = () => {
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("SYSTEM");
  const [link, setLink] = useState("");
  const [sending, setSending] = useState(false);
  const [messageId, setMessageId] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setSending(true);

    try {
      if (isEditing && messageId) {
        // Update existing message
        const { data, error } = await supabase
          .from("telegram_messages")
          .update({
            username: username || "SYSTEM",
            message: message,
            link: link || null,
          })
          .eq("id", messageId)
          .select();

        if (error) throw error;

        console.log("Message updated:", data);
        setIsEditing(false);
        setMessageId("");
      } else {
        // Insert new message
        const { data, error } = await supabase
          .from("telegram_messages")
          .insert([
            {
              username: username || "SYSTEM",
              message: message,
              sent_at: new Date().toISOString(),
              channel_id: "1",
              link: link || null,
            },
          ])
          .select();

        if (error) throw error;

        console.log("Message sent:", data);
      }

      setMessage("");
      setLink("");
    } catch (error) {
      console.error("Error sending/updating message:", error);
    } finally {
      setSending(false);
    }
  };

  const deleteMessage = async () => {
    if (!messageId) return;

    setSending(true);

    try {
      const { error } = await supabase
        .from("telegram_messages")
        .delete()
        .eq("id", messageId);

      if (error) throw error;

      console.log("Message deleted");
      setMessage("");
      setLink("");
      setMessageId("");
      setIsEditing(false);
    } catch (error) {
      console.error("Error deleting message:", error);
    } finally {
      setSending(false);
    }
  };

  const loadMessage = async () => {
    if (!messageId) return;

    try {
      const { data, error } = await supabase
        .from("telegram_messages")
        .select("*")
        .eq("id", messageId)
        .single();

      if (error) throw error;

      if (data) {
        setUsername(data.username || "SYSTEM");
        setMessage(data.message || "");
        setLink(data.link || "");
        setIsEditing(true);
      }
    } catch (error) {
      console.error("Error loading message:", error);
      alert("Message not found");
    }
  };

  return (
    <Card className="p-4 bg-retro-terminal border-2 border-retro-border">
      <h3 className="text-retro-text font-retro mb-4 text-center">
        MESSAGE SIMULATOR
      </h3>

      <div className="space-y-3">
        <div>
          <label className="text-retro-text text-xs mb-1 block">
            MESSAGE ID (FOR EDIT/DELETE):
          </label>
          <div className="flex gap-2">
            <Input
              value={messageId}
              onChange={(e) => setMessageId(e.target.value)}
              className="bg-retro-input text-retro-text border-retro-border flex-1"
              placeholder="Enter message ID"
            />
            <Button
              onClick={loadMessage}
              disabled={!messageId.trim()}
              className="bg-retro-border hover:bg-retro-border text-black font-retro"
              size="sm"
            >
              LOAD
            </Button>
          </div>
        </div>

        <div>
          <label className="text-retro-text text-xs mb-1 block">
            USERNAME:
          </label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-retro-input text-retro-text border-retro-border"
            placeholder="Enter username"
          />
        </div>

        <div>
          <label className="text-retro-text text-xs mb-1 block">MESSAGE:</label>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="bg-retro-input text-retro-text border-retro-border"
            placeholder="Enter message"
          />
        </div>

        <div>
          <label className="text-retro-text text-xs mb-1 block">
            LINK (OPTIONAL):
          </label>
          <Input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="bg-retro-input text-retro-text border-retro-border"
            placeholder="https://example.com"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={sendMessage}
            disabled={sending || !message.trim()}
            className="flex-1 bg-retro-button hover:bg-retro-button-hover text-black font-retro"
          >
            {sending
              ? "PROCESSING..."
              : isEditing
                ? "UPDATE MESSAGE"
                : "SEND MESSAGE"}
          </Button>

          {isEditing && (
            <Button
              onClick={deleteMessage}
              disabled={sending || !messageId.trim()}
              className="bg-red-600 hover:bg-red-700 text-white font-retro"
            >
              DELETE
            </Button>
          )}
        </div>

        {isEditing && (
          <Button
            onClick={() => {
              setIsEditing(false);
              setMessageId("");
              setMessage("");
              setLink("");
              setUsername("SYSTEM");
            }}
            variant="outline"
            className="w-full border-retro-border text-retro-text font-retro"
          >
            CANCEL EDIT
          </Button>
        )}
      </div>
    </Card>
  );
};

export default MessageSimulator;

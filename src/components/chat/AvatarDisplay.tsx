import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AvatarDisplayProps {
  username: string;
  isCurrentUser: boolean;
  userColor: string;
  side?: "left" | "right";
  size?: "sm" | "md" | "lg";
}

const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  username,
  isCurrentUser,
  userColor,
  side = "left",
  size = "sm",
}) => {
  // Size classes mapping
  const sizeClasses = {
    sm: "h-6 w-6 sm:h-8 sm:w-8",
    md: "h-8 w-8 sm:h-10 sm:w-10",
    lg: "h-10 w-10 sm:h-12 sm:w-12",
  };

  // Position classes based on side
  const positionClasses =
    side === "left" ? "mr-1 sm:mr-2 mt-1" : "ml-1 sm:ml-2 mt-1";

  // Border classes based on side
  const borderClasses =
    side === "left" ? "border-retro-border" : "border-retro-glow";

  // Get avatar URL
  const getAvatarUrl = () => {
    if (isCurrentUser) {
      return "https://api.dicebear.com/7.x/bottts/svg?seed=you";
    }

    // Use unavatar.io for Telegram avatars
    return `https://unavatar.io/telegram/${encodeURIComponent(username)}`;
  };

  return (
    <Avatar
      className={`${sizeClasses[size]} ${positionClasses} flex-shrink-0 border ${borderClasses}`}
    >
      <AvatarImage src={getAvatarUrl()} />
      <AvatarFallback
        style={{ backgroundColor: "#000", color: userColor }}
        className="font-retro text-[8px] sm:text-xs"
      >
        {username.charAt(0)}
      </AvatarFallback>
    </Avatar>
  );
};

export default AvatarDisplay;

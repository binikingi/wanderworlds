
import React from 'react';
import { PlayerState } from '@/types/game';
import { cn } from '@/lib/utils';

type PlayerProps = {
  player: PlayerState;
  isCurrentPlayer: boolean;
  worldPosition: { x: number; y: number };
};

const Player: React.FC<PlayerProps> = ({ player, isCurrentPlayer, worldPosition }) => {
  // Player size constants
  const PLAYER_WIDTH = 50;
  const PLAYER_HEIGHT = 50;
  
  // Calculate player position inside the world
  const playerStyle = {
    left: `${player.position.x}px`,
    top: `${player.position.y}px`,
    width: `${PLAYER_WIDTH}px`,
    height: `${PLAYER_HEIGHT}px`,
    zIndex: isCurrentPlayer ? 10 : 5,
  };
  
  // Determine player animation class based on movement direction
  const getPlayerAnimation = () => {
    if (!player.isMoving) return "player-idle";
    
    return `player-${player.direction}`;
  };
  
  // Generate player avatar container style with the color
  const avatarContainerStyle = {
    backgroundColor: player.color,
  };
  
  // Handle image error by applying a default color/style
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    if (target) {
      target.style.opacity = "0";
    }
  };

  return (
    <div 
      className={cn(
        "absolute transition-transform pointer-events-none",
        getPlayerAnimation(),
        isCurrentPlayer ? "player-current" : "player-other"
      )}
      style={playerStyle}
      data-player-id={player.id}
    >
      {/* Avatar with colored background */}
      <div 
        className={cn(
          "relative w-full h-full rounded-full overflow-hidden",
          "flex items-center justify-center",
          "border-2",
          isCurrentPlayer ? "border-white shadow-glow" : "border-white/60"
        )}
        style={avatarContainerStyle}
      >
        {/* Player avatar */}
        <img 
          src={`/assets/avatars/avatar-${player.avatar}.svg`}
          alt={player.name}
          className="w-3/4 h-3/4 object-contain"
          onError={handleImageError}
        />
      </div>
      
      {/* Player name and score */}
      <div className={cn(
        "absolute -bottom-6 left-1/2 -translate-x-1/2",
        "text-xs font-semibold text-center",
        "bg-black/60 text-white px-2 py-0.5 rounded-md whitespace-nowrap",
        isCurrentPlayer ? "text-white" : "text-gray-100"
      )}>
        <span>{player.name}</span>
        <span className="ml-1 bg-yellow-500 text-black px-1 rounded-sm">
          {player.score}
        </span>
      </div>
      
      {/* Current player indicator (only for current player) */}
      {isCurrentPlayer && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-2 h-2 bg-white rounded-full shadow-glow-sm" />
        </div>
      )}
    </div>
  );
};

export default Player;

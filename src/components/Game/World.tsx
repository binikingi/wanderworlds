
import React, { useState, useEffect, useRef } from 'react';
import Player from './Player';
import InteractiveObject from './InteractiveObject';
import ChatSystem from './ChatSystem';
import ScoreBoard from './ScoreBoard';
import { GameState } from '@/types/game';
import { cn } from '@/lib/utils';

type WorldProps = {
  gameState: GameState;
  onCollectObject: (objectId: string) => void;
  onSendChatMessage: (message: string) => void;
};

const World: React.FC<WorldProps> = ({ gameState, onCollectObject, onSendChatMessage }) => {
  const [worldPosition, setWorldPosition] = useState({ x: 0, y: 0 });
  const worldRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastUpdateTimeRef = useRef<number>(0);

  // Center the world on the current player - use requestAnimationFrame for smoother updates
  useEffect(() => {
    let animationFrameId: number;
    
    const updateWorldPosition = (timestamp: number) => {
      // Throttle updates to avoid too many re-renders (every 16ms ≈ 60fps)
      if (timestamp - lastUpdateTimeRef.current >= 16) {
        lastUpdateTimeRef.current = timestamp;
        
        if (!gameState.currentPlayerId || !containerRef.current) return;
        
        const currentPlayer = gameState.players[gameState.currentPlayerId];
        if (!currentPlayer) return;
        
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        
        // Center the player in the viewport
        const newWorldX = currentPlayer.position.x - containerWidth / 2 + 25;
        const newWorldY = currentPlayer.position.y - containerHeight / 2 + 25;
        
        // Clamp world position to prevent showing beyond boundaries
        const clampedX = Math.max(0, Math.min(newWorldX, gameState.worldSize.width - containerWidth));
        const clampedY = Math.max(0, Math.min(newWorldY, gameState.worldSize.height - containerHeight));
        
        setWorldPosition({ x: clampedX, y: clampedY });
      }
      
      animationFrameId = requestAnimationFrame(updateWorldPosition);
    };
    
    // Start the animation frame loop
    animationFrameId = requestAnimationFrame(updateWorldPosition);
    
    // Clean up
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [gameState.currentPlayerId, gameState.players, gameState.worldSize]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-game-background"
    >
      {/* World container */}
      <div 
        ref={worldRef}
        className="absolute top-0 left-0 will-change-transform"
        style={{
          width: `${gameState.worldSize.width}px`,
          height: `${gameState.worldSize.height}px`,
          transform: `translate(-${worldPosition.x}px, -${worldPosition.y}px)`,
        }}
      >
        {/* Solid background color */}
        <div className="absolute inset-0 bg-gray-100 pointer-events-none" />
        
        {/* Grid lines for visual reference */}
        <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 pointer-events-none">
          {Array.from({ length: 10 }).map((_, i) => (
            <div 
              key={`grid-col-${i}`} 
              className="border-r border-game-border/30 h-full"
              style={{ left: `${i * 10}%` }} 
            />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <div 
              key={`grid-row-${i}`} 
              className="border-b border-game-border/30 w-full"
              style={{ top: `${i * 10}%` }} 
            />
          ))}
        </div>
        
        {/* Render all interactive objects */}
        {Object.values(gameState.objects).map((object) => (
          <InteractiveObject 
            key={object.id}
            object={object}
            onCollect={onCollectObject}
          />
        ))}
        
        {/* Render all players */}
        {Object.values(gameState.players).map((player) => (
          <Player 
            key={player.id}
            player={player}
            isCurrentPlayer={player.id === gameState.currentPlayerId}
            worldPosition={worldPosition}
          />
        ))}
      </div>
      
      {/* Chat system */}
      <ChatSystem 
        messages={gameState.messages}
        currentPlayerId={gameState.currentPlayerId}
        onSendMessage={onSendChatMessage}
      />
      
      {/* Score board */}
      <ScoreBoard 
        players={gameState.players}
        currentPlayerId={gameState.currentPlayerId}
      />
      
      {/* Minimap (position indicator) */}
      <div className="absolute top-4 right-4 w-40 h-40 bg-white/60 backdrop-blur-md rounded-lg border border-white/40 shadow-lg p-2">
        <div className="relative w-full h-full overflow-hidden rounded">
          <div className="absolute inset-0 bg-game-background/50" />
          
          {/* Minimap player indicators */}
          {Object.values(gameState.players).map((player) => (
            <div 
              key={`map-${player.id}`}
              className={cn(
                "absolute w-2 h-2 rounded-full",
                player.id === gameState.currentPlayerId ? "shadow-md scale-150" : ""
              )}
              style={{
                backgroundColor: player.color,
                left: `${(player.position.x / gameState.worldSize.width) * 100}%`,
                top: `${(player.position.y / gameState.worldSize.height) * 100}%`,
              }}
            />
          ))}
          
          {/* Minimap object indicators */}
          {Object.values(gameState.objects)
            .filter(obj => !obj.collected)
            .map((object) => (
              <div 
                key={`map-obj-${object.id}`}
                className="absolute w-1 h-1 rounded-full bg-yellow-400"
                style={{
                  left: `${(object.position.x / gameState.worldSize.width) * 100}%`,
                  top: `${(object.position.y / gameState.worldSize.height) * 100}%`,
                }}
              />
            ))}
          
          {/* Viewport indicator */}
          {gameState.currentPlayerId && containerRef.current && (
            <div 
              className="absolute border-2 border-game-primary/70 rounded-sm pointer-events-none"
              style={{
                left: `${(worldPosition.x / gameState.worldSize.width) * 100}%`,
                top: `${(worldPosition.y / gameState.worldSize.height) * 100}%`,
                width: `${(containerRef.current.clientWidth / gameState.worldSize.width) * 100}%`,
                height: `${(containerRef.current.clientHeight / gameState.worldSize.height) * 100}%`,
              }}
            />
          )}
        </div>
      </div>
      
      {/* Connection status indicator */}
      <div className={cn(
        "absolute bottom-20 left-20 px-3 py-1 rounded-full text-xs font-medium",
        "flex items-center space-x-1.5",
        gameState.isConnected ? "bg-green-500/20 text-green-700" : "bg-red-500/20 text-red-700"
      )}>
        <div className={cn(
          "w-2 h-2 rounded-full animate-pulse",
          gameState.isConnected ? "bg-green-500" : "bg-red-500"
        )} />
        <span>{gameState.isConnected ? "Connected" : "Disconnected"}</span>
      </div>
    </div>
  );
};

export default World;

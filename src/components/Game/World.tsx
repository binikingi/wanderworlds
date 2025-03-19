
import React, { useState, useEffect, useRef } from 'react';
import Player from './Player';
import { GameState } from '@/types/game';
import { cn } from '@/lib/utils';

type WorldProps = {
  gameState: GameState;
};

const World: React.FC<WorldProps> = ({ gameState }) => {
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
        {/* Background pattern */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-gray-50" />
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        </div>
        
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
        
        {/* World decorations - circles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div 
            key={`circle-${i}`}
            className={cn(
              "absolute rounded-full",
              "pointer-events-none",
              "bg-gradient-to-b",
              i % 3 === 0 ? "from-game-primary/10 to-game-primary/5" : 
              i % 3 === 1 ? "from-game-secondary/10 to-game-secondary/5" : 
              "from-game-accent/10 to-game-accent/5"
            )}
            style={{
              width: `${Math.random() * 300 + 50}px`,
              height: `${Math.random() * 300 + 50}px`,
              left: `${Math.random() * gameState.worldSize.width}px`,
              top: `${Math.random() * gameState.worldSize.height}px`,
              opacity: 0.7,
            }}
          />
        ))}
        
        {/* World decorations - shapes */}
        {Array.from({ length: 8 }).map((_, i) => {
          const size = Math.random() * 200 + 100;
          return (
            <div 
              key={`shape-${i}`}
              className="absolute pointer-events-none"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${Math.random() * gameState.worldSize.width}px`,
                top: `${Math.random() * gameState.worldSize.height}px`,
                opacity: 0.4,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            >
              {i % 4 === 0 ? (
                <div className="w-full h-full rounded-full border-4 border-game-primary/20" />
              ) : i % 4 === 1 ? (
                <div className="w-full h-full rounded-3xl border-4 border-game-secondary/20" />
              ) : i % 4 === 2 ? (
                <div className="w-full h-1/2 rounded-t-full border-4 border-game-accent/20" />
              ) : (
                <div className="w-1/2 h-full rounded-l-full border-4 border-game-primary/20" />
              )}
            </div>
          );
        })}
        
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
    </div>
  );
};

export default World;


import React, { useMemo } from 'react';
import { PlayerState } from '@/types/game';
import { cn } from '@/lib/utils';

type PlayerProps = {
  player: PlayerState;
  isCurrentPlayer: boolean;
  worldPosition: { x: number; y: number };
};

const Player: React.FC<PlayerProps> = ({ player, isCurrentPlayer, worldPosition }) => {
  const playerClassName = useMemo(() => {
    return cn(
      'game-character',
      'w-12 h-12',
      'flex items-center justify-center',
      'rounded-full',
      'border-2',
      isCurrentPlayer ? 'border-white shadow-lg' : 'border-opacity-50',
      player.isMoving ? 'animate-pulse-soft' : '',
      isCurrentPlayer ? 'z-50' : 'z-40'
    );
  }, [player.isMoving, isCurrentPlayer]);

  const playerStyles = useMemo(() => {
    return {
      backgroundColor: player.color,
      left: `${player.position.x - worldPosition.x}px`,
      top: `${player.position.y - worldPosition.y}px`,
      transform: isCurrentPlayer ? 'scale(1.1)' : 'scale(1)',
    };
  }, [player.position.x, player.position.y, player.color, worldPosition, isCurrentPlayer]);

  const avatarPath = useMemo(() => {
    return `/assets/avatars/avatar-${player.avatar}.svg`;
  }, [player.avatar]);

  const nameClassName = useMemo(() => {
    return cn(
      'absolute', 
      '-top-6', 
      'left-1/2', 
      '-translate-x-1/2', 
      'px-2',
      'py-0.5',
      'bg-black/60',
      'text-white',
      'text-xs',
      'rounded-full',
      'whitespace-nowrap',
      'font-medium'
    );
  }, []);

  const directionIndicator = useMemo(() => {
    if (player.direction === 'idle' || !player.isMoving) return null;
    
    let styles = {};
    if (player.direction === 'up') {
      styles = { top: '-4px', left: '50%', transform: 'translateX(-50%)' };
    } else if (player.direction === 'down') {
      styles = { bottom: '-4px', left: '50%', transform: 'translateX(-50%)' };
    } else if (player.direction === 'left') {
      styles = { left: '-4px', top: '50%', transform: 'translateY(-50%)' };
    } else if (player.direction === 'right') {
      styles = { right: '-4px', top: '50%', transform: 'translateY(-50%)' };
    }
    
    return (
      <div 
        className="absolute w-2 h-2 bg-white rounded-full" 
        style={styles}
      />
    );
  }, [player.direction, player.isMoving]);

  // Fallback avatar if image is not available
  const avatarFallback = useMemo(() => {
    return (
      <div className="w-8 h-8 flex items-center justify-center text-white font-bold">
        {player.name.charAt(0).toUpperCase()}
      </div>
    );
  }, [player.name]);

  return (
    <div 
      className={playerClassName} 
      style={playerStyles}
      data-player-id={player.id}
    >
      {isCurrentPlayer && (
        <div className="absolute -inset-1 rounded-full bg-white/30 animate-pulse-soft" />
      )}
      
      <div className="relative flex items-center justify-center w-8 h-8">
        <img 
          src={avatarPath} 
          alt={player.name} 
          className="w-full h-full object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling!.style.display = 'flex';
          }}
        />
        <div className="hidden">{avatarFallback}</div>
      </div>
      
      <div className={nameClassName}>
        {player.name}
      </div>
      
      {directionIndicator}
    </div>
  );
};

export default Player;

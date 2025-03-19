
import React, { useEffect } from 'react';
import World from './World';
import GameUI from '../UI/GameUI';
import { useGameState } from '@/hooks/useGameState';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { toast } from '@/components/ui/use-toast';

const GameCanvas: React.FC = () => {
  const {
    gameState,
    initializePlayer,
    updatePlayerAvatar,
    updatePlayerColor,
    updatePlayerName,
    addOtherPlayer,
    removePlayer,
    setConnected,
    getCurrentPlayer,
  } = useGameState();
  
  const {
    connect,
    disconnect,
    updatePlayer,
    isConnected,
  } = useMultiplayer(
    // onPlayerJoin
    (player) => {
      addOtherPlayer(player);
      toast({
        title: "Player joined",
        description: `${player.name} has joined the world`,
      });
    },
    // onPlayerLeave
    (playerId) => {
      removePlayer(playerId);
    },
    // onPlayerUpdate
    (player) => {
      addOtherPlayer(player);
    },
    // onConnected
    (connected) => {
      setConnected(connected);
    }
  );
  
  const handleConnect = () => {
    const playerId = connect();
    initializePlayer(playerId);
  };
  
  const handleDisconnect = () => {
    disconnect();
  };
  
  // Update the multiplayer system when the current player changes
  useEffect(() => {
    const currentPlayer = getCurrentPlayer();
    if (currentPlayer && isConnected) {
      updatePlayer(currentPlayer);
    }
  }, [gameState.players, gameState.currentPlayerId, isConnected, getCurrentPlayer, updatePlayer]);
  
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Game World */}
      <World gameState={gameState} />
      
      {/* Game UI */}
      <GameUI 
        gameState={gameState}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        onUpdatePlayerAvatar={updatePlayerAvatar}
        onUpdatePlayerColor={updatePlayerColor}
        onUpdatePlayerName={updatePlayerName}
        currentPlayer={getCurrentPlayer()}
      />
    </div>
  );
};

export default GameCanvas;

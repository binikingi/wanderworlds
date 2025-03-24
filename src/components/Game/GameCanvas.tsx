
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
    addObjects,
    updateObject,
    collectObject,
    addChatMessage,
    getCurrentPlayer,
  } = useGameState();
  
  const {
    connect,
    disconnect,
    updatePlayer,
    collectObject: collectObjectMultiplayer,
    sendChatMessage,
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
    // onObjectsReceived
    (objects) => {
      addObjects(objects);
    },
    // onObjectCollected
    (objectId, playerId, playerScore) => {
      collectObject(objectId, playerId);
      // If current player collected it, show a toast
      if (playerId === gameState.currentPlayerId) {
        toast({
          title: "Item collected!",
          description: `You collected an item! Score: ${playerScore}`,
        });
      }
    },
    // onObjectRespawned
    (object) => {
      updateObject(object.id, object);
    },
    // onChatMessageReceived
    (message) => {
      addChatMessage(message);
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
  
  const handleCollectObject = (objectId: string) => {
    collectObjectMultiplayer(objectId);
  };
  
  const handleSendChatMessage = (message: string) => {
    sendChatMessage(message);
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
      <World 
        gameState={gameState} 
        onCollectObject={handleCollectObject}
        onSendChatMessage={handleSendChatMessage}
      />
      
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


import { useState, useEffect, useCallback } from 'react';
import { GameState, PlayerState, Position, Direction, InteractiveObject, ChatMessage } from '../types/game';

export const WORLD_SIZE = {
  width: 2000,
  height: 2000,
};

export const MOVE_SPEED = 5;

const DEFAULT_GAME_STATE: GameState = {
  players: {},
  objects: {},
  messages: [],
  currentPlayerId: null,
  worldSize: WORLD_SIZE,
  isConnected: false,
};

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(DEFAULT_GAME_STATE);
  const [keysPressed, setKeysPressed] = useState<Set<string>>(new Set());

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    setKeysPressed((prev) => {
      const newSet = new Set(prev);
      newSet.add(e.key.toLowerCase());
      return newSet;
    });
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    setKeysPressed((prev) => {
      const newSet = new Set(prev);
      newSet.delete(e.key.toLowerCase());
      return newSet;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    if (!gameState.currentPlayerId) return;
    
    const intervalId = setInterval(() => {
      setGameState((prevState) => {
        if (!prevState.currentPlayerId) return prevState;
        
        const player = prevState.players[prevState.currentPlayerId];
        if (!player) return prevState;
        
        let newX = player.position.x;
        let newY = player.position.y;
        let direction: Direction = 'idle';
        let isMoving = false;
        
        if (keysPressed.has('w') || keysPressed.has('arrowup')) {
          newY = Math.max(0, player.position.y - MOVE_SPEED);
          direction = 'up';
          isMoving = true;
        }
        if (keysPressed.has('s') || keysPressed.has('arrowdown')) {
          newY = Math.min(WORLD_SIZE.height - 50, player.position.y + MOVE_SPEED);
          direction = 'down';
          isMoving = true;
        }
        if (keysPressed.has('a') || keysPressed.has('arrowleft')) {
          newX = Math.max(0, player.position.x - MOVE_SPEED);
          direction = 'left';
          isMoving = true;
        }
        if (keysPressed.has('d') || keysPressed.has('arrowright')) {
          newX = Math.min(WORLD_SIZE.width - 50, player.position.x + MOVE_SPEED);
          direction = 'right';
          isMoving = true;
        }
        
        if (newX === player.position.x && newY === player.position.y) {
          return prevState;
        }
        
        // Check if player is collecting any objects
        const playerRect = {
          x: newX,
          y: newY,
          width: 50,
          height: 50
        };
        
        let objectCollected = null;
        
        // Check collision with objects
        Object.values(prevState.objects).forEach(object => {
          if (!object.collected) {
            const objectRect = {
              x: object.position.x,
              y: object.position.y,
              width: 30,
              height: 30
            };
            
            // Simple collision detection
            if (
              playerRect.x < objectRect.x + objectRect.width &&
              playerRect.x + playerRect.width > objectRect.x &&
              playerRect.y < objectRect.y + objectRect.height &&
              playerRect.y + playerRect.height > objectRect.y
            ) {
              objectCollected = object.id;
            }
          }
        });
        
        const updatedPlayers = {
          ...prevState.players,
          [prevState.currentPlayerId]: {
            ...player,
            position: { x: newX, y: newY },
            direction,
            isMoving,
          },
        };
        
        return {
          ...prevState,
          players: updatedPlayers
        };
      });
    }, 16); // approximately 60fps
    
    return () => clearInterval(intervalId);
  }, [gameState.currentPlayerId, keysPressed]);

  const initializePlayer = useCallback((playerId: string, initialPosition?: Position) => {
    setGameState((prevState) => {
      const position = initialPosition || {
        x: Math.floor(Math.random() * (WORLD_SIZE.width - 100)) + 50,
        y: Math.floor(Math.random() * (WORLD_SIZE.height - 100)) + 50,
      };
      
      const newPlayer: PlayerState = {
        id: playerId,
        position,
        direction: 'idle',
        isMoving: false,
        avatar: '1',
        name: `Player ${playerId.slice(0, 4)}`,
        color: '#5585FF',
        score: 0,
      };
      
      return {
        ...prevState,
        players: {
          ...prevState.players,
          [playerId]: newPlayer,
        },
        currentPlayerId: playerId,
      };
    });
  }, []);

  const updatePlayerAvatar = useCallback((playerId: string, avatar: string) => {
    setGameState((prevState) => ({
      ...prevState,
      players: {
        ...prevState.players,
        [playerId]: {
          ...prevState.players[playerId],
          avatar,
        },
      },
    }));
  }, []);

  const updatePlayerColor = useCallback((playerId: string, color: string) => {
    setGameState((prevState) => ({
      ...prevState,
      players: {
        ...prevState.players,
        [playerId]: {
          ...prevState.players[playerId],
          color,
        },
      },
    }));
  }, []);

  const updatePlayerName = useCallback((playerId: string, name: string) => {
    setGameState((prevState) => ({
      ...prevState,
      players: {
        ...prevState.players,
        [playerId]: {
          ...prevState.players[playerId],
          name,
        },
      },
    }));
  }, []);

  const addOtherPlayer = useCallback((player: PlayerState) => {
    setGameState((prevState) => ({
      ...prevState,
      players: {
        ...prevState.players,
        [player.id]: player,
      },
    }));
  }, []);

  const removePlayer = useCallback((playerId: string) => {
    setGameState((prevState) => {
      const newPlayers = { ...prevState.players };
      delete newPlayers[playerId];
      
      return {
        ...prevState,
        players: newPlayers,
      };
    });
  }, []);

  const setConnected = useCallback((connected: boolean) => {
    setGameState((prevState) => ({
      ...prevState,
      isConnected: connected,
    }));
  }, []);

  const addObjects = useCallback((newObjects: Record<string, InteractiveObject>) => {
    setGameState((prevState) => ({
      ...prevState,
      objects: { ...prevState.objects, ...newObjects }
    }));
  }, []);

  const updateObject = useCallback((objectId: string, updates: Partial<InteractiveObject>) => {
    setGameState((prevState) => {
      if (!prevState.objects[objectId]) return prevState;
      
      return {
        ...prevState,
        objects: {
          ...prevState.objects,
          [objectId]: {
            ...prevState.objects[objectId],
            ...updates
          }
        }
      };
    });
  }, []);

  const addChatMessage = useCallback((message: ChatMessage) => {
    setGameState((prevState) => ({
      ...prevState,
      messages: [...prevState.messages, message]
    }));
  }, []);

  const collectObject = useCallback((objectId: string, playerId: string) => {
    setGameState((prevState) => {
      // If object doesn't exist or is already collected
      if (!prevState.objects[objectId] || prevState.objects[objectId].collected) {
        return prevState;
      }
      
      // Mark object as collected
      const updatedObjects = {
        ...prevState.objects,
        [objectId]: {
          ...prevState.objects[objectId],
          collected: true,
          collectedBy: playerId
        }
      };
      
      // Update player score
      const playerScore = prevState.players[playerId] ? 
        prevState.players[playerId].score + prevState.objects[objectId].value : 
        prevState.objects[objectId].value;
      
      const updatedPlayers = {
        ...prevState.players,
        [playerId]: {
          ...prevState.players[playerId],
          score: playerScore
        }
      };
      
      return {
        ...prevState,
        objects: updatedObjects,
        players: updatedPlayers
      };
    });
  }, []);

  const getCurrentPlayer = useCallback(() => {
    if (!gameState.currentPlayerId) return null;
    return gameState.players[gameState.currentPlayerId];
  }, [gameState.currentPlayerId, gameState.players]);

  return {
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
  };
}

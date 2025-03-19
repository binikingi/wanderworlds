
import { useEffect, useCallback, useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PlayerState } from '../types/game';
import { toast } from '@/components/ui/use-toast';

// Mock WebSocket for demo purposes - in a real app, this would use actual WebSockets
export function useMultiplayer(
  onPlayerJoin: (player: PlayerState) => void,
  onPlayerLeave: (playerId: string) => void,
  onPlayerUpdate: (player: PlayerState) => void,
  onConnected: (connected: boolean) => void
) {
  const [isConnected, setIsConnected] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const playerRef = useRef<PlayerState | null>(null);
  const mockPlayersRef = useRef<Record<string, NodeJS.Timeout>>({});

  const connect = useCallback(() => {
    // Simulate connection delay
    const id = uuidv4();
    setPlayerId(id);
    
    setTimeout(() => {
      setIsConnected(true);
      onConnected(true);
      toast({
        title: "Connected to server",
        description: "You are now connected to the game world",
      });
      
      // Add some mock players
      createMockPlayers();
    }, 1500);
    
    return id;
  }, [onConnected]);

  const disconnect = useCallback(() => {
    if (playerId) {
      // Cleanup mock players
      Object.values(mockPlayersRef.current).forEach(clearInterval);
      mockPlayersRef.current = {};
      
      setIsConnected(false);
      onConnected(false);
      toast({
        title: "Disconnected from server",
        description: "You have been disconnected from the game world",
        variant: "destructive",
      });
    }
  }, [playerId, onConnected]);

  const updatePlayer = useCallback((player: PlayerState) => {
    playerRef.current = player;
    
    // In a real implementation, this would send the update to the server
    console.log("Player updated:", player);
  }, []);

  const createMockPlayers = useCallback(() => {
    // Create 3-5 mock players with random movement patterns
    const playerCount = Math.floor(Math.random() * 3) + 3;
    
    for (let i = 0; i < playerCount; i++) {
      const mockPlayerId = `mock-${uuidv4()}`;
      const mockPlayer: PlayerState = {
        id: mockPlayerId,
        position: {
          x: Math.floor(Math.random() * 1800) + 100,
          y: Math.floor(Math.random() * 1800) + 100,
        },
        direction: 'idle',
        isMoving: false,
        avatar: String(Math.floor(Math.random() * 5) + 1),
        name: `Player ${i + 1}`,
        color: ['#5585FF', '#FF7D54', '#FFB443', '#42D6A4', '#FF5A5A'][Math.floor(Math.random() * 5)],
      };
      
      // Notify that a player has joined
      onPlayerJoin(mockPlayer);
      
      // Set up movement pattern
      const intervalId = setInterval(() => {
        // Random movement
        const directions = ['up', 'down', 'left', 'right', 'idle'];
        const randomDirection = directions[Math.floor(Math.random() * 5)] as PlayerState['direction'];
        const isMoving = randomDirection !== 'idle';
        
        let newX = mockPlayer.position.x;
        let newY = mockPlayer.position.y;
        
        if (isMoving) {
          const moveDistance = 3;
          
          if (randomDirection === 'up') {
            newY = Math.max(0, mockPlayer.position.y - moveDistance);
          } else if (randomDirection === 'down') {
            newY = Math.min(2000 - 50, mockPlayer.position.y + moveDistance);
          } else if (randomDirection === 'left') {
            newX = Math.max(0, mockPlayer.position.x - moveDistance);
          } else if (randomDirection === 'right') {
            newX = Math.min(2000 - 50, mockPlayer.position.x + moveDistance);
          }
        }
        
        mockPlayer.position.x = newX;
        mockPlayer.position.y = newY;
        mockPlayer.direction = randomDirection;
        mockPlayer.isMoving = isMoving;
        
        // Notify player update
        onPlayerUpdate(mockPlayer);
      }, 100);
      
      mockPlayersRef.current[mockPlayerId] = intervalId;
    }
  }, [onPlayerJoin, onPlayerUpdate]);

  useEffect(() => {
    return () => {
      // Clean up any mock players when unmounting
      Object.values(mockPlayersRef.current).forEach(clearInterval);
    };
  }, []);

  return {
    connect,
    disconnect,
    updatePlayer,
    isConnected,
    playerId,
  };
}

<lov-add-dependency>uuid@^9.0.1</lov-add-dependency>

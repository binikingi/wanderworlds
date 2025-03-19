
import { useEffect, useCallback, useState, useRef } from 'react';
import { PlayerState } from '../types/game';
import { toast } from '@/components/ui/use-toast';
import { generateUUID } from '@/lib/uuid-generator';

// WebSocket server URL - use environment variable or default
const WS_SERVER_URL = import.meta.env.VITE_WS_SERVER_URL || 'wss://game-wobsocket.fly.dev/';

export function useMultiplayer(
  onPlayerJoin: (player: PlayerState) => void,
  onPlayerLeave: (playerId: string) => void,
  onPlayerUpdate: (player: PlayerState) => void,
  onConnected: (connected: boolean) => void
) {
  const [isConnected, setIsConnected] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const playerRef = useRef<PlayerState | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Connect to WebSocket server
  const connect = useCallback(() => {
    const id = generateUUID();
    setPlayerId(id);
    
    try {
      const ws = new WebSocket(WS_SERVER_URL);
      wsRef.current = ws;
      
      // Handle WebSocket connection open
      ws.onopen = () => {
        console.log('Connected to WebSocket server');
        setIsConnected(true);
        onConnected(true);
        
        // Join the game
        ws.send(JSON.stringify({
          type: 'join',
          playerId: id
        }));
        
        toast({
          title: "Connected to server",
          description: "You are now connected to the game world",
        });
      };
      
      // Handle WebSocket messages
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'joined':
              // Received initial game state
              if (data.players) {
                // Load existing players
                Object.values(data.players).forEach((player: any) => {
                  if (player.id !== id) {
                    onPlayerJoin(player as PlayerState);
                  }
                });
              }
              break;
              
            case 'playerJoined':
              // New player joined
              if (data.player && data.player.id !== id) {
                onPlayerJoin(data.player as PlayerState);
                toast({
                  title: "Player joined",
                  description: `${data.player.name} has joined the world`,
                });
              }
              break;
              
            case 'playerUpdated':
              // Player updated their state
              if (data.player && data.player.id !== id) {
                onPlayerUpdate(data.player as PlayerState);
              }
              break;
              
            case 'playerLeft':
              // Player left the game
              if (data.playerId && data.playerId !== id) {
                onPlayerLeave(data.playerId);
                toast({
                  title: "Player left",
                  description: "A player has left the world",
                  variant: "destructive",
                });
              }
              break;
              
            default:
              console.log('Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      // Handle WebSocket errors
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: "Connection error",
          description: "Failed to connect to game server",
          variant: "destructive",
        });
      };
      
      // Handle WebSocket disconnection
      ws.onclose = () => {
        setIsConnected(false);
        onConnected(false);
        
        // Attempt to reconnect after a delay
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = setTimeout(() => {
          if (playerId) {
            toast({
              title: "Reconnecting",
              description: "Attempting to reconnect to the game server",
            });
            connect();
          }
        }, 5000);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      toast({
        title: "Connection failed",
        description: "Could not establish connection to the game server",
        variant: "destructive",
      });
    }
    
    return id;
  }, [onConnected, onPlayerJoin, onPlayerLeave, onPlayerUpdate]);

  // Disconnect from WebSocket server
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
      onConnected(false);
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      toast({
        title: "Disconnected from server",
        description: "You have been disconnected from the game world",
        variant: "destructive",
      });
    }
  }, [onConnected]);

  // Update player state on the server
  const updatePlayer = useCallback((player: PlayerState) => {
    playerRef.current = player;
    
    if (wsRef.current && isConnected) {
      wsRef.current.send(JSON.stringify({
        type: 'updatePlayer',
        player: player
      }));
    }
  }, [isConnected]);

  // Clean up WebSocket connection on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
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

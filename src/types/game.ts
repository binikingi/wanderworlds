
export type Position = {
  x: number;
  y: number;
};

export type Direction = 'up' | 'down' | 'left' | 'right' | 'idle';

export type PlayerState = {
  id: string;
  position: Position;
  direction: Direction;
  isMoving: boolean;
  avatar: string;
  name: string;
  color: string;
  score: number; // Track player's score
};

export type InteractiveObject = {
  id: string;
  type: 'coin' | 'gem' | 'star';
  position: Position;
  value: number;
  collected: boolean;
  collectedBy: string | null;
};

export type ChatMessage = {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
};

export type GameState = {
  players: Record<string, PlayerState>;
  objects: Record<string, InteractiveObject>;
  messages: ChatMessage[];
  currentPlayerId: string | null;
  worldSize: {
    width: number;
    height: number;
  };
  isConnected: boolean;
};

export type AvatarOption = {
  id: string;
  name: string;
  image: string;
};

export type ColorOption = {
  id: string;
  name: string;
  value: string;
};

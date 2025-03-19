
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { GameState, PlayerState } from '@/types/game';
import CharacterCustomization from './CharacterCustomization';

type GameUIProps = {
  gameState: GameState;
  onConnect: () => void;
  onDisconnect: () => void;
  onUpdatePlayerAvatar: (playerId: string, avatar: string) => void;
  onUpdatePlayerColor: (playerId: string, color: string) => void;
  onUpdatePlayerName: (playerId: string, name: string) => void;
  currentPlayer: PlayerState | null;
};

const GameUI: React.FC<GameUIProps> = ({
  gameState,
  onConnect,
  onDisconnect,
  onUpdatePlayerAvatar,
  onUpdatePlayerColor,
  onUpdatePlayerName,
  currentPlayer,
}) => {
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  return (
    <>
      {/* Connection UI - Show only when not connected */}
      {!gameState.isConnected && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="game-ui-panel max-w-md w-full animate-scale-in">
            <h1 className="text-2xl font-bold text-center mb-6 text-game-foreground">
              WanderWorlds
            </h1>
            <p className="text-game-foreground/80 text-center mb-8">
              A multiplayer 2D open world adventure. Explore together with players from around the globe.
            </p>
            <Button 
              onClick={onConnect}
              className="w-full bg-game-primary hover:bg-game-primary/90 text-white"
            >
              Connect to World
            </Button>
          </div>
        </div>
      )}

      {/* Main Game UI */}
      {gameState.isConnected && (
        <>
          {/* Top Bar */}
          <div className="absolute top-4 left-4 right-48 flex items-center space-x-4">
            <div className="game-ui-panel py-2 px-4 flex items-center">
              <h2 className="font-medium text-game-foreground">WanderWorlds</h2>
            </div>
            
            <div className="game-ui-panel py-2 px-4 flex items-center">
              <span className="text-sm text-game-foreground/70 mr-2">Players:</span>
              <span className="text-sm font-medium text-game-foreground">
                {Object.keys(gameState.players).length}
              </span>
            </div>
            
            {currentPlayer && (
              <div 
                className="game-ui-panel py-2 px-4 flex items-center cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setIsCustomizationOpen(true)}
              >
                <div 
                  className="w-6 h-6 rounded-full mr-2"
                  style={{ backgroundColor: currentPlayer.color }}
                >
                  <img 
                    src={`/assets/avatars/avatar-${currentPlayer.avatar}.svg`}
                    alt="Avatar"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-sm font-medium text-game-foreground">
                  {currentPlayer.name}
                </span>
              </div>
            )}
          </div>
          
          {/* Bottom Controls */}
          {showControls && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 game-ui-panel py-2 px-6">
              <div className="flex items-center space-x-8">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-game-foreground/70 mb-1">Movement</span>
                  <div className="grid grid-cols-3 gap-1">
                    <div className="w-8 h-8" />
                    <div className="w-8 h-8 flex items-center justify-center rounded border border-game-border bg-white/50 font-medium text-game-foreground">
                      W
                    </div>
                    <div className="w-8 h-8" />
                    <div className="w-8 h-8 flex items-center justify-center rounded border border-game-border bg-white/50 font-medium text-game-foreground">
                      A
                    </div>
                    <div className="w-8 h-8 flex items-center justify-center rounded border border-game-border bg-white/50 font-medium text-game-foreground">
                      S
                    </div>
                    <div className="w-8 h-8 flex items-center justify-center rounded border border-game-border bg-white/50 font-medium text-game-foreground">
                      D
                    </div>
                  </div>
                </div>
                
                <div className="h-12 border-r border-game-border/50" />
                
                <div className="flex flex-col items-center">
                  <span className="text-xs text-game-foreground/70 mb-1">Customize</span>
                  <button 
                    className="glass-button text-sm"
                    onClick={() => setIsCustomizationOpen(true)}
                  >
                    Appearance
                  </button>
                </div>
                
                <div className="h-12 border-r border-game-border/50" />
                
                <div className="flex flex-col items-center">
                  <span className="text-xs text-game-foreground/70 mb-1">Connection</span>
                  <button 
                    className="glass-button text-sm bg-red-500/20 hover:bg-red-500/30 text-red-700"
                    onClick={onDisconnect}
                  >
                    Disconnect
                  </button>
                </div>
              </div>
              
              <button 
                className="absolute top-1 right-1 text-game-foreground/50 hover:text-game-foreground/80 transition-colors"
                onClick={() => setShowControls(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          )}
          
          {!showControls && (
            <button 
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 game-ui-panel py-2 px-4 text-sm text-game-foreground/70 hover:text-game-foreground transition-colors"
              onClick={() => setShowControls(true)}
            >
              Show Controls
            </button>
          )}
          
          {/* Character Customization Modal */}
          {isCustomizationOpen && currentPlayer && (
            <CharacterCustomization 
              player={currentPlayer}
              onClose={() => setIsCustomizationOpen(false)}
              onUpdateAvatar={(avatar) => {
                onUpdatePlayerAvatar(currentPlayer.id, avatar);
              }}
              onUpdateColor={(color) => {
                onUpdatePlayerColor(currentPlayer.id, color);
              }}
              onUpdateName={(name) => {
                onUpdatePlayerName(currentPlayer.id, name);
              }}
            />
          )}
        </>
      )}
    </>
  );
};

export default GameUI;

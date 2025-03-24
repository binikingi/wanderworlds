
import React, { useState } from 'react';
import { PlayerState } from '@/types/game';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ListIcon, XIcon } from 'lucide-react';

type ScoreBoardProps = {
  players: Record<string, PlayerState>;
  currentPlayerId: string | null;
};

const ScoreBoard: React.FC<ScoreBoardProps> = ({ players, currentPlayerId }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Sort players by score (highest first)
  const sortedPlayers = Object.values(players).sort((a, b) => b.score - a.score);
  
  if (!isOpen) {
    return (
      <Button 
        className="absolute right-4 bottom-20 z-50 rounded-full"
        size="icon"
        onClick={() => setIsOpen(true)}
      >
        <ListIcon />
      </Button>
    );
  }
  
  return (
    <div className="absolute right-4 bottom-20 z-50 w-64 bg-white/90 backdrop-blur-md rounded-lg shadow-lg flex flex-col">
      <div className="p-2 flex justify-between items-center border-b">
        <h3 className="font-medium">Scoreboard</h3>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
          <XIcon className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="p-2 max-h-60 overflow-y-auto">
        {sortedPlayers.length === 0 ? (
          <div className="text-sm text-gray-500 text-center p-4">
            No players yet
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase p-1">#</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase p-1">Player</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase p-1">Score</th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player, index) => (
                <tr 
                  key={player.id} 
                  className={cn(
                    "border-b border-gray-100 last:border-0",
                    player.id === currentPlayerId ? "bg-blue-50" : ""
                  )}
                >
                  <td className="p-2 text-sm">{index + 1}</td>
                  <td className="p-2 text-sm font-medium flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: player.color }}
                    />
                    {player.id === currentPlayerId ? "You" : player.name}
                  </td>
                  <td className="p-2 text-sm text-right font-bold">{player.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ScoreBoard;


import React, { useState } from 'react';
import { PlayerState, AvatarOption, ColorOption } from '@/types/game';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Available avatar options
const AVATAR_OPTIONS: AvatarOption[] = [
  { id: '1', name: 'Default', image: '/assets/avatars/avatar-1.svg' },
  { id: '2', name: 'Happy', image: '/assets/avatars/avatar-2.svg' },
  { id: '3', name: 'Cool', image: '/assets/avatars/avatar-3.svg' },
  { id: '4', name: 'Serious', image: '/assets/avatars/avatar-4.svg' },
  { id: '5', name: 'Sleepy', image: '/assets/avatars/avatar-5.svg' },
];

// Available color options
const COLOR_OPTIONS: ColorOption[] = [
  { id: '1', name: 'Blue', value: '#5585FF' },
  { id: '2', name: 'Orange', value: '#FF7D54' },
  { id: '3', name: 'Yellow', value: '#FFB443' },
  { id: '4', name: 'Green', value: '#42D6A4' },
  { id: '5', name: 'Red', value: '#FF5A5A' },
  { id: '6', name: 'Purple', value: '#9C6AFF' },
  { id: '7', name: 'Teal', value: '#50E4D0' },
  { id: '8', name: 'Pink', value: '#FF7ED4' },
];

type CharacterCustomizationProps = {
  player: PlayerState;
  onClose: () => void;
  onUpdateAvatar: (avatar: string) => void;
  onUpdateColor: (color: string) => void;
  onUpdateName: (name: string) => void;
};

const CharacterCustomization: React.FC<CharacterCustomizationProps> = ({
  player,
  onClose,
  onUpdateAvatar,
  onUpdateColor,
  onUpdateName,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState(player.avatar);
  const [selectedColor, setSelectedColor] = useState(player.color);
  const [playerName, setPlayerName] = useState(player.name);

  const handleSubmit = () => {
    if (selectedAvatar !== player.avatar) {
      onUpdateAvatar(selectedAvatar);
    }
    
    if (selectedColor !== player.color) {
      onUpdateColor(selectedColor);
    }
    
    if (playerName !== player.name) {
      onUpdateName(playerName);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div 
        className="game-ui-panel max-w-xl w-full animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-game-foreground">Customize Character</h2>
          <button 
            className="text-game-foreground/70 hover:text-game-foreground"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        {/* Preview */}
        <div className="mb-6 flex justify-center">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ backgroundColor: selectedColor }}
          >
            <img 
              src={AVATAR_OPTIONS.find(a => a.id === selectedAvatar)?.image || '/assets/avatars/avatar-1.svg'}
              alt="Selected Avatar"
              className="w-16 h-16 object-contain"
            />
          </div>
        </div>
        
        {/* Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-game-foreground/70 mb-2">
            Player Name
          </label>
          <Input
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={15}
            className="bg-white/50 border-game-border"
          />
        </div>
        
        {/* Avatar Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-game-foreground/70 mb-2">
            Avatar
          </label>
          <div className="grid grid-cols-5 gap-2">
            {AVATAR_OPTIONS.map((avatar) => (
              <button
                key={avatar.id}
                className={cn(
                  "p-2 rounded-lg border-2 transition-all",
                  selectedAvatar === avatar.id ? "border-game-primary bg-game-primary/10" : "border-transparent hover:bg-gray-50"
                )}
                onClick={() => setSelectedAvatar(avatar.id)}
              >
                <img 
                  src={avatar.image}
                  alt={avatar.name}
                  className="w-full h-12 object-contain"
                />
              </button>
            ))}
          </div>
        </div>
        
        {/* Color Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-game-foreground/70 mb-2">
            Color
          </label>
          <div className="grid grid-cols-8 gap-2">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color.id}
                className={cn(
                  "w-10 h-10 rounded-full transition-all",
                  selectedColor === color.value ? "ring-2 ring-offset-2 ring-game-primary" : "hover:scale-110"
                )}
                style={{ backgroundColor: color.value }}
                onClick={() => setSelectedColor(color.value)}
                title={color.name}
              />
            ))}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="bg-game-primary hover:bg-game-primary/90 text-white"
            onClick={handleSubmit}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CharacterCustomization;

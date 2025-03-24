
import React from 'react';
import { InteractiveObject as ObjectType } from '@/types/game';
import { cn } from '@/lib/utils';
import { CoinIcon, GemIcon, StarIcon } from 'lucide-react';

type InteractiveObjectProps = {
  object: ObjectType;
  onCollect: (objectId: string) => void;
};

const InteractiveObject: React.FC<InteractiveObjectProps> = ({ object, onCollect }) => {
  if (object.collected) return null;
  
  const handleClick = () => {
    onCollect(object.id);
  };
  
  const getIcon = () => {
    switch (object.type) {
      case 'coin':
        return <CoinIcon className="h-6 w-6 text-yellow-400" />;
      case 'gem':
        return <GemIcon className="h-6 w-6 text-blue-500" />;
      case 'star':
        return <StarIcon className="h-6 w-6 text-purple-500" />;
      default:
        return <CoinIcon className="h-6 w-6 text-yellow-400" />;
    }
  };
  
  return (
    <div 
      className={cn(
        "absolute transition-all duration-300",
        "w-8 h-8 flex items-center justify-center",
        "rounded-full cursor-pointer",
        "animate-bounce hover:scale-110",
        {
          'bg-yellow-100': object.type === 'coin',
          'bg-blue-100': object.type === 'gem',
          'bg-purple-100': object.type === 'star'
        }
      )}
      style={{
        left: `${object.position.x}px`,
        top: `${object.position.y}px`,
        zIndex: 3
      }}
      onClick={handleClick}
    >
      {getIcon()}
    </div>
  );
};

export default InteractiveObject;

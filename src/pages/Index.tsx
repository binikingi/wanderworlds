
import React, { useEffect } from 'react';
import GameCanvas from '@/components/Game/GameCanvas';

const Index = () => {
  // Add a class to the body to ensure the game takes the full viewport
  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    return () => document.body.classList.remove('overflow-hidden');
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden">
      <GameCanvas />
    </div>
  );
};

export default Index;

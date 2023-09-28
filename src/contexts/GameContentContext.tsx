//theme.tsx
import React, { createContext } from 'react';
import { GameContent } from 'types';
import content from 'assets/game-content';

const GameContentContext = createContext<GameContent>({});
export const GameContentProvider: React.FC = ({ children })=> {
  console.log('GameContentProvider:', content);
  return (
    <GameContentContext.Provider
      value={{ content }}>
      {children}
    </GameContentContext.Provider>
  );
};

export const useGameContent = () => React.useContext(GameContentContext);
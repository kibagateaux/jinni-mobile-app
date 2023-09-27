//theme.tsx
import React, { createContext } from 'react';
import { GameContent } from 'types';

const GameContentContext = createContext<GameContent>({});



export const GameContentProvider: React.FC = ({ children })=> {
    const gameContent = {
        'inventory': {
            'post-equip': {
                modal: {
                  title: "Congrats on acquiring your new item!",
                },
                items: {
                  'master-djinn-summoning-circle': ({ anonId, proof }: { anonId: string, proof: string }) => 
                      `${anonId} has summoned the Master Djinn! \n Proof: ${proof}`,
                },
            }
        }
    }
  return (
    <GameContentContext.Provider
      value={{ gameContent }}>
      {children}
    </GameContentContext.Provider>
  );
};

export const useGameContent = () => React.useContext(GameContentContext);
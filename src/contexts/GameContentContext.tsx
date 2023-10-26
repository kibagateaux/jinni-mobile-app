//theme.tsx
import React, { createContext } from 'react';
import { GameContent } from 'types';
import content from 'assets/game-content';

const GameContentContext = createContext<GameContent>(content);

type Props = {
    children?: React.ReactNode;
};
export const GameContentProvider: React.FC<Props> = ({ children }) => {
    // console.log('render Game Content Provider', content);

    return (
        <GameContentContext.Provider value={{ ...content }}>{children}</GameContentContext.Provider>
    );
};

export const useGameContent = () => React.useContext(GameContentContext);

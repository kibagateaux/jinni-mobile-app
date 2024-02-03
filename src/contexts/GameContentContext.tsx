//theme.tsx
import React, { createContext, useState } from 'react';
import { GameContent } from 'types/GameMechanics';
import content from 'assets/game-content';

interface GameContentContextProps extends GameContent {
    activeModal: ActiveModal | undefined;
    setActiveModal: (config: ActiveModal | undefined) => void;
}

const GameContentContext = createContext<GameContentContextProps>({
    ...content,
    activeModal: undefined,
    setActiveModal: () => {},
});
// const GameContentContext = createContext<GameContent>(content);

interface ActiveModal {
    name: string;
    dialogueData?: {
        title: string;
        text: string;
    };
    [key: string]: unknown; // custom props to modals
}

type Props = {
    children?: React.ReactNode;
};

export const GameContentProvider: React.FC<Props> = ({ children }) => {
    const [activeModal, setActiveModal] = useState<ActiveModal | undefined>();
    // console.log('render Game Content Provider', content);
    return (
        <GameContentContext.Provider value={{ ...content, activeModal, setActiveModal }}>
            {children}
        </GameContentContext.Provider>
    );
};

export const useGameContent = (): GameContentContextProps => React.useContext(GameContentContext);

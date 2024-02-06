import React from 'react';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { GameContentProvider } from './GameContentContext';
import { ExternalServicesProvider } from './ExternalServicesContext';

// granular exports for specific usages
export * from './AuthContext';
export * from './ThemeContext';
export * from './GameContentContext';
export * from './ExternalServicesContext';

type Props = {
    children?: React.ReactNode;
};
export const ContextProvider: React.FC<Props> = ({ children }) => {
    return (
        <ExternalServicesProvider>
            <GameContentProvider>
                <AuthProvider>
                    <ThemeProvider>{children}</ThemeProvider>
                </AuthProvider>
            </GameContentProvider>
        </ExternalServicesProvider>
    );
};

export default ContextProvider;

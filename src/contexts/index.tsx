import React from 'react';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { GameContentProvider } from './GameContentContext';
import { ExternalServicesProvider } from './ExternalServicesContext';


export const ContextProvider = ({ children }) => {
    return (
        <ExternalServicesProvider>
            <GameContentProvider>
                <AuthProvider>
                    <ThemeProvider>
                        {children}
                    </ThemeProvider>
                </AuthProvider>
            </GameContentProvider>
        </ExternalServicesProvider>
    )
};
// granular exports for specific usages
export * from "./AuthContext";
export * from "./ThemeContext";

export default ContextProvider;
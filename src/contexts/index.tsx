import React from 'react';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { GameContentProvider } from './GameContentContext';


export const ContextProvider = ({ children }) => {
    return (
        <GameContentProvider>
            <AuthProvider>
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </AuthProvider>
        </GameContentProvider>
    )
};
// granular exports for specific usages
export * from "./AuthContext";
export * from "./ThemeContext";

export default ContextProvider;
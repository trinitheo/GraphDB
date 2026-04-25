import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { authService, CurrentUser } from '../services/authService';

interface AuthContextType {
    user: CurrentUser | null;
    loading: boolean;
    login: (email: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        setLoading(false);
    }, []);

    const login = async (email: string) => {
        const loggedInUser = await authService.login(email);
        setUser(loggedInUser);
    };
    
    const logout = () => {
        authService.logout();
        setUser(null);
    };

    return React.createElement(AuthContext.Provider, { value: { user, loading, login, logout } }, children);
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
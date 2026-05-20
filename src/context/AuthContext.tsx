import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../api';

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (user: User, token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null, token: null,
    login: () => { }, logout: () => { },
    isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem('el_user');
        return stored ? JSON.parse(stored) : null;
    });
    const [token, setToken] = useState<string | null>(
        () => localStorage.getItem('el_token')
    );

    function login(user: User, token: string) {
        setUser(user);
        setToken(token);
        localStorage.setItem('el_user', JSON.stringify(user));
        localStorage.setItem('el_token', token);
    }

    function logout() {
        setUser(null);
        setToken(null);
        localStorage.removeItem('el_user');
        localStorage.removeItem('el_token');
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
"use client"

import { unstable_createNodejsStream } from "next/dist/compiled/@vercel/og";
import React, { ReactNode, createContext, useContext, useReducer } from "react";

type UserData = {
    name: string
}

type AuthState = {
    isAuthenticated: boolean;
    userData: UserData | undefined
};

type AuthAction = {
    type: "LOGIN" | "LOGOUT";
    userData: UserData | undefined
};

const initialState: AuthState = {
    isAuthenticated: false,
    userData: undefined
};

const AuthContext = createContext<AuthState>(initialState);
const AuthDispatchContext = createContext<React.Dispatch<AuthAction> | undefined>(
    undefined
);

function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case "LOGIN":
            return { 
                isAuthenticated: true, 
                userData: action.userData
            };
        case "LOGOUT":
            return {
                isAuthenticated: false,
                userData: undefined
            };
        default:
            throw new Error(`Unhandled action type: ${action.type}`);
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    return (
        <AuthContext.Provider value={state}>
            <AuthDispatchContext.Provider value={dispatch}>
                {children}
            </AuthDispatchContext.Provider>
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

export function useAuthDispatch() {
    return useContext(AuthDispatchContext);
}



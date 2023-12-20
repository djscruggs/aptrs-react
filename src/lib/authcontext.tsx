// AuthContext.tsx
import React, { createContext } from 'react';
import {AuthUser} from './data/api'


interface AuthProviderProps {
  children: React.ReactNode; // Include children property here
}

export function authenticated() {
  return AuthUser()?.access
}
export const AuthContext = createContext(authenticated()); 


export const AuthProvider: React.FC<AuthProviderProps> = ({children }) => { // Use AuthProviderProps interface
  const isAuthenticated = authenticated()
  

  return (
    <AuthContext.Provider value={isAuthenticated}>
      {children}
    </AuthContext.Provider>
  );
};

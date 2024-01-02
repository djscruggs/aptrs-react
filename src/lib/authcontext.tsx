// AuthContext.tsx
import React, { createContext } from 'react';
import {AuthUser} from './data/api'



export function authenticated() {
  return Boolean(AuthUser()?.access)
}
export const AuthContext = createContext(authenticated()); 

interface AuthProviderProps {
  children: React.ReactNode; 
}
export const AuthProvider: React.FC<AuthProviderProps> = ({children }) => { // Use AuthProviderProps interface
  const isAuthenticated = authenticated()
  return (
    <AuthContext.Provider value={isAuthenticated}>
      {children}
    </AuthContext.Provider>
  );
};

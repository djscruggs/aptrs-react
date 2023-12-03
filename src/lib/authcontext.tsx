// AuthContext.tsx
import React, { createContext } from 'react';


interface AuthProviderProps {
  children: React.ReactNode; // Include children property here
}

export function authenticated() {
  return (sessionStorage.getItem('access') != null)
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

// AuthContext.tsx
import React, { createContext, useState } from 'react';

interface AuthContextProps {
  isAuthenticated: boolean;
  // Other authentication-related data or functions
}

interface AuthProviderProps {
  children: React.ReactNode; // Include children property here
}


export const AuthContext = createContext<AuthContextProps | undefined>(undefined); // Set initial value to undefined

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => { // Use AuthProviderProps interface
  const [isAuthenticated] = useState<boolean>(false);
  // Add authentication logic here (login, logout, etc.)

  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

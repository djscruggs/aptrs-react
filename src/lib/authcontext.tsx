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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  localStorage.setItem('authenticated','false') 
  if(localStorage.getItem('authenticated') === 'true'){
    setIsAuthenticated(true)
  }

  // Add authentication logic here (login, logout, etc.)
  

  return (
    <AuthContext.Provider value={{isAuthenticated}}>
      {children}
    </AuthContext.Provider>
  );
};
export async function login(username:string, password: string) {
  localStorage.setItem('authenticated','false');
  const url = 'https://aptrsapi.souravkalal.tech/api/auth/login/';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  const result = await response.json();
  // api returns loging failures like so
  // {detail:"No active account found with the given credentials"}
  if(result?.detail){
    return null;
  } else {
    localStorage.setItem('authenticated','true');
  }

  return result;
}
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
export async function login(formData: FormData) {
  console.log(Object.fromEntries(formData))
  const { username, password } = { username: formData.get('username'), password: formData.get('password') };
  const url = 'https://aptrsapi.souravkalal.tech/api/auth/login/';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  const result = await response.json() as User;
  
  return {
    message: 'Server error'
  };
}
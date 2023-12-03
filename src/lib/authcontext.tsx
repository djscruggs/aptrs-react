// AuthContext.tsx
import React, { createContext } from 'react';


interface AuthProviderProps {
  children: React.ReactNode; // Include children property here
}

export function authenticated(state = null) {
  if(state !== null){
    if(state === true){
      sessionStorage.setItem('authenticated', 'true')  
    } else {
      sessionStorage.setItem('authenticated', 'false')  
    }
  }

  return (sessionStorage.getItem('authenticated') === 'true')
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
export async function login(username:string, password: string) {
  sessionStorage.setItem('authenticated','false');
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
    sessionStorage.setItem('authenticated','true');
  }

  return result;
}
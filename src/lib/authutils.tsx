// authUtils.tsx
import { Navigate } from 'react-router-dom';
import { authenticated } from './authcontext';

export function withAuth(Component: React.ComponentType<any>): React.FC<any> {
  const WithAuth: React.FC<any> = (props) => {
    const isAuthenticated = authenticated();
    if (!isAuthenticated) {
      // Redirect to the login page if not authenticated
      return <Navigate to="/login" replace />;
    }

    // Render the component if authenticated
    return <Component {...props} />;
  };

  return WithAuth;
}
export async function login(username:string, password: string) {
  const url = 'https://aptrsapi.souravkalal.tech/api/auth/login/';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  const result = await response.json();
  console.log(result)
  // api returns loging failures like so
  // {detail:"No active account found with the given credentials"}
  if(result?.detail){
    return null;
  } else {
    sessionStorage.setItem('authenticated','true');
  }

  return result;
}
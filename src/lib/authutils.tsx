// authUtils.tsx
import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './authcontext';

export function withAuth(Component: React.ComponentType<any>): React.FC<any> {
  const WithAuth: React.FC<any> = (props) => {
    const authContext = useContext(AuthContext);
    const isAuthenticated = authContext?.isAuthenticated ?? false; // Fallback to false if context is undefined

    if (!isAuthenticated) {
      // Redirect to the login page if not authenticated
      return <Navigate to="/login" replace />;
    }

    // Render the component if authenticated
    return <Component {...props} />;
  };

  return WithAuth;
}

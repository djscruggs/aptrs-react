// authUtils.tsx
import { Navigate } from 'react-router-dom';
import { authenticated } from './authcontext';

export function withAuth(Component: React.ComponentType<any>): React.FC<any> {
  const WithAuth: React.FC<any> = (props) => {
    const isAuthenticated = authenticated();
    if (!isAuthenticated) {
      // Redirect to the login page if not authenticated
      localStorage.setItem('redirect',document.location.pathname)
      return <Navigate to="/login" replace />;
    }

    // Render the component if authenticated
    return <Component {...props} />;
  };

  return WithAuth;
}

// authUtils.tsx
import { Navigate } from 'react-router-dom';
import { authenticated } from './authcontext';


export function withAuth(Component: React.ComponentType<any>): React.FC<any> {
  const WithAuth: React.FC<any> = (props) => {
    const isAuthenticated = authenticated();
    if (!isAuthenticated) {
      //capture the current path in localStorage to redirect to after auth
      localStorage.setItem('redirect',document.location.pathname)
      // Redirect to the login page if not authenticated
      return <Navigate to="/login" replace />;
    }

    // Render the component if authenticated
    return <Component {...props} />;
  };

  return WithAuth;
}

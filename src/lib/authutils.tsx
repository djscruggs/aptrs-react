// authUtils.tsx
import { Navigate } from 'react-router-dom';
import {authenticated} from '../lib/authcontext'
import { useNavigate } from 'react-router-dom';

export function withAuth(Component: React.ComponentType<any>): React.FC<any> {
  const WithAuth: React.FC<any> = (props) => {
    const isAuthenticated = authenticated();
    const navigate = useNavigate()
    
    if (!isAuthenticated) {
      //capture the current path in localStorage to redirect to after auth
      localStorage.setItem('redirect',document.location.pathname)
      // Redirect to the login page if not authenticated
      const relogin = true;
      return <Navigate to="/" replace={true} state={{ relogin }} />;
      
    }

    // Render the component if authenticated
    return (
            <>
            {isAuthenticated &&
            <Component {...props} />
            }
            </>)
  };

  return WithAuth;
}

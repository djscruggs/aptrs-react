import SideNav from './sidenav'; 
import { Toaster } from 'react-hot-toast';
import { AuthUser } from '../lib/data/api';
import {getInitials} from '../lib/utilities'
import { Link, useLocation } from 'react-router-dom';
import { authenticated} from '../lib/authcontext'
import { useContext } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}
const Layout: React.FC<LayoutProps> = ({ children}) => {
  const location = useLocation()
  const isAuthenticated = authenticated()
  return (
        <>
          <Toaster />
          <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
              {location.pathname !== '/' &&
                <div className="w-full flex-none md:w-64">
                  <SideNav />
                </div>
              }   
              
            <div className="flex-grow p-6 md:overflow-y-auto md:p-12 cursor-pointer">
                {isAuthenticated &&
                  <div className="avatar placeholder absolute top-0 right-0 mt-8 mr-14">
                    <div className="bg-secondary text-neutral-content rounded-full w-12">
                      <Link to="/profile">{getInitials(AuthUser().full_name)}</Link>
                    </div>
                  </div> 
                }
              {children}
            </div>
          </div>
        </>
  );
};

export default Layout;

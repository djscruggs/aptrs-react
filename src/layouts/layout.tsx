import SideNav from './sidenav'; 
import { Toaster } from 'react-hot-toast';
import { useCurrentUser } from '../lib/customHooks';
import {getInitials, avatarUrl} from '../lib/utilities'
import { Link } from 'react-router-dom';
import { Avatar } from '@material-tailwind/react';


interface LayoutProps {
  children: React.ReactNode;
}
const Layout: React.FC<LayoutProps> = ({ children}) => {
  const currentUser = useCurrentUser()
  // can't use useLocation here because the layout it outside of the  Router in App.tsx
  const location = document.location
  
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
                {currentUser &&
                  <div className="avatar placeholder absolute top-0 right-0 pt-8 pr-14 flex items-center justify-center">
                     {currentUser.profilepic && 
                        <Link className='text-white' to="/profile">
                          <Avatar src={avatarUrl(currentUser.profilepic)} size="lg"/>
                        </Link>
                      }
                      {!currentUser.profilepic &&
                        <div className="bg-primary text-neutral-content rounded-full w-12 h-12 flex items-center justify-center">
                          <Link className='text-white' to="/profile">
                            {getInitials(currentUser.full_name)}
                          </Link>
                        </div>
                      }
                  </div>
                }
              {children}
            </div>
          </div>
        </>
  );
};

export default Layout;

import SideNav from './sidenav'; 
import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useCurrentUser } from '../lib/customHooks';
import { getInitials, avatarUrl } from '../lib/utilities'
import { Link } from 'react-router-dom';
import { Avatar } from '@material-tailwind/react';
import { useEffect, useState, useContext } from 'react';
import {LoginUser} from '../lib/data/definitions'
import { ThemeContext, ThemeIcon } from '../lib/theme';

const Layout: React.FC = () => {
  const theme = useContext(ThemeContext)
  console.log('theme in layout', theme)
  const [currentUser, setCurrentUser] = useState<LoginUser | null>(useCurrentUser())
  // can't use useLocation here because the layout is outside of the  Router in App.tsx
  const location = useLocation();
  useEffect(() => {
    const user = useCurrentUser()
    setCurrentUser(user)
  }, [location.pathname])
   
  return (
        <>
          <ThemeContext.Provider value={theme}>
            <Toaster />
            <div className="flex h-screen flex-col md:flex-row md:overflow-hidden dark:bg-gray-darkest dark:text-white">
              
                {location.pathname !== '/' &&
                  <div className="w-full flex-none md:w-64">
                    <SideNav />
                  </div>
                }   
                
              <div className="flex-grow p-6 md:overflow-y-auto md:p-12 cursor-pointer">
                  {currentUser &&
                    <>
                      <div className='md:absolute top-6 right-32'>
                        <ThemeIcon size='md'/>
                      </div>

                      <div className="md:flex md:items-center md:justify-center avatar placeholder absolute top-0 right-0 pt-4 pr-14 hidden ">
                        {currentUser.profilepic && 
                            <Link className='text-white' to="/profile">
                              <Avatar src={avatarUrl(currentUser.profilepic as string)} size="lg"/>
                            </Link>
                          }
                          {!currentUser.profilepic &&
                            <div className="bg-primary text-neutral-content rounded-full w-12 h-12 flex items-center justify-center">
                              <Link className='text-white' to="/profile">
                                {getInitials(currentUser.full_name as string)}
                              </Link>
                            </div>
                          }
                      </div>
                      </>
                    }
                <div className='mt-10'>
                  <Outlet />
                </div>
              </div>
            </div>
          </ThemeContext.Provider>
        </>
  );
};

export default Layout;

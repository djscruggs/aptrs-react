import SideNav from './sidenav'; 
import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useCurrentUser } from '../lib/customHooks';
import { getInitials, avatarUrl } from '../lib/utilities'
import { Link } from 'react-router-dom';
import { Avatar } from '@material-tailwind/react';
import { useEffect, useState, useContext, createContext } from 'react';
import {LoginUser} from '../lib/data/definitions'
import { ThemeIcon } from '../components/themeIcon';

export const ThemeContext = createContext('light')
const Layout: React.FC = () => {
  
  const [theme, setTheme] = useState('light')
  const toggleTheme = () => {
    if(theme === 'light'){
      document.documentElement.classList.add('dark')
      setTheme('dark')
    } else {
      document.documentElement.classList.remove('dark')
      setTheme('light')
    }
  }
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark')
      setTheme('dark')
    }
  }, [])
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
                    <SideNav theme={theme} toggleTheme={toggleTheme} />
                  </div>
                }   
                
              <div className="flex-grow p-6 md:overflow-y-auto md:p-12 cursor-pointer">
                  {currentUser &&
                    <>
                      <div className='hidden md:block md:absolute md:top-6 md:right-32'>
                        <ThemeIcon size='md' theme={theme} toggleTheme={toggleTheme}/>
                      </div>

                      <div className="md:flex md:items-center md:justify-center avatar placeholder absolute top-0 right-0 pt-4 pr-14 hidden">
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
                <div className='mt-10 z-10 bg-white dark:bg-gray-darkest'>
                  <Outlet />
                </div>
              </div>
            </div>
          </ThemeContext.Provider>
        </>
  );
};

export default Layout;

import SideNav from './sidenav'; 
import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useCurrentUser } from '../lib/customHooks';
import {getInitials, avatarUrl} from '../lib/utilities'
import { Link } from 'react-router-dom';
import { Avatar } from '@material-tailwind/react';
import { useEffect, useState, createContext } from 'react';
import {LoginUser} from '../lib/data/definitions'
import {MoonIcon, SunIcon} from '@heroicons/react/24/solid'
export const ThemeContext = createContext('light');
const Layout: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<LoginUser | null>(useCurrentUser())
  // can't use useLocation here because the layout is outside of the  Router in App.tsx
  const location = useLocation();
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
                  <div className='absolute top-4 right-32'>
                  {theme === 'light' ? <SunIcon className='w-10 h-10' onClick={toggleTheme} /> : <MoonIcon className='w-10 h-10' onClick={toggleTheme} />}
                  </div>
                  {currentUser &&
                    <div className="avatar placeholder absolute top-0 right-0 pt-4 pr-14 flex items-center justify-center">
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
                  }
                <Outlet />
              </div>
            </div>
          </ThemeContext.Provider>
        </>
  );
};

export default Layout;

// SideNav.tsx
import React from 'react';
import NavLinks from './navlinks';
import { PowerIcon } from '@heroicons/react/24/outline';
import {logout} from '../lib/data/api'
import Button from '../components/button';
import { useCurrentUser } from '../lib/customHooks';

const SideNav: React.FC = () => {
  const currentUser = useCurrentUser()
  
  const handleSignOut = () => {
    logout();

    document.location='/'
  }
  
  return (
    <>
      {currentUser &&
        <div className="flex h-full flex-col px-3 py-4 md:px-2">
          <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
            <NavLinks />
            <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
            {currentUser && (
              <Button
                className="bg-brand-light"
                onClick={handleSignOut}
              >
                <PowerIcon className="w-6" />
                <div className="hidden md:block">Sign Out</div>
              </Button>
            )}
          </div>
        </div>
      }
    </>  
  );
};

export default SideNav;

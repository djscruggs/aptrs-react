// SideNav.tsx
import React, { useContext } from 'react';
import { AuthContext } from '../lib/authcontext'; // Update the path accordingly
import NavLinks from './navlinks';
import AcmeLogo from './acme-logo'; // Assuming AcmeLogo component is present
import { PowerIcon } from '@heroicons/react/24/outline';

const SideNav: React.FC = () => {
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated ?? false; // Fallback to false if context is undefined

  
  const handleSignOut = () => {
    // Implement sign-out logic here
    // For example: signOut();
  };

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
        {isAuthenticated && (
          <button
            className="flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3"
            onClick={handleSignOut}
          >
            <PowerIcon className="w-6" />
            <div className="hidden md:block">Sign Out</div>
          </button>
        )}
      </div>
    </div>
  );
};

export default SideNav;

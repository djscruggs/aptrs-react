// NavLinks.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  UserGroupIcon,
  BuildingOfficeIcon,
  RocketLaunchIcon,
  CircleStackIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { useCurrentUser } from '../lib/customHooks';
import clsx from 'clsx';
// ... (Icons and other imports)
import { ThemeIcon } from '../components/themeIcon';

interface NavLinksProps {
  theme: string;
  toggleTheme: () => void;
}

const NavLinks: React.FC<NavLinksProps> = ({ theme, toggleTheme }) => {
  
  const pathname = useLocation().pathname;
  const currentUser = useCurrentUser()
  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: RocketLaunchIcon },
    {name: 'Companies', href: '/companies', icon: BuildingOfficeIcon },
    { name: 'Customers', href: '/customers', icon: UserGroupIcon },
    { name: 'Projects', href: '/projects', icon: RocketLaunchIcon },
    { name: 'Vulnerability DB', href: '/vulnerabilities', icon: CircleStackIcon },
    ...(currentUser?.isAdmin ? [{ name: 'Users', href: '/users', icon: UsersIcon}] : [])
  ];
  
  

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            to={link.href}
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'bg-sky-100 text-blue-600': pathname === link.href,
              }
            )}
            key={link.name} // Add a unique key
          >
            <LinkIcon className="w-6 md:w-8" />
            <p className="hidden md:block md:text-md">{link.name}</p>
          </Link>
        );
      })}
      <div className='h-[48px] md:hidden mt-1.5'>
        <ThemeIcon theme={theme} toggleTheme={toggleTheme}/>
      </div>
    </>
  );
};

export default NavLinks;

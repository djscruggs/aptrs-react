// NavLinks.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  UserGroupIcon,
  HomeIcon,
  BuildingOfficeIcon,
  RocketLaunchIcon,
  CircleStackIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
// ... (Icons and other imports)

const links = [
  { name: 'Home', href: '', icon: HomeIcon },
  { name: 'Dashboard', href: '/dashboard', icon: RocketLaunchIcon },
  {
    name: 'Companies',
    href: '/dashboard/companies',
    icon: BuildingOfficeIcon,
  },
  { name: 'Customers', href: '/dashboard/customers', icon: UserGroupIcon },
  { name: 'Projects', href: '/dashboard/projects', icon: RocketLaunchIcon },
  { name: 'Vulnerability DB', href: '/dashboard/vdb', icon: CircleStackIcon },
];


const NavLinks: React.FC = () => {
  
  const pathname = useLocation().pathname;
  console.log('pathname')
  console.log(pathname)

  

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
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
};

export default NavLinks;

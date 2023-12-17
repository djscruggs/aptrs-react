import SideNav from './sidenav'; 
import { Toaster } from 'react-hot-toast';

interface LayoutProps {

  children: React.ReactNode;
  isAuthenticated?: boolean;
  // Other props if applicable
}
const Layout: React.FC<LayoutProps> = ({isAuthenticated = false, children}) => {
  return (
    <>
    <Toaster />
      <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
          
          {isAuthenticated && document.location.pathname !== '/login' &&
            <div className="w-full flex-none md:w-64">
              <SideNav />
            </div>
          }   
        <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
      </div>
    </>
  );
};

export default Layout;

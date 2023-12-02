import SideNav from './sidenav'; 


interface LayoutProps {

  children: React.ReactNode;
  isAuthenticated?: boolean;
  // Other props if applicable
}
const Layout: React.FC<LayoutProps> = ({isAuthenticated, children}) => {
  
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      
        {isAuthenticated &&
          <div className="w-full flex-none md:w-64">
            <SideNav />
          </div>
        }   
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
    </div>
  );
};

export default Layout;

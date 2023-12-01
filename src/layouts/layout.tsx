import SideNav from './sidenav'; 


interface LayoutProps {
  children: React.ReactNode;
  // Other props if applicable
}
const Layout: React.FC<LayoutProps> = ({ children }) => {
  
  return (
    <div>
      <SideNav />
      <main>{children}</main>
      {/* Other common layout components or structure */}
    </div>
  );
};

export default Layout;

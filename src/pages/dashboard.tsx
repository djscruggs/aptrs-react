import { withAuth } from "../lib/authutils";
import { Projects } from "./projects";
import SearchBar from "../components/searchbar";


const Dashboard = () => {
  const handleSearch = (term='') => {
    console.log('search for', term)
  }
  return (
    <>
      <div className="w-full">
        <div className='-mt-8 mb-8 max-w-lg'>
          <SearchBar onSearch={handleSearch} placeHolder="Search projects"/>
        </div>
       
        <div className="w-full my-4">
          <h2 className="mb-2">Latest Projects</h2>
          
        
        </div>
        <div className="w-fullx">
          <Projects pageTitle='' hideActions={true}/>
        </div>
        
            

      </div>
    </>
  )
};

export default withAuth(Dashboard);
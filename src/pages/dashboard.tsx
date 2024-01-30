import { withAuth } from "../lib/authutils";
import { useState } from "react";
import { Projects } from "./projects";
import SearchBar from "../components/searchbar";


const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [refresh, setRefresh] = useState(false)
  const handleSearch = (term='') => {
    setSearchTerm(term)
  }
  return (
    <>
      <div className="w-full">
        <div className='-mt-8 mb-8 max-w-lg'>
        <SearchBar onSearch={handleSearch} onClear={()=>setRefresh(true)} searchTerm={searchTerm} />
        </div>
       
        <div className="w-full my-4">
          <h2 className="mb-2">Latest Projects</h2>
          
        
        </div>
        <div className="w-fullx">
          <Projects pageTitle='' hideActions={true} refresh={refresh} searchTerm={searchTerm}/>
        </div>
        
            

      </div>
    </>
  )
};

export default withAuth(Dashboard);
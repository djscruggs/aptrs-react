import { withAuth } from "../lib/authutils";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Projects } from "./projects";
import SearchBar from "../components/searchbar";


const Dashboard = () => {
  const navigate = useNavigate()
  const searchParams = new URLSearchParams(location.search);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('name') || '')
  console.log('searchTerm', searchTerm)
  const clearSearch = () => {
    console.log("clearing in dashboard")
    setSearchTerm('')
    navigate('/dashboard', {replace: true})
  }
  const handleSearch = (term='') => {
    setSearchTerm(term)
  }
  // useEffect(() => {
  //   if (queryParams.name) {
  //     setSearchTerm(queryParams.name);
  //   }
  // }, [queryParams.name]);
  console.log('searchTerm is now', searchTerm)
  return (
    <>
      <div className="w-full">
        <div className='-mt-8 mb-8 max-w-lg'>
        <SearchBar onSearch={handleSearch} onClear={clearSearch} searchTerm={searchTerm} />
        </div>
       
        <div className="w-full my-4">
          <h2 className="mb-2">Latest Projects</h2>
          
        
        </div>
        <div className="w-fullx">
          <Projects pageTitle='' hideActions={true} searchTerm={searchTerm}/>
        </div>
        
            

      </div>
    </>
  )
};

export default withAuth(Dashboard);
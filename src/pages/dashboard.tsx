import { withAuth } from "../lib/authutils";

import { LatestInvoicesSkeleton } from '../components/skeletons';
const Dashboard = () => {
  const searchBar = () => {

  }
  return (
    <>
      <h1>Dashboard</h1>
      
      <div className="w-full">
        
      <div className="w-full my-4">
        <h2 className="mb-2">Latest Projects</h2>
        <input className="p-2 border-2 border-gray-400 rounded-md" type="text" onClick={searchBar} placeholder="Search..." size={50}></input>
      </div>
      <div className="w-fullx">
        <LatestInvoicesSkeleton />
      </div>
        
            

      </div>
    </>
  )
};

export default withAuth(Dashboard);
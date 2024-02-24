import { withAuth } from "../lib/authutils";
import { Projects } from "./projects";

import PageTitle from '../components/page-title';

const Dashboard = () => {
  
  return (
    <>
      <div className="w-full">
        <div className="w-full my-4">
          <PageTitle title={'Latest Projects'} />
        </div>
        <div className="w-fullx">
          <Projects pageTitle='' embedded={true} />
        </div>
        
            

      </div>
    </>
  )
};

export default withAuth(Dashboard);
import { withAuth } from "../lib/authutils";
const Dashboard = () => {
  return <h1>Dashboard</h1>;
};

export default withAuth(Dashboard);
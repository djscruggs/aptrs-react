import { withAuth } from "../lib/authutils";
const Customers = () => {
  return <h1>Customers</h1>;
};

export default withAuth(Customers);
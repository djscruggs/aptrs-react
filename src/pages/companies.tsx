import { withAuth } from "../lib/authutils";
const Companies = () => {
  return <h1>Companies</h1>;
};

export default withAuth(Companies);
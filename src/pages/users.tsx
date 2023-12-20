import { withAuth } from "../lib/authutils";
const Users = () => {
  return <h1>Users</h1>;
};

export default withAuth(Users);
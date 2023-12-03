import { withAuth } from "../lib/authutils";
const Projects = () => {
  return <h1>Projects</h1>;
};

export default withAuth(Projects);
import { withAuth } from "../lib/authutils";
const Vulnerabilities = () => {
  return <h1>Vulnerabilities</h1>;
};

export default withAuth(Vulnerabilities);
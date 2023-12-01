import { withAuth } from "../lib/authutils";
const VulnerabilityDB = () => {
  return <h1>VulernabilityDB</h1>;
};

export default withAuth(VulnerabilityDB);
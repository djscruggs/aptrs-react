import { withAuth } from "../lib/authutils";
const Vulnerabilities = () => {
  
  // Title: The title of the vulnerability.
  // Description: A description of the vulnerability.
  // CVSS 3.1: The CVSS 3.1 score for the vulnerability.
  // Status: The status of the vulnerability (i.e., Vulnerable, Confirmed Fixed, Accepted Risk).
  // Solution: A description of the solution for the vulnerability.
  // Reference Link: A link to the reference documentation for the vulnerability.

  return <h1>Vulnerabilities</h1>;
};

export default withAuth(Vulnerabilities);
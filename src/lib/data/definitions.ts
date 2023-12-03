
export type JsonResponse = {
  
}
export type Project = {
  id: number;
  name: string;
  description: string;
  projecttype: string; //maybe enum "Web Application Penetration Testing"
  startdate: string;
  enddate: string;
  testingtype: string; //maybe enum "Black Box",
  projectexception: string; //" empty string in test"
  companyname: string; // "OWASP" -- shouldnt this be an id?
  owner: string; //"admin" -- shouldnt this be an id?
};

export type User = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_superuser: boolean;
}
export type Profile = {
  id: number;
  profilepic: string
  number: string;
  company: string;
  user: number; //user id
}

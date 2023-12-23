
import{ ReactNode } from 'react';

export type Vulnerability = {
  id: number;
  vulnerabilityname: string;
  vulnerabilityseverity: string;
  vulnerabilitydescription: string;
  vulnerabilitysolution: string;
  vulnerabilityreferlnk: string;
  cvssscore: number;
  cvssvector: string;
};

export type Props = {
  children: ReactNode;
};

export type JsonResponse = {
  
}
export interface Project  {
  id?: number;
  name: string;
  status: string;
  description: string;
  projecttype: string; //maybe enum "Web Application Penetration Testing"
  startdate: string;
  enddate: string;
  testingtype: string; //maybe enum "Black Box",
  projectexception: string; //" empty string in test"
  companyname: string; // "OWASP" -- shouldnt this be an id?
  owner: string; //"admin" -- shouldnt this be an id?
};
export interface Company  {
  id?: number;
  name?: string;
  img?: string;
  address?: string; 
};

export interface Customer  {
  id?: number;
  name?: string;
  email?: string;
  phoneNumber?: string;
  position?: string;
  company?: string; 
};

export type ProjectScope = {
  id: number;
  scopt: string; //url?
  description: string;
};

export type Profile = {
  id: number;
  profilepic: string
  number: string;
  company: string;
  user: number; //user id
}

//react data table types
export type Column = { //used for data tables
  name: string;
  selector: (row: any) => any;
  sortable?: boolean
  maxWidth?: string
  omit?: boolean
};
export type User = {
  id?: number;
  username?: string;
  full_name?: string;
  email?: string;
  is_staff?: boolean;
  is_active?: boolean;
  is_superuser?: boolean;
  profilepic?: string;
  number?: string;
  company?: string;
  position?: string;
  groups?: string[];
};
export type LoginUser = User & {
  refresh?: string;
  access?: string;
  Status?: string;
  Pic?: string;
  isAdmin?: boolean;
  permissions?: string[];
};

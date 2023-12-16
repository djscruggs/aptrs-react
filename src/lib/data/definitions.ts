
import{ ReactNode } from 'react';

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

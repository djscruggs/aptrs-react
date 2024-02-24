
import{ ReactNode } from 'react';

export type Vulnerability = {
  id?: number | null;
  vulnerabilityname: string;
  vulnerabilityseverity?: string;
  vulnerabilitydescription?: string;
  vulnerabilitysolution?: string;
  vulnerabilityreferlnk?: string;
  cvssscore?: number | string | null;
  cvssvector?: string | null;
};
export type ProjectVulnerability = Omit<Vulnerability, 'id'> & {
  project: number | string;
  poc?: string
  instance?:VulnerabilityInstance[];
};
export type VulnerabilityInstance =  { 
  id?: string | number | undefined
  URL: string;
  Parameter?: string;
  status: "Vulnerable" | "Confirm Fixed" | "Accepted Risk" | undefined;
  error?: boolean;
}
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
  full_name?: string;
  email?: string;
  number?: string;
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

export type PermissionGroup = {
  id?: number;
  name: string
  description: string;
  list_of_permissions: string;
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
  location? : IPAddressInfo
}
export type IPAddressInfo = {
  ip: string;
  network: string;
  version: string;
  city: string;
  region: string;
  region_code: string;
  country: string;
  country_name: string;
  country_code: string;
  country_code_iso3: string;
  country_capital: string;
  country_tld: string;
  continent_code: string;
  in_eu: boolean;
  postal: string;
  latitude: number;
  longitude: number;
  timezone: string;
  utc_offset: string;
  country_calling_code: string;
  currency: string;
  currency_name: string;
  languages: string;
  country_area: number;
  country_population: number;
  asn: string;
  org: string;
}
export type LoginUser = User & {
  refresh?: string;
  access?: string;
  Status?: string;
  Pic?: string;
  isAdmin?: boolean;
  permissions?: string[];
};
export interface QueryParams{
  limit: number;
  offset: number;
}
export interface ProjectsQueryParams extends QueryParams {
  name?: string;
  companyname?: string;
  projecttype?: string;
  testingtype?: string;
  owner?: string;
  status?: string;
  startdate?: string;
  enddate_before?: string;
  [key: string]: string | number | undefined;
}
export interface VulnQueryParams extends QueryParams {
  id?: number;
  vulnerabilityname?: string;
  vulnerabilityseverity?: string;
  vulnerabilitydescription?: string;
  vulnerabilitysolution?: string;
  vulnerabilityreferlnk?: string;
  cvssscore?: number
  cvssvector?: string ;
  [key: string]: string | number | undefined;
}

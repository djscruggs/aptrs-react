import {  Company, 
          Project, 
          User, 
          LoginUser, 
          IPAddressInfo,
          Vulnerability} from './definitions'
import axios, { AxiosError } from 'axios'



function apiUrl(endpoint = ''): string {
  return process.env.REACT_APP_API_URL + endpoint;
}
function authHeaders(): { headers: Record<string, string> } {
  const token = AuthUser()?.access;
  const header = { headers: {'Authorization': `Bearer ${token}`} }
  return header;
}

export function setAuthUser(user: LoginUser): void {
  const jsonUser = JSON.stringify(user);
  localStorage.setItem('user', jsonUser);
}

export function AuthUser(): any | undefined {
  const jsonUser = localStorage.getItem('user');
  if(jsonUser !== null) {
    return JSON.parse(jsonUser) as LoginUser;
  }
  return null;
}

export async function login(email: string, password:string) {
  const url = apiUrl('auth/login/');
  // login failure throws a 401 unauthorized exception
  // catch it here and return boolean; otherwise throw error
  let result
  try {
    const response = await axios.post(url, { email, password })
    result = response.data;
  } catch (error: any | unknown){
    if (axios.isAxiosError(error)) {
      if(error.response?.status == 401) {
        return false;
      } 
    }
    throw error;
  }
  if(!result?.access){
    return false;
  } else {
    const user = result as LoginUser;
    user.email = email;
    //now get the user's location
    const location = await getUserLocation()
    user.location = location as IPAddressInfo
    setAuthUser(user)
    //now get the profile info
    const profile = await getMyProfile()
    const mergedUser: User = {
      ...user,
      ...profile
    }
    setAuthUser(mergedUser)
    return result;
  }
}

export function logout() {
  localStorage.removeItem('user');
}

export async function fetchCustomers() {
  const url = apiUrl('customer/all-customer');
  const response = await axios.get(url,authHeaders());
  return response.data;
}
export async function getUserLocation(){ 
    const response = await axios.get("https://ipapi.co/json/")
    return response.data
}
export async function getCustomer(id: string | undefined) {
  if(!id) return null;
  const url = apiUrl(`customer/customer/${id}/`);
  const response = await axios.get(url, authHeaders())
  return response.data;
}
export async function upsertCustomer(formData: Company): Promise<any> {
  let url = apiUrl(`customer/customer/add`);
  
  if (Object.keys(formData).includes('id')) {
    url = apiUrl(`customer/customer/edit/${formData['id']}/`);
  }
  const response = await axios.post(url, formData, authHeaders())
  return response.data;    
}
export async function fetchProjects() {
  const url = apiUrl('project/get-projects/');
  const response = await axios.get(url,authHeaders());
  return response.data;
}
export async function getProject(id: string | undefined) {
  if(!id) return null;
  const url = apiUrl(`project/get-project/${id}/`);
  const response = await axios.get(url, authHeaders())
  return response.data;
}
export async function upsertProject(formData: Project): Promise<any> {
  let url = apiUrl(`project/add-project`);
  if (Object.keys(formData).includes('id')) {
    url = apiUrl(`project/edit-project/${formData['id']}/`);
  }

  const response = await axios.post(url, formData, authHeaders());
  return response.data;
}

export async function fetchCompanies() {
  const url = apiUrl('customer/all-company');
  const response = await axios.get(url, authHeaders());
  return response.data;
}

export async function getCompany(id: string | undefined) {
  if (!id) return null;
  const url = apiUrl(`customer/company/${id}/`);
  const response = await axios.get(url, authHeaders());
  return response.data;
}

export async function upsertCompany(formData: Company): Promise<any> {
  let url = apiUrl(`customer/company/add`);
  if (Object.keys(formData).includes('id')) {
    url = apiUrl(`customer/company/edit/${formData['id']}/`);
  }
  const response = await axios.post(url, formData, authHeaders());
  return response.data;
}

export async function deleteCompanies(ids: any[]): Promise<any> {
  const url = apiUrl('customer/company/delete');
  const config = {
    headers: authHeaders().headers,
    data: ids,
  };
  const response = await axios.delete(url, config);
  return response.data;
}

export async function fetchVulnerabilities() {
  const url = apiUrl('vulndb/all-vulndb');
  const response = await axios.get(url, authHeaders());
  return response.data;
}
export async function getVulnerability(id: string | undefined) {
  if (!id) return null;
  const url = apiUrl(`vulndb/${id}/`);
  const response = await axios.get(url, authHeaders());
  console.log(response.data)
  return response.data;
}

export async function upsertVulnerability(formData: Vulnerability): Promise<any> {
  let url = apiUrl(`vulndb/add-vulndb`);
  if (Object.keys(formData).includes('id')) {
    url = apiUrl(`vulndb/edit-vulndb/${formData['id']}/`);
  }
  const response = await axios.post(url, formData, authHeaders());
  return response.data;
}

export async function fetchUsers() {
  const url = apiUrl('auth/users');
  const response = await axios.get(url, authHeaders());
  return response.data;
}

export async function deleteUsers(ids: any[]): Promise<any> {
  const url = apiUrl('auth/deleteuser');
  const config = {
    headers: authHeaders().headers,
    data: ids,
  };
  const response = await axios.delete(url, config);
  return response.data;
}

export async function getUser(id: string | undefined) {
  if (!id) return null;
  const url = apiUrl(`auth/user/${id}`);
  const response = await axios.get(url, authHeaders());
  return response.data;
}

export async function getMyProfile() {
  const url = apiUrl(`auth/myprofile`);
  const response = await axios.get(url, authHeaders());
  return response.data;
}

export async function upsertUser(formData: User): Promise<any> {
  let temp = formData;
  delete temp.profilepic;
  let url = apiUrl(`auth/adduser`);
  if (Object.keys(formData).includes('id')) {
    url = apiUrl(`auth/edituser/${formData['id']}`);
  }
  const response = await axios.post(url, temp, authHeaders());
  return response.data;
}

export async function fetchPermissionGroups() {
  const url = apiUrl('auth/groups/list/');
  const response = await axios.get(url, authHeaders());
  return response.data;
}

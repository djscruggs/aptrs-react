import {  Company, 
          Project, 
          User, 
          LoginUser, 
          IPAddressInfo,
          Vulnerability,
          FilteredSet} from './definitions'
import axios from 'axios'


function apiUrl(endpoint:string = ''): string {
  return import.meta.env.VITE_APP_API_URL + endpoint;
}
export function uploadUrl(): string {
  return apiUrl('project/ckeditor/imageupload/')
}
export function simpleUploadConfig() {
  return {
    uploadUrl: uploadUrl(),
    withCredentials: true,
    ...authHeaders()
  }
}
export function authHeaders(): { headers: Record<string, string> } {
  const token = getAuthUser()?.access;
  const header = { headers: {'Authorization': `Bearer ${token}`} }
  return header;
}

export function setAuthUser(user: LoginUser): void {
  const jsonUser = JSON.stringify(user);
  localStorage.setItem('user', jsonUser);
  localStorage.setItem('lastRefresh', new Date().toISOString())
}

export function getAuthUser(): any | undefined {
  return _userObject()
}
//private function get the user object from local storage
function _userObject(): any | undefined {
  const jsonUser = localStorage.getItem('user');
  if(jsonUser !== null) {
    return JSON.parse(jsonUser) as LoginUser;
  }
  return null;
}

export function shouldRefreshToken(): boolean {
  const lastRefresh = localStorage.getItem('lastRefresh')
  if(!lastRefresh) return true;
  const last = new Date(lastRefresh)
  const now = new Date()
  const diff = now.getTime() - last.getTime()
  return diff > 1000 * 60 * 10
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
export async function refreshAuth() {
    const user = _userObject();
    if(!user){
      return null
    }
    if(import.meta.env.VITE_APP_ENV === 'development'){
      console.log('skipping refresh in development environment')
      return user;
    }
    try {
    const body = {refresh: user.refresh}
    const url = apiUrl('auth/token/refresh/');
    const response = await axios.post(url, body, authHeaders());
    user.refresh = response.data.refresh
    user.access = response.data.access
    setAuthUser(user)
    return user;
  } catch (error) {
    logout()
    return null
  }
}
export function logout() {
  localStorage.removeItem('user');
  localStorage.removeItem('lastRefresh');
}

export async function fetchCustomers() {
  const url = apiUrl('customer/all-customer');
  const response = await axios.get(url,authHeaders());
  return response.data;
}
export async function fetchFilteredCustomers(params: Record<string, any>): Promise<FilteredSet> {
  const url = apiUrl(`customer/all-customer/filter`);
  const response = await axios.get(url,  { params: params, ...authHeaders() });
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
export async function fetchFilteredProjects(params: Record<string, any>): Promise<FilteredSet> {
  const url = apiUrl('project/projects/filter/');
  const response = await axios.get(url, { params: params, ...authHeaders() });
  return response.data;
}


export async function searchProjects(name:string) { 
  const url = apiUrl(`project/projects/filter?name=${name}`);
  const response = await axios.get(url,authHeaders());
  return response.data;
}
export async function getProject(id: string | undefined) {
  if(!id) return null;
  const url = apiUrl(`project/get-project/${id}/`);
  const response = await axios.get(url, authHeaders())
  return response.data;
}
export async function deleteProjects(ids: any[]): Promise<any> {
  const url = apiUrl('project/delete-project/');
  const config = {
    headers: authHeaders().headers,
    data: ids,
  };
  const response = await axios.delete(url, config);
  return response.data;
}
export async function fetchProjectFindings(id: string | undefined) {
  if(!id) return null;
  const url = apiUrl(`project/findings/${id}/`);
  const response = await axios.get(url, authHeaders())
  return response.data;
}
export async function getProjectVulnerability(id: string | undefined) {
  if(!id) return null;
  const url = apiUrl(`project/vulnerability/${id}/`);
  const response = await axios.get(url, authHeaders())
  return response.data;
}
export async function fetchVulnerabilityInstances(id: string | number | undefined) {
  if(!id) return null;
  const url = apiUrl(`project/vulnerability/instances/${id}/`);
  const response = await axios.get(url, authHeaders())
  return response.data;
}
export async function deleteVulnerabilityInstances(ids: any[]): Promise<any> {
  const url = apiUrl('project/vulnerability/delete/instances/');
  const config = {
    headers: authHeaders().headers,
    data: ids,
  };
  const response = await axios.delete(url, config);
  return response.data;
}

export async function deleteProjectVulnerabilities(ids: any[]): Promise<any> {
  const url = apiUrl('project/vulnerability/delete/vulnerability/');
  const config = {
    headers: authHeaders().headers,
    data: ids,
  };
  const response = await axios.delete(url, config);
  return response.data;
}
export async function upsertProject(formData: Project): Promise<any> {
  let url = apiUrl(`project/add-project/`);
  if (Object.keys(formData).includes('id')) {
    url = apiUrl(`project/edit-project/${formData['id']}/`);
  }

  const response = await axios.post(url, formData, authHeaders());
  return response.data;
}
export async function insertProjectVulnerability(formData: any): Promise<any> {
  const url = apiUrl(`project/vulnerability/add/vulnerability/`)
  const data = formData
  if(formData.instances){
    data.instance = formData.instances
    delete data.instances
  }
  const response = await axios.post(url, data, authHeaders());
  return response.data;
}
export async function updateProjectVulnerability(formData: any): Promise<any> {
  const url = apiUrl(`project/vulnerability/edit/${formData.id}/`)
  const data = formData
  if(formData.instances){
    data.instance = formData.instances
    delete data.instances
  }
  const response = await axios.post(url, data, authHeaders());
  return response.data;
}
export async function updateProjectInstance(data: any): Promise<any> {
  const url = apiUrl(`project/vulnerability/edit/instances/${data.id}/`)
  const response = await axios.post(url, data, authHeaders());
  return response.data;
}
//pvid is the id of a ProjectVulnerability
export async function insertProjectInstance(pvid: any, data: any[]): Promise<any> {
  const url = apiUrl(`project/vulnerability/add/instances/${pvid}/`)
  const response = await axios.post(url, data, authHeaders());
  return response.data;
}


export async function fetchCompanies() {
  const url = apiUrl('customer/all-company');
  const response = await axios.get(url, authHeaders());
  return response.data;
}
export async function fetchFilteredCompanies(params: Record<string, any>): Promise<FilteredSet> {
  const url = apiUrl(`customer/all-company/filter`);
  const response = await axios.get(url,  { params: params, ...authHeaders() });
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
export async function fetchFilteredVulnerabilities(params: Record<string, any>): Promise<FilteredSet> {
  const url = apiUrl(`vulndb/all-vulndb/filter`);
  const response = await axios.get(url,  { params: params, ...authHeaders() });
  return response.data;
}
export async function searchVulnerabilities(term:string) {
  const url = apiUrl(`vulndb/filter/?search=${term}`);
  const response = await axios.get(url, authHeaders());
  return response.data;
}

export async function getVulnerability(id: string | undefined) {
  if (!id) return null;
  const url = apiUrl(`vulndb/${id}/`);
  const response = await axios.get(url, authHeaders());
  return response.data;
}

export async function getVulnerabilityByName(name: string | undefined) {
  if (!name) return null;
  const url = apiUrl(`vulndb/database/?title=${name}`);
  const response = await axios.get(url, authHeaders());
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
export async function deleteVulnerabilities(ids: any[]): Promise<any> {
  const url = apiUrl('vulndb/delete-vulndb');
  const config = {
    headers: authHeaders().headers,
    data: ids,
  };
  const response = await axios.delete(url, config);
  return response.data;
}
export async function fetchUsers() {
  const url = apiUrl('auth/users');
  const response = await axios.get(url, authHeaders());
  return response.data;
}
export async function fetchFilteredUsers(params: Record<string, any>): Promise<FilteredSet> {
  const url = apiUrl('auth/users/filter/');
  const response = await axios.get(url, { params: params, ...authHeaders() });
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
  // delete temp.id;

  let url = apiUrl(`auth/adduser`);
  if (Object.keys(formData).includes('id')) {
    url = apiUrl(`auth/edituser/${formData['id']}`);
  }
  const response = await axios.post(url, temp, authHeaders());
  console.log(response)
  return response.data;
}
export async function updateProfile(formData: User, profilepic:File|null = null): Promise<any> {
  const temp = formData as any;
  delete temp.id;
  delete temp.profilepic
  const config:any = authHeaders()
if(profilepic) {
    config.headers['content-type'] = 'multipart/form-data'
    temp.profilepic = profilepic
  }
  const url = apiUrl(`auth/editprofile`);
  const response = await axios.post(url, temp, config);
  if(response.status == 200){
    //update the underyling auth user
    const current = getAuthUser()
    const profile = response.data
    const refreshed = {
      ...current,
      ...profile
    }
    setAuthUser(refreshed)
  }
  return response.data;
}
export async function changePassword(formData: User): Promise<any> {
  const url = apiUrl(`auth/changepassword`);
  const response = await axios.post(url, formData, authHeaders());
  return response.data;
  
}
export async function fetchPermissionGroups() {
  const url = apiUrl('auth/groups/list/');
  const response = await axios.get(url, authHeaders());
  return response.data;
}

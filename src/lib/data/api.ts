import {Company, Project, User, LoginUser} from './definitions'
import axios from 'axios'



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
  sessionStorage.setItem('user', jsonUser);
}

export function AuthUser(): any | undefined {
  const jsonUser = sessionStorage.getItem('user');
  if(jsonUser !== null) {
    return JSON.parse(jsonUser) as LoginUser;
  }
  return null;
}



export async function login(email: string, password:string) {
  const url = apiUrl('auth/login/');
  const response = await axios.post(url, { email, password })
  const result = response.data;
  if(!result?.access){
    return null;
  } else {
    const user = result as LoginUser;
    user.email = email;
    setAuthUser(user)
  }

  return result;
 
}

export function logout() {
  sessionStorage.removeItem('user');
}

export async function fetchCustomers() {
  const url = apiUrl('customer/all-customer');
  try {
    const response = await axios.get(url,authHeaders());
    return response.data;
  } catch (e) {
    throw e;
  }
 
}
export async function fetchCustomer(id: string | undefined) {
  if(!id) return null;
  const url = apiUrl(`customer/customer/${id}/`);
  try {
    const response = await axios.get(url, authHeaders())
    return response.data;
  } catch (e) {
    throw e;
  }
}
export async function upsertCustomer(formData: Company): Promise<any> {
  let url = apiUrl(`customer/customer/add`);
  
  if (Object.keys(formData).includes('id')) {
    url = apiUrl(`customer/customer/edit/${formData['id']}/`);
  }
  try {
    const response = await axios.post(url, formData, authHeaders())
    return response.data;    
  } catch (error) {
    throw error;
  }
}
export async function fetchProjects() {
  const url = apiUrl('project/get-projects/');
  try {
    const response = await axios.get(url,authHeaders());
    return response.data;
  } catch (e) {
    throw e;
  }
}
export async function fetchProject(id: string | undefined) {
  if(!id) return null;
  const url = apiUrl(`project/get-project/${id}/`);
  try {
    const response = await axios.get(url, authHeaders())
    return response.data;
  } catch (e) {
    throw e;
  }
}
export async function upsertProject(formData: Project): Promise<any> {
  let url = apiUrl(`project/add-project`);
  
  if (Object.keys(formData).includes('id')) {
    url = apiUrl(`project/edit-project/${formData['id']}/`);
  }
  try {
    const response = await axios.post(url, formData, authHeaders())
    return response.data;    
  } catch (error) {
    throw error;
  }
}
export async function fetchCompanies(limit=[0,10], page=0) {
  const url = apiUrl('customer/all-company');
  try {
    const response = await axios.get(url,authHeaders())
    return response.data;
  } catch (e) {
    throw e;
  }
 
}
export async function fetchCompany(id: string | undefined) {
  if (!id) return null;
  
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const url = apiUrl(`customer/company/${id}/`);
      try {
        const response = await axios.get(url,authHeaders())
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    }, 1500); // Simulate 1.5 seconds delay
  });
}


export async function upsertCompany(formData: Company): Promise<any> {
  let url = apiUrl(`customer/company/add`);
  if (Object.keys(formData).includes('id')) {
    url = apiUrl(`customer/company/edit/${formData['id']}/`);
  }
  try {
    const response = await axios.post(url, formData, authHeaders())
    return response.data;    
  } catch (error) {
    throw error;
  }
}
export async function deleteCompanies(ids: any[]): Promise<any> {
  const url = apiUrl('customer/company/delete');
  //axios delete is weird
  //configuration step based on https://stackoverflow.com/a/61644708/865884
  const config = { 
    headers: authHeaders().headers,
    data: ids
  }
  try {
    const response = await axios.delete(url, config)
    return response.data;    
  } catch (error) {
    throw error;
  }
}

export async function fetchVulnerabilities() {
  const url = apiUrl('vulndb/all-vulndb');
  try {
    const response = await axios.get(url,authHeaders())
    return response.data;
  } catch (e) {
    throw e;
  }
 
}

export async function fetchUsers() {
  const url = apiUrl('auth/users');
  try {
    const response = await axios.get(url,authHeaders())
    return response.data;
  } catch (e) {
    throw e;
  }
 
}
export async function deleteUsers(ids: any[]): Promise<any> {
  const url = apiUrl('auth/deleteuser');
  //axios delete is weird
  //configuration step based on https://stackoverflow.com/a/61644708/865884
  const config = { 
    headers: authHeaders().headers,
    data: ids
  }
  try {
    const response = await axios.delete(url, config)
    return response.data;    
  } catch (error) {
    throw error;
  }
}
import {Company} from './definitions'
import axios from 'axios'

function apiUrl(endpoint = ''): string {
    return process.env.REACT_APP_API_URL + endpoint;
}
function authHeaders(): { headers: Record<string, string> } {
  const token = String(sessionStorage.getItem('access'))
  const header = { headers: {'Authorization': `Bearer ${token}`} }
  return header;
}

export async function login(email: string, password:string) {
  const url = apiUrl('auth/login/');
  const response = await axios.post(url, { email, password })
  const result = response.data;
  if(!result?.access){
    return null;
  } else {
    sessionStorage.setItem('access',result.access);
    sessionStorage.setItem('refresh',result.refresh)
  }

  return result;
 
}

export function logout() {
  sessionStorage.removeItem('access');
  sessionStorage.removeItem('refresh')
}

export async function fetchCustomers(limit=[0,10], page=0) {
  
 
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

export async function fetchVulnerabilities(limit=[0,10], page=0) {
  
 
}
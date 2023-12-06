import { Project } from './definitions';

function apiUrl(endpoint = ''): string {
    return 'https://aptrsapi.souravkalal.tech/api/' + endpoint;
}
function authHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + sessionStorage.getItem('token')
  };
}

export async function login(username: string, password:string) {
  const url = apiUrl('auth/login/');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  const result = await response.json();
  // api returns loging failures like so
  // {detail:"No active account found with the given credentials"}
  if(result?.detail){
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
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders()
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (e) {
    throw e;
  }
}

export async function fetchCompanies(limit=[0,10], page=0) {
  
 
}

export async function fetchVulnerabilities(limit=[0,10], page=0) {
  
 
}
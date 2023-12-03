function apiUrl(endpoint = ''): string {
    return 'https://aptrsapi.souravkalal.tech/api/' + endpoint;
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
  console.log(result)
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
export async function fetchProjects(limit=[0,10], page=0) {
  const url = apiUrl('project/get-projects/');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + sessionStorage.getItem('token')
  }
  const response = await fetch(url, {
    method: 'GET',
    headers: headers
  });
  console.log(headers)
  const result = await response.json();
  return result;
 
}

export async function fetchCompanies(limit=[0,10], page=0) {
  
 
}

export async function fetchVulnerabilities(limit=[0,10], page=0) {
  
 
}
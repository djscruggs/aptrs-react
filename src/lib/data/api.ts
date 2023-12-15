import {Company} from './definitions'

function apiUrl(endpoint = ''): string {
    return process.env.REACT_APP_API_URL + endpoint;
}
function authHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + String(sessionStorage.getItem('access'))
  };
}

export async function login(email: string, password:string) {
  const url = apiUrl('auth/login/');
  console.log(url)
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  const result = await response.json();
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
  console.log(authHeaders())
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
export async function fetchProject(id: string | undefined) {
  if(!id) return null;
  const url = apiUrl(`project/get-project/${id}/`);
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
  const url = apiUrl('customer/all-company');
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
export async function fetchCompany(id: string | undefined) {
  if (!id) return null;
  
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const url = apiUrl(`customer/company/${id}/`);
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: authHeaders()
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        resolve(data);
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
    console.log(url)
  }
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(formData), // Convert form data to JSON format
    });
    console.log(response)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function fetchVulnerabilities(limit=[0,10], page=0) {
  
 
}
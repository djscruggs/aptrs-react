
function apiUrl(endpoint = ''): string {
    return process.env.REACT_APP_API_URL + endpoint;
}
function authHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' +String(sessionStorage.getItem('access'))
  };
}

export async function login(email: string, password:string) {
  const url = apiUrl('auth/login/');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
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
export async function fetchProject(id: string | undefined) {
  if(!id) return null;
  return {
    "id": 1,
    "status": "Completed",
    "name": "Juice Shop",
    "description": "The project is about Juice Shop application security assessment. The project involves finding security vulnerabilities in the application",
    "projecttype": "Web Application Penetration Testing",
    "startdate": "2022-10-26",
    "enddate": "2022-10-31",
    "testingtype": "Black Box",
    "projectexception": "",
    "companyname": "OWASP",
    "owner": "admin"
  }
  // const url = apiUrl('project/get-project/' + id);
  // console.log(url)
  // console.log(authHeaders())
  // try {
  //   const response = await fetch(url, {
  //     method: 'GET',
  //     headers: authHeaders()
  //   });
  //   if (!response.ok) {
  //     throw new Error(`HTTP error! status: ${response.status}`);
  //   }

  //   return response.json();
  // } catch (e) {
  //   throw e;
  // }
}

export async function fetchCompanies(limit=[0,10], page=0) {
  
 
}

export async function fetchVulnerabilities(limit=[0,10], page=0) {
  
 
}
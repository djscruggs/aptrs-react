import { type User } from '../src/lib/data/definitions';
import * as api from '../src/lib/data/api';
import { faker } from '@faker-js/faker'


const indianPhoneNumberRegex = /^\+91[789]\d{9}$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@#$%!^&*])[A-Za-z\d@#$%!^&*]{10,}$/;
  
// creates normal users for us
export const loginAdminUser = async () => {
  const user = await api.login('admin@anof.com', 'PE#5GZ29PTZMSE');
  return user;
};
export const loginNormalUser = async () => {
  const user = await api.login('user@user.com', 'PE#user');
  return user;
};

export const createNormalUser = async (user?: Omit<User, 'id'>) => {
  return await api.upsertUser(
    {
      full_name: faker.person.fullName(), 
      username: faker.internet.userName(),
      email: faker.internet.email(),
      is_active:true,
      number: faker.helpers.fromRegExp(indianPhoneNumberRegex),
      is_superuser: false,
      position:faker.person.jobTitle(),
      password: faker.internet.password({ length: 10, pattern: passwordRegex}),
      groups:["User Permission Group"]
    }
  )
  
}
// creates admin users for us
export const createAdminUser = async (user?: Omit<User, 'id'>) => {
  return await api.upsertUser({
    full_name: faker.person.fullName(), 
      username: faker.internet.userName(),
      email: faker.internet.email(),
      is_active:true,
      number: faker.helpers.fromRegExp(indianPhoneNumberRegex),
      is_superuser: true,
      position:faker.person.jobTitle(), 
      password: faker.internet.password({ length: 10, pattern: passwordRegex}),
      groups:["Admin Permission Group"]
  })
}

// / Exported functions from api.ts
// - apiUrl(endpoint: string): string
// - uploadUrl(): string
// - simpleUploadConfig(): any
// - authHeaders(): { headers: Record<string, string> }
// - setAuthUser(user: LoginUser): void
// - getAuthUser(): any | undefined
// - shouldRefreshToken(): boolean
// - login(email: string, password: string): Promise<any>
// - refreshAuth(): Promise<any>
// - logout(): void
// - fetchCustomers(): Promise<any>
// - fetchFilteredCustomers(params: Record<string, any>): Promise<FilteredSet>
// - getUserLocation(): Promise<any>
// - getCustomer(id: string | undefined): Promise<any>
// - upsertCustomer(formData: Company): Promise<any>
// - fetchProjects(): Promise<any>
// - fetchFilteredProjects(params: Record<string, any>): Promise<FilteredSet>
// - searchProjects(name: string): Promise<any>
// - getProject(id: string | undefined): Promise<any>
// - deleteProjects(ids: any[]): Promise<any>
// - fetchProjectFindings(id: string | undefined): Promise<any>
// - getProjectVulnerability(id: string | undefined): Promise<any>
// - fetchVulnerabilityInstances(id: string | number | undefined): Promise<any>
// - deleteVulnerabilityInstances(ids: any[]): Promise<any>
// - deleteProjectVulnerabilities(ids: any[]): Promise<any>
// - upsertProject(formData: Project): Promise<any>
// - insertProjectVulnerability(formData: any): Promise<any>
// - updateProjectVulnerability(formData: any): Promise<any>
// - updateProjectInstance(data: any): Promise<any>
// - insertProjectInstance(pvid: any, data: any[]): Promise<any>
// - fetchCompanies(): Promise<any>
// - fetchFilteredCompanies(params: Record<string, any>): Promise<FilteredSet>
// - getCompany(id: string | undefined): Promise<any>
// - upsertCompany(formData: Company): Promise<any>
// - deleteCompanies(ids: any[]): Promise<any>
// - fetchVulnerabilities(): Promise<any>
// - fetchFilteredVulnerabilities(params: Record<string, any>): Promise<FilteredSet>
// - searchVulnerabilities(term: string): Promise<any>
// - getVulnerability(id: string | undefined): Promise<any>
// - getVulnerabilityByName(name: string | undefined): Promise<any>
// - upsertVulnerability(formData: Vulnerability): Promise<any>
// - deleteVulnerabilities(ids: any[]): Promise<any>
// - fetchUsers(): Promise<any>
// - fetchFilteredUsers(params: Record<string, any>): Promise<FilteredSet>
// - deleteUsers(ids: any[]): Promise<any>
// - getUser(id: string | undefined): Promise<any>
// - getMyProfile(): Promise<any>
// - upsertUser(formData: User): Promise<any>
// - updateProfile(formData: User, profilepic: File | null): Promise<any>
// - changePassword(formData: User): Promise<any>
// - fetchPermissionGroups(): Promise<any>
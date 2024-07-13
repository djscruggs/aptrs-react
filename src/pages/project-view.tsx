import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'
import { WithAuth } from "../lib/authutils"
import { FormSkeleton } from '../components/skeletons'
import { getProject, getProjectScopes, getProjectReport } from '../lib/data/api'
import { Project, Scope } from '../lib/data/definitions'
import 'react-datepicker/dist/react-datepicker.css'
import { ModalErrorMessage, StyleLabel, StyleTextfield, FormErrorMessage, StyleCheckbox } from '../lib/formstyles'
import PageTitle from '../components/page-title'
import VulnerabilityTable from '../components/vulnerability-table'
import { toast } from 'react-hot-toast';
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel
} from "@material-tailwind/react";
import ScopeTable from '../components/scope-table'


interface ProjectViewProps {
  id?: string; // Make the ID parameter optional
  tab?: string;
}
function ProjectView({ id: externalId}: ProjectViewProps): JSX.Element {
  const params = useParams()
  const { id: routeId } = params;
  const id = externalId || routeId; // Use externalId if provided, otherwise use routeId
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<Project>()
  const [scopes, setScopes] = useState<Scope[]>([])
  const [loadingError, setLoadingError] = useState(false);
  
  useEffect(() => {
    const loadData = async () => {
      if (id) {
        setLoading(true);
        try {
          const projectData = await getProject(id) as Project;
          setProject(projectData as Project);
          const scopes = await getProjectScopes(id) as Scope[]
          setScopes(scopes)
        } catch (error) {
          console.error("Error fetching project data:", error);
          setLoadingError(true);
          // Handle error fetching data
        } finally {
          setLoading(false);
        }
      }
    };
    loadData();
  }, [id]);
  
  
  
  if(loading) return <FormSkeleton numInputs={6} className='max-w-lg'/>
  if (loadingError) return <ModalErrorMessage message={"Error loading project"} />

  return (
        <>
          {typeof(project) == 'object' && (
            <Tabs value='summary'>
              <div className="max-w-screen flex-1 rounded-lg bg-white dark:bg-gray-darkest dark:text-white px-6 pb-4 ">
                <PageTitle title='Project Details' />
                <TabsHeader className='mt-4'>
                  <Tab key="summary" value="summary">Summary</Tab>
                  <Tab key="vulnerabilities" value="vulnerabilities">Vulnerabilities</Tab>
                  <Tab key="scopes" value="scopes">Scopes</Tab>
                  <Tab key="report" value="report">Reports</Tab>
                </TabsHeader>
                <TabsBody>
                  <TabPanel value="summary">
                    <Link className='text-primary underline' to={`/projects/${project.id}/edit`}>edit</Link>
                    <div className='w-2/3'>
                        <div className="w-full mb-4">
                          <label className={StyleLabel}>
                            Name
                          </label>
                          
                          <div className="relative cursor-text">
                            {project.name}
                          </div>
                        </div>
                        <div className="w-full mb-4">
                          <label className={StyleLabel}>
                            Project Owner
                          </label>
                          
                          <div className="relative cursor-text">
                            {project.owner}
                          </div>
                        </div>
                        <div className="mt-4">
                          <label className={StyleLabel}>
                            Type
                          </label>
                          <div className="relative cursor-text">
                            {project.projecttype}
                          </div>
                        </div>
                        <div className="mt-4">
                          <label className={StyleLabel}>
                            Company
                          </label>
                          <div className="relative cursor-text">
                            {project.companyname} 
                          </div>
                        </div>
                        <div className='grid grid-cols-2'>
                          <div className="mt-4">
                            <label className={StyleLabel}>
                              Start Date
                            </label>
                            <div className="relative cursor-text">
                              {project.startdate} 
                            </div>
                          </div>
                          <div className="mt-4">
                            <label className={StyleLabel}>
                              End Date
                            </label>
                            <div className="relative cursor-text">
                              {project.enddate}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <label className={StyleLabel}>
                            Testing Type
                          </label>
                          <div className="relative cursor-text">
                            {project.testingtype}
                          </div>
                        </div>
                        <div className="mt-4">
                          <label className={StyleLabel}>
                            Project Exception
                          </label>
                          <div className="relative cursor-text">
                            {project.projectexception}
                          </div>
                        </div>
                      <div className="mt-4">
                        <label className={StyleLabel} >
                          Description
                        </label>
                        <div className="relative cursor-text">
                          <div dangerouslySetInnerHTML={{__html: project.description}}></div>
                        </div>
                      </div>
                    </div>
                  </TabPanel>
                  <TabPanel value="vulnerabilities">
                      <VulnerabilityTable projectId={Number(id)}  />
                    
                  </TabPanel>
                  <TabPanel value="scopes">
                    <ScopeTable projectId={Number(id)} />
                  </TabPanel>
                  <TabPanel value="report">
                    <div className="mt-4 max-w-lg">
                      <ReportForm projectId={Number(id)} scopes={scopes} />
                    </div>
                  </TabPanel>
                    
                </TabsBody>
              </div>
            </Tabs>
            
            
            )
          }
        </>
  );
}


interface ReportFormProps {
  projectId: number
  scopes: any[]
}
function ReportForm(props: ReportFormProps){
  const {projectId, scopes} = props
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    projectId: projectId,
    Format: '',
    Type: '',
    Standard: [] as string[]
  })
  const [loading, setLoading] = useState(false)
  const handleChange = (event:any) => {
    setFormData({...formData, [event.target.name]: event.target.value})
  }
  const handleCheckboxChange = (event:any) => {
    const { Standard } = formData;
    if(Standard?.includes(event.target.value)){
      setFormData({...formData, Standard: Standard.filter((item:string)=>item !== event.target.value)})
    } else {
      setFormData({...formData, Standard: [...Standard, event.target.value]})
    }
  }
  const isValid = () => {
    return formData.Format && formData.Type && formData.Standard && formData.Standard.length > 0
  }
  const fetchReport = async () => {
    setLoading(true)
    try {
      const response = await getProjectReport(formData)
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'report';
      if (contentDisposition && contentDisposition.includes('filename=')) {
        filename = contentDisposition
          .split('filename=')[1]
          .split(';')[0]
          .replace(/"/g, '');
      }
      const contentType = response.headers['content-type'];
      const blob = new Blob([response.data], { type: contentType });
      if (formData.Format === 'pdf') {
        const pdfURL = URL.createObjectURL(blob);
        window.open(pdfURL);
      } else {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      toast.success('Report downloaded')
      
    } catch(error){
      setError("Error fetching report")
      console.error(error)
    } finally {
      setLoading(false)
    }
    
  }
  if(!scopes || scopes.length === 0){
    return (
      <>
      <FormErrorMessage message="No scopes defined"/>
      <p>Please add at least one scope to this project to generate a report.</p>
      </>
    )
  }
  return(
    <>
    {error && <FormErrorMessage message={error}/>}
    <label htmlFor='Format'>Format</label>
    <select name='Format' id='Format' className={StyleTextfield} onChange={handleChange}>
      <option value="">Select...</option>
      <option value="pdf">PDF</option>
      <option value="docx">Microsoft Word</option>
      <option value="excel">Microsoft Excel</option>
    </select>
    <label htmlFor='Type'>Type</label>
    <select name='Type' id='Type' className={StyleTextfield} onChange={handleChange}>
      <option value="">Select...</option>
      <option value="Audit">Audit</option>
      <option value="Re-Audit">Re-Audit</option>
    </select>
    <div className='mt-4'>
      <input 
        type="checkbox" 
        id="Standard_0"
        name="Standard[]" 
        value="OWASP Top 10 web" 
        className={StyleCheckbox}
        onChange={handleCheckboxChange}
      /> 
      <label className='ml-2' htmlFor='Standard_0'>
          OWASP Top 10 web
      </label>
    </div>
    <div>
      <input 
        type="checkbox" 
        id="Standard_1"
        name="Standard[]" 
        value="OWASP Top 10 API" 
        className={StyleCheckbox}
        onChange={handleCheckboxChange}
      /> 
      <label className='ml-2' htmlFor='Standard_1'>
        OWASP Top 10 API
      </label>
    </div>
    <div>
      <input 
        type="checkbox" 
        id="Standard_2"
        name="Standard[]" 
        value="NIST" 
        className={StyleCheckbox}
        onChange={handleCheckboxChange}
      /> 
      <label className='ml-2' htmlFor='Standard_2'>NIST</label>
    </div>
    <button className='bg-primary text-white p-2 rounded-md block mt-6 disabled:opacity-50' disabled={loading || !isValid()} onClick={()=>fetchReport()}>Fetch Report</button>
    
    </>
    
  )
}


export default WithAuth(ProjectView);

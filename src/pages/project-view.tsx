import React, { 
  useState, 
  useEffect,
} from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { WithAuth } from "../lib/authutils";
import { FormSkeleton } from '../components/skeletons'
import { getProject, 
        fetchProjectFindings, 
        deleteProjectVulnerabilities, 
        searchVulnerabilities,
        getProjectScopes,
        getProjectReport } from '../lib/data/api';
import { Project, Vulnerability } from '../lib/data/definitions'
import "react-datepicker/dist/react-datepicker.css";
import { ModalErrorMessage, StyleTextfield } from '../lib/formstyles';
import { StyleLabel } from '../lib/formstyles';
import PageTitle from '../components/page-title';
import { useDebounce } from '@uidotdev/usehooks';
import { toast } from 'react-hot-toast';
import { List, ListItem, Spinner } from '@material-tailwind/react';
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Button,
  Dialog
} from "@material-tailwind/react";
import { useVulnerabilityColor } from '../lib/customHooks';
import { XCircleIcon, DocumentPlusIcon } from '@heroicons/react/24/outline';



interface ProjectViewProps {
  id?: string; // Make the ID parameter optional
}
interface Scope {
  id: number
  scope: string
  description?: string
}
function ProjectView({ id: externalId}: ProjectViewProps): JSX.Element {
  const params = useParams()
  
  const { id: routeId } = params;
  const id = externalId || routeId; // Use externalId if provided, otherwise use routeId
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<Project>()
  const [scopes, setScopes] = useState<Scope[]>([])
  const [findings, setFindings] = useState<Vulnerability[]>([])
  const [loadingError, setLoadingError] = useState(false);
  const [refresh, setRefresh] = useState(false) //setting to true refreshes the data
  const [searchValue, setSearchValue] = useState('')
  const [spinner, setSpinner] = useState(false) //shows spinner for vulnerability search
  const debouncedValue = useDebounce<string>(searchValue, 500)
  const [searchResults, setSearchResults] = useState<{ id:number, vulnerabilityname: string }[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [reportFormat, setReportFormat] = useState('')
  const [activeTab, setActiveTab] = useLocation().hash || 'summary'
  const navigate = useNavigate()
  
  
  useEffect(() => {
    navigate('./#'+activeTab)
  }, [activeTab])
  useEffect(() => {
    const loadData = async () => {
      if (id || refresh) {
        setLoading(true);
        try {
          const projectData = await getProject(id) as Project;
          setProject(projectData as Project);
          //TODO pagination on findings
          // api/project/vulnerability/instances/filter/ <vulnerability-id>/?URL=&Parameter=&status=&limit=1&offset=0 
          const _findings = await fetchProjectFindings(id) as Vulnerability[]
          setFindings(_findings)
          const _scopes = await getProjectScopes(id) as Scope[]
          setScopes(_scopes)
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
  }, [id, refresh]);
  useEffect(() => {
    
    if(debouncedValue){
      setSpinner(true)
      searchVulnerabilities(debouncedValue).then((data) => {
        console.log(data)
        console.log(findings)
        //filter out the ones that are already in the project
        const filteredData = data.filter((item: { vulnerabilityname: string }) => {
          return !findings.some((finding) => finding.vulnerabilityname === item.vulnerabilityname);
        });
        setSearchResults(filteredData);
      }).catch((error) => {
        console.error(error)
        // toast.error(error.)
      }).finally(() => {
        setSpinner(false)
      })
    }
  }, [debouncedValue]);
  const handleNameSearch = (event:any) => {
    setSearchValue(event.target.value)
    if(event.target.value==''){
      setSearchResults([])
    }
  }
  const fetchReport = async () => {
    if(!id) return
    const report = await getProjectReport(id, reportFormat)
    console.log(report)
  }
  async function deleteFinding(event:any, id:any): Promise<void> {
    event.stopPropagation()
    if (!confirm('Are you sure?')) {
      return;
    }
    try {
      await deleteProjectVulnerabilities([id])
      setRefresh(true)
      toast.success('Vulnerability deleted')
    } catch(error){
      console.log(error)
      toast.error(String(error))
    }
  }
  
  const handleSelectedItem = (vid:string | number, name: string = '') => {
    setSearchValue(name.trim());
    setSpinner(true)
    setShowSearchResults(false)
    setSearchResults([])
    console.log('selected is ', vid)
    if(vid==='new'){
      return navigate(`/projects/${id}/vulnerability/add`)
    } else if (vid) {
        navigate(`/projects/${id}/vulnerability/add/${vid}`)
    }
  }
  const editSelectedItem = (vid:string | number | undefined | null) => {
    if(vid){
      navigate(`/projects/${id}/vulnerability/edit/${vid}`)
    }

  }
  const [editingScope, setEditingScope] = useState<number | null>(null)
  const editScope = (scopeId: number) => {
    console.log('editing scope', scopeId)
    
  }
  
  
  if(loading) return <FormSkeleton numInputs={6} className='max-w-lg'/>
  if (loadingError) return <ModalErrorMessage message={"Error loading project"} />

  return (
        <>
          {typeof(project) == 'object' && (
            <Tabs value="summary">
            <div className="max-w-screen flex-1 rounded-lg bg-white px-6 pb-4 ">
              <PageTitle title='Project Details' />
              <TabsHeader>
                <Tab key="summary" value="summary">Summary</Tab>
                <Tab key="vulnerabilities" value="vulnerabilities">Vulnerabilities</Tab>
                <Tab key="scopes" value="scopes">Scopes</Tab>
                <Tab key="report" value="report">Report</Tab>
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
                  <div className="relative w-md">
                    <input list="searchResults" placeholder='Search & add' value={searchValue} onFocus={()=>setShowSearchResults(true)} onBlur={()=>setShowSearchResults(false)} className="border border-gray-200 p-2 rounded-md w-md" type="text" onChange={handleNameSearch} />
                    {spinner && <Spinner className="h-4 w-4 absolute right-2 top-3" />}
                  
                    <List className='max-w-xs'>
                      { searchResults.map((item, index)=>{
                          return <ListItem key={`search-${index}`} onClick={()=>handleSelectedItem(item?.id, item?.vulnerabilityname)} >{item?.vulnerabilityname}</ListItem>
                        })
                      }
                      <ListItem key='addNew' className="cursor-pointer w-xs" onClick={()=>handleSelectedItem('new')}><DocumentPlusIcon className="h-6 w-6 mr-1"/> Add New</ListItem>
                    </List>
                  
                  
                  </div>
                  
                  <div className='w-full'>
                    <div className='flex border-bottom border-black' key='finding-header'>
                      <div className='p-2 w-1/2'>Name</div>
                      <div className='p-2 w-1/4'>Severity</div>
                      <div className='p-2 w-1/4'>Score</div>
                    </div>
                    { findings.map((v, index)=>{
                        return(
                        <div className='flex' key={`finding-${index}`} onClick={()=>editSelectedItem(v.id)}>
                            <div className='p-2 w-1/2'>
                              <XCircleIcon onClick={(event)=>deleteFinding(event, v.id)}className="text-secondary w-6 h-6 inline mr-2" />
                              {v?.vulnerabilityname}
                            </div>
                            <div className={`p-2 w-1/4 text-[${useVulnerabilityColor(v.cvssscore)[1]}]`}>{useVulnerabilityColor(v.cvssscore)[0]}</div>
                            <div className='p-2 w-1/4'>{v?.cvssscore}</div>
                        </div>
                        )
                      })
                    }
                    
                  </div>
                </TabPanel>
                <TabPanel value="scopes">
                  <div className="mt-4">
                    <label className={StyleLabel}>
                      Project Scopes
                    </label>
                    <div className="relative cursor-text">
                      {scopes.map((scope, index)=>{
                        return (
                          <>
                          {editingScope === scope.id  && <ScopeForm scope={scope.scope} description={scope.description} id={scope.id} onCancel={()=>setEditingScope(null)} onSave={()=>{}}/>}
                          {editingScope !== scope.id &&
                              <div key={`scope-${index}`} className='flex'>
                                <div className='w-1/2'>{scope.description}</div>
                                <div className='w-1/2'>{scope.scope}</div> 
                                <div className='text-primary underline cursor-pointer ml-2' onClick={()=>setEditingScope(scope.id)}>edit</div> 
                              </div>
                          }
                          </>
                          
                        )
                      })}
                      
                      <button className='bg-primary text-white p-2 rounded-md block'>Add Scope</button>
                    </div>
                    {!editingScope && <ScopeForm />}
                  </div>
                </TabPanel>
                <TabPanel value="report">
                  <div className="mt-4">
                    <label className={StyleLabel}>
                      Report
                    </label>
                    <button className='bg-primary text-white p-2 rounded-md block' onClick={()=>fetchReport()}>Fetch Report</button>
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



interface ScopeFormProps {
  scope?: string
  description?: string
  id?:number
  onCancel?: () => void
  onSave?: () => void
}
function ScopeForm(props: ScopeFormProps):JSX.Element{
  const [scope, setScope] = useState(props.scope || '')
  const [description, setDescription] = useState(props.description || '')
  const [id, setId] = useState(props.id || null)
  const handleScopeChange = (event: any) => {
    setScope(event.target.value)
  }
  const handleDescriptionChange = (event: any) => {
    setDescription(event.target.value)
  }
  return(
     <div className='flex w-full'>
      <div className='flex items-start'>
          <input
            type="text"
            name='scope'
            id='scope'
            placeholder='Scope'
            className={StyleTextfield}
            value={scope}
            onChange={handleScopeChange}
          />
        </div>
        <div className='ml-2'>
          <input
            type="text"
            name='scope'
            id='scope'
            placeholder='Description'
            className={StyleTextfield}
            value={description}
            onChange={handleDescriptionChange}
          />
        </div>
        <div className='ml-1'>
          <button className='bg-primary text-white p-1 rounded-md inline'>Save</button>
          <span className='text-secondary ml-1 inline cursor-pointer' onClick={props.onCancel}>Cancel</span>
        </div>
      </div>
    )
}

export default WithAuth(ProjectView);

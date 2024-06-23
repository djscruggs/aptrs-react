import React, { 
  useState, 
  useEffect,
  useRef
} from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { WithAuth } from "../lib/authutils";
import { FormSkeleton } from '../components/skeletons'
import { getProject, 
        fetchProjectFindings, 
        deleteProjectVulnerabilities, 
        searchVulnerabilities,
        getProjectScopes,
        insertProjectScopes,
        updateProjectScope,
        getProjectReport,
        deleteProjectScope } from '../lib/data/api';
import { Project, Vulnerability } from '../lib/data/definitions'
import "react-datepicker/dist/react-datepicker.css";
import { ModalErrorMessage, StyleLabel, StyleTextfield, FormErrorMessage, StyleCheckbox } from '../lib/formstyles';
import PageTitle from '../components/page-title';
import { useDebounce } from '@uidotdev/usehooks';
import { toast } from 'react-hot-toast';
import { List, ListItem, Select, Spinner } from '@material-tailwind/react';
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel
} from "@material-tailwind/react";
import { BackspaceIcon } from '@heroicons/react/24/outline'
import { useVulnerabilityColor } from '../lib/customHooks';
import {  DocumentPlusIcon } from '@heroicons/react/24/outline';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { uploadProjectVulnerabilities } from '../lib/data/api';
import vulnerabilities from './vulnerabilities';

interface ProjectViewProps {
  id?: string; // Make the ID parameter optional
  tab?: string;
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
  const [editingScope, setEditingScope] = useState<number | null>(null)
  const [showUploadCsv, setShowUploadCsv] = useState(false)
  const [newScope, setNewScope] = useState(false)
  const navigate = useNavigate()
  
  const loadScopes = async () => {
    const _scopes = await getProjectScopes(id) as Scope[]
    setScopes(_scopes)
  }
  const loadFindings = async () => {
    const _findings = await fetchProjectFindings(id) as Vulnerability[]
    setFindings(_findings)
  }
  useEffect(() => {
    const loadData = async () => {
      if (id || refresh) {
        setLoading(true);
        try {
          const projectData = await getProject(id) as Project;
          setProject(projectData as Project);
          //TODO pagination on findings
          // api/project/vulnerability/instances/filter/ <vulnerability-id>/?URL=&Parameter=&status=&limit=1&offset=0 
          loadFindings()
          loadScopes()
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
  
  async function deleteScope(event:any, id:any): Promise<void> {
    event.stopPropagation()
    if (!confirm('Are you sure?')) {
      return;
    }
    try {
      await deleteProjectScope(id)
      loadScopes()
      toast.success('Scope deleted')
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
  const toggleShowUploadCsv = (event:any) => {
    event.stopPropagation()
    event.preventDefault()
    setShowUploadCsv(!showUploadCsv)
  }
  
  if(loading) return <FormSkeleton numInputs={6} className='max-w-lg'/>
  if (loadingError) return <ModalErrorMessage message={"Error loading project"} />

  return (
        <>
          {typeof(project) == 'object' && (
            <Tabs value='summary'>
              <div className="max-w-screen flex-1 rounded-lg bg-white px-6 pb-4 ">
                <PageTitle title='Project Details' />
                <TabsHeader>
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
                    <div className="relative max-w-xl">
                      <input 
                        list="searchResults" 
                        placeholder='Search & add' value={searchValue} 
                        onFocus={()=>setShowSearchResults(true)} 
                        onBlur={()=>setShowSearchResults(false)} 
                        className="border border-gray-200 p-2 rounded-md w-3/4 " 
                        type="text" 
                        onChange={handleNameSearch} 
                      />
                      {spinner && <Spinner className="h-6 w-6 -ml-8 inline" />}
                      {!spinner && searchValue && <BackspaceIcon onClick={()=>setSearchValue('')}className="text-secondary w-6 h-6 inline -ml-8" />}
                      
                    
                      <List className='max-w-xs'>
                          {searchResults.map((item, index)=>{
                              return <><ListItem key={`search-${item.id}`} onClick={()=>handleSelectedItem(item?.id, item?.vulnerabilityname)} ><DocumentPlusIcon className="h-6 w-6 mr-1"/>{item?.vulnerabilityname}</ListItem></>
                            })
                          }
                      
                      </List>
                      
                            <button key='addNewVulnerability' className="bg-primary text-white p-2 rounded-md" onClick={()=>handleSelectedItem('new')}>Add New</button>

                            {showUploadCsv ? 
                              <span className='text-secondary ml-4 underline' onClick={toggleShowUploadCsv}>cancel</span>
                            :
                              <button className={`ml-1 cursor-pointer bg-secondary text-white p-2 rounded-md`} onClick={toggleShowUploadCsv}>
                                Upload CSV
                              </button>
                            }
                            
                      <div className='mt-4'>
                      <CSVInput projectId={Number(id)} visible={showUploadCsv} afterUpload={()=>loadFindings()} afterUploadError={(error)=>toast.error(String(error))}/>
                      
                      </div>
                    </div>
                    
                    <div className='w-full'>
                      <div className='flex border-bottom border-black' key='finding-header'>
                        <div className='p-2 w-1/2'>Name</div>
                        <div className='p-2 w-1/4'>Severity</div>
                        <div className='p-2 w-1/4'>Score</div>
                      </div>
                      { findings.map((v)=>{
                          return(
                          <div className='flex' key={`finding-${v.id}`} >
                              <div className='p-2 w-1/2'>
                                <PencilSquareIcon className="w-4 h-4 inline mr-2" onClick={()=>editSelectedItem(v.id)}/>
                                <TrashIcon onClick={(event)=>deleteFinding(event, v.id)} className="w-4 h-4 inline mr-2" />
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
                  <div className='max-w-2xl'>
                      <div className='flex border-bottom border-black' key='scope-header'>
                        <div className='p-2 w-1/2'>Scope</div>
                        <div className='p-2 w-1/4'>Description</div>
                        <div className='p-2 w-1/4'></div>
                      </div>
                      { scopes.map((s, index)=>{
                          return(
                            <>
                            {editingScope === s.id ? 
                              <ScopeForm 
                                projectId={Number(id)} 
                                scope={s.scope} 
                                description={s.description} 
                                id={s.id} 
                                onClose={()=>setEditingScope(null)} 
                                afterSave={()=>loadScopes()}/>
                              :
                            (
                              <div className='flex' key={`scope-${index}`}>
                                <div className='p-2 w-1/2'>
                                  <PencilSquareIcon className="w-4 h-4 inline mr-2" onClick={()=>setEditingScope(s.id)}/>
                                  <TrashIcon className="w-4 h-4 inline mr-2" onClick={(event)=>deleteScope(event, s.id)}/>
                                  {s?.scope}
                                </div>
                                <div className='p-2 w-1/2'>{s.description}</div>
                                
                            </div>
                            )
                            }
                            </>
                          )
                        })
                      }
                      {newScope ? 
                        <ScopeForm projectId={Number(id)} onClose={()=>setNewScope(false)} afterSave={()=>loadScopes()}/>
                      :
                        <button className='bg-primary text-white p-2 rounded-md block mt-4' onClick={()=>setNewScope(true)}>Add New</button>
                      }
                      
                    </div>
                    
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
  const [reportUrl, setReportUrl] = useState('')
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
      console.log(response.data)
      const file = new Blob([response.data], { type: `application/${formData.Format}` });
      console.log(file)
      
      const fileURL = URL.createObjectURL(file)
      setReportUrl(fileURL)
      window.open(fileURL, '_blank')
      console.log(fileURL)
      
      // window.open(fileURL, '_blank');
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
    <iframe className='w-full h-[80vh]' src={reportUrl}></iframe>
    </>
    
  )
}

interface ScopeFormProps {
  projectId: number
  scope?: string
  description?: string
  id?:number
  onClose: () => void
  afterSave: () => void
}
function ScopeForm(props: ScopeFormProps):JSX.Element{
  const [scope, setScope] = useState(props.scope || '')
  const [description, setDescription] = useState(props.description || '')
  const [id, setId] = useState(props.id || null)
  const [saving, setSaving] = useState(false)
  const [scopeError, setScopeError] = useState('')
  
  const saveScope = async () => {
    // if(!validator.isURL(scope)){
    //   setScopeError('Invalid URL')
    //   return
    // }
    setSaving(true)
    const data = [{scope, description}]
    try {
      if(id){
        const result = await updateProjectScope(id, data)
      } else {
        const result = await insertProjectScopes(props.projectId, data)
      }
    } catch(error){
      console.log(error)
    } finally {
      setSaving(false)
    }
    props.afterSave()
    props.onClose()
  }
  const handleScopeChange = (event: any) => {
    setScope(event.target.value)
    // if(!validator.isURL(event.target.value)){
    //   setScopeError('Invalid URL')
    // } else {
    //   setScopeError('')
    // }
  }
  const handleDescriptionChange = (event: any) => {
    setDescription(event.target.value)
  }
  return(
      <>
     <div className={`flex w-full ${saving ? 'opacity-50' : ''}`}>
      <div className='flex items-start w-2/5'>
          <input
            type="text"
            name='scope'
            id='scope'
            placeholder='Host name or IP address'
            className={StyleTextfield}
            value={scope}
            onChange={handleScopeChange}
          />
          
        </div>
        <div className='ml-2 w-2/5'>
          <input
            type="text"
            name='description'
            id='description'
            placeholder='Description'
            className={StyleTextfield}
            value={description}
            onChange={handleDescriptionChange}
          />
        </div>
        <div className='ml-1'>
          <button className='bg-primary text-white p-1 rounded-md inline disabled:opacity-50' disabled={Boolean(scopeError)} onClick={saveScope}>Save</button>
          <span className='text-secondary ml-1 inline cursor-pointer' onClick={props.onClose}>Cancel</span>
        </div>
        
      </div>
      {scopeError && <div className='text-sm text-red-500 mt-1 pl-2'>{scopeError}</div>}
      </>
    )
}

interface CSVInputProps {
  projectId: number
  visible: boolean
  afterUpload: (data: any) => void
  afterUploadError: (error: any) => void
}
const CSVInput = ({projectId, visible = false, afterUpload, afterUploadError}: CSVInputProps): JSX.Element => {
  // /api/project/vulnerability/Nessus/csv/<project-id>/
  const fileInput = useRef<HTMLInputElement>(null)
  const [csvFileName, setCsvFileName] = useState('')
  const [csvFile, setCsvFile] = useState<File | null>(null)
  useEffect(() => {
    if(visible){
      setCsvFileName('')
      setCsvFile(null)
    }
  }, [visible])
  const handleFile = (event:any) => {
    console.log(event.target.files[0])
    setCsvFileName(event.target.files[0].name)
    setCsvFile(event.target.files[0])
    
  }
  const resetUploader = () => {
    setCsvFileName('')
    setCsvFile(null)
    if(fileInput.current){
      fileInput.current.value = ''
    }
  }
  const deleteCsvFile = () => {
    resetUploader()
  }
  const handleCSVUpload = async (event:any) : Promise<void> => {
    if(csvFile){
      try {
        const result = await uploadProjectVulnerabilities(projectId, csvFile)
        toast.success('Upload complete')
        resetUploader()
        afterUpload(result)
      } catch(error){
        console.error(error)
        toast.error(String(error))
        afterUploadError(error)
      }
    }
    
  }
  if(!visible){
    return <></>
  }
  return (
    <>
      <input type="file"
        id="csv"
        key="csv"
        name="csv"
        accept="text/csv"
        onChange={handleFile}
        ref={fileInput}
        className={`text-sm text-white
                  file:text-white
                    file:mr-5 file:py-2 file:px-6
                    file:rounded-full file:border-0
                    file:text-sm file:font-medium
                    file:bg-primary
                    file:cursor-pointer
                    ${csvFile ? 'opacity-75' : ''}
                    hover:file:bg-secondary`}
      />
      {csvFileName && 
        <>
        <div className='text-md text-primary mt-2 ml-2'>
          <BackspaceIcon className="w-4 h-4 inline mr-2 text-secondary" onClick={deleteCsvFile}/>
          {csvFileName}
        </div>
        <button className='bg-secondary text-sm text-white p-2 rounded-full block mt-4' onClick={handleCSVUpload}>Upload Now</button>
        </>
      }
    </>
  )
}
export default WithAuth(ProjectView);

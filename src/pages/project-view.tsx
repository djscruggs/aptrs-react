import React, { 
  useState, 
  useEffect,
  useRef,
  useContext
} from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
        deleteProjectScope,
        insertProjectInstance} from '../lib/data/api';
import DataTable from 'react-data-table-component';
import { Project, Vulnerability, VulnWithActions, Column, Scope } from '../lib/data/definitions'
import "react-datepicker/dist/react-datepicker.css";
import { ModalErrorMessage, StyleLabel, StyleTextfield, FormErrorMessage, StyleCheckbox } from '../lib/formstyles';
import PageTitle from '../components/page-title';
import { useDebounce } from '@uidotdev/usehooks';
import { toast } from 'react-hot-toast';
import { List, ListItem, Spinner } from '@material-tailwind/react';
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
import { ThemeContext } from '../layouts/layout';
import { Dialog, DialogBody, Button } from '@material-tailwind/react';

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
  const [refresh, setRefresh] = useState(false) //setting to true refreshes the data
  
  useEffect(() => {
    const loadData = async () => {
      if (id || refresh) {
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
  }, [id, refresh]);
  
  
  
  if(loading) return <FormSkeleton numInputs={6} className='max-w-lg'/>
  if (loadingError) return <ModalErrorMessage message={"Error loading project"} />

  return (
        <>
          {typeof(project) == 'object' && (
            <Tabs value='scopes'>
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

interface VulnerabilityTableProps {
  projectId: number

}
function VulnerabilityTable(props: VulnerabilityTableProps): JSX.Element {
  const {projectId} = props
  const [searchValue, setSearchValue] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selected, setSelected] = useState([])
  const debouncedValue = useDebounce<string>(searchValue, 500)
  const [spinner, setSpinner] = useState(false) //shows spinner for vulnerability search
  const navigate = useNavigate()
  const [searchResults, setSearchResults] = useState<{ id:number, vulnerabilityname: string }[]>([])
  const [showUploadCsv, setShowUploadCsv] = useState(false)
  const [findings, setFindings] = useState<Vulnerability[]>(props.findings)
  const theme = useContext(ThemeContext);
  async function deleteFinding(event:any, id:any): Promise<void> {
    event.stopPropagation()
    if (!confirm('Are you sure?')) {
      return;
    }
    try {
      await deleteProjectVulnerabilities([id])
      loadFindings()
      toast.success('Vulnerability deleted')
    } catch(error){
      console.log(error)
      toast.error(String(error))
    }
  }
  const loadFindings = async () => {
    const _findings = await fetchProjectFindings(String(projectId)) as VulnWithActions[]
    let temp = formatRows(_findings)
    setFindings(temp)
  }
  useEffect(() => {
    loadFindings()
  }, [projectId])

  function formatRows(rows: VulnWithActions[]):VulnWithActions[] {
    let temp: any = []
    rows.forEach((row: VulnWithActions) => {
      row.actions = (<>
                    <PencilSquareIcon onClick={() => navigate(`/projects/${projectId}/vulnerability/edit/${row.id}`)} className="inline w-6 cursor-pointer"/>
                    <TrashIcon onClick={(event) => deleteFinding(event,[row.id])} className="inline w-6 ml-2 cursor-pointer" />                        
                    </>)
      const [meaning, color] = useVulnerabilityColor(row.vulnerabilityseverity as string)
      row.severity = (<span className={`text-[${color}]`}>{meaning}</span>)
      temp.push(row)
    });
    return temp;
  
  }
  const columns: Column[] = [
    {
      name: 'Action',
      selector: (row: VulnWithActions) => row.actions,
      maxWidth: '1rem'
    },
    {
      name: 'Name',
      selector: (row: VulnWithActions) => row.vulnerabilityname,
    },
    {
      name: 'Severity',
      selector: (row: VulnWithActions) => row.severity,
      maxWidth: '5em'
    },
    {
      name: 'Score',
      selector: (row: VulnWithActions) => row.cvssscore,
      maxWidth: '5em'
    },
  ]
  const handleSelectedItem = (vid:string | number, name: string = '') => {
    setSearchValue(name.trim());
    setSpinner(true)
    setShowSearchResults(false)
    setSearchResults([])
    if(vid==='new'){
      return navigate(`/projects/${projectId}/vulnerability/add`)
    } else if (vid) {
        navigate(`/projects/${projectId}/vulnerability/add/${vid}`)
    }
  }
  const editSelectedItem = (vid:string | number | undefined | null) => {
    if(vid){
      navigate(`/projects/${projectId}/vulnerability/edit/${vid}`)
    }

  }
  const handleSelectedChange = (event: any) => {
    const ids = event.selectedRows.map((item:any) => item.id);
    setSelected(ids)
  }
  
  const toggleShowUploadCsv = (event:any) => {
    event.stopPropagation()
    event.preventDefault()
    setShowUploadCsv(!showUploadCsv)
  }
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
  return (
    <>
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
                          {searchResults.map((item)=>{
                              return <><ListItem key={`search-${item.id}`} onClick={()=>handleSelectedItem(item?.id, item?.vulnerabilityname)} ><DocumentPlusIcon className="h-6 w-6 mr-1"/>{item?.vulnerabilityname}</ListItem></>
                            })
                          }
                      
                      </List>
                      {!showUploadCsv &&
                            <>
                              <button key='addNewVulnerability' className="bg-primary text-white p-2 rounded-md" onClick={()=>handleSelectedItem('new')}>Add New</button>                            
                              <button className={`ml-1 cursor-pointer bg-secondary text-white p-2 rounded-md`} onClick={toggleShowUploadCsv}>
                                  Upload CSV
                              </button>
                            </>
                      }
                      
                      <div className='mt-4'>
                      <CSVInput projectId={projectId} visible={showUploadCsv} hide={toggleShowUploadCsv} afterUpload={()=>loadFindings()} afterUploadError={(error)=>toast.error(String(error))}/>
                      
                      </div>
                    </div>
                    
                    <div className='w-full'>
                       <DataTable
                        columns={columns}
                        data={findings}
                        selectableRows
                        pagination
                        paginationServer
                        paginationPerPage={10}
                        striped
                        onSelectedRowsChange={handleSelectedChange}
                        theme={theme}
                    />
                      
                    </div>
    </>
  )
}

interface ScopeTableProps {
  projectId: number
}
function ScopeTable(props: ScopeTableProps): JSX.Element {
  const {projectId} = props
  const [editingScope, setEditingScope] = useState<number | false>(false)
  const [newScope, setNewScope] = useState(false)
  const [scopes, setScopes] = useState<Scope[]>([])
  const [selected, setSelected] = useState([])
  const navigate = useNavigate()
  const theme = useContext(ThemeContext);
  useEffect(() => {
    loadScopes()
  }, [projectId])
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
  const loadScopes = async () => {
    const _scopes = await getProjectScopes(String(projectId)) as ScopeWithActions[]
    const formatted: ScopeWithActions[] = formatRows(_scopes)
    setScopes(formatted)
  }
  const handleSelectedChange = (event: any) => {
    const ids = event.selectedRows.map((item:any) => item.id);
    setSelected(ids)
  }
  interface ScopeWithActions extends Scope {
    actions: React.ReactNode
  }
  function formatRows(rows: ScopeWithActions[]):ScopeWithActions[] {
    let temp: ScopeWithActions[] = []
    rows.forEach((row: ScopeWithActions) => {
      row.actions = (<>
                    <PencilSquareIcon onClick={() => setEditingScope(row.id)} className="inline w-6 cursor-pointer"/>
                    <TrashIcon onClick={(event) => deleteScope(event,[row.id])} className="inline w-6 ml-2 cursor-pointer" />                        
                    </>)
      temp.push(row)
    });
    return temp;
  
  }
  const columns: Column[] = [
    {
      name: 'Action',
      selector: (row: VulnWithActions) => row.actions,
      maxWidth: '1rem'
    },
    {
      name: 'Scope',
      selector: (row: ScopeWithActions) => row.scope,
    },
    {
      name: 'Description',
      selector: (row: ScopeWithActions) => row.description,
      maxWidth: '10em'
    }
  ]
  return (
      <div className='max-w-2xl'>
                      
                      {newScope ? 
                        <ScopeForm projectId={Number(projectId)} onClose={()=>setNewScope(false)} afterSave={()=>loadScopes()}/>
                      :
                        <button className='bg-primary text-white p-2 rounded-md block mt-4' onClick={()=>setNewScope(true)}>Add New</button>
                      }
                      <DataTable
                        columns={columns}
                        data={scopes}
                        selectableRows
                        pagination
                        paginationServer
                        paginationPerPage={10}
                        striped
                        onSelectedRowsChange={handleSelectedChange}
                        theme={theme}
                      />
                      {editingScope &&
                      <ModalScopeForm
                        projectId={projectId}
                        scope={scopes.find((scope) => scope.id === editingScope)?.scope}
                        description={scopes.find((scope) => scope.id === editingScope)?.description}
                        id={editingScope}
                        onClose={() => setEditingScope(false)}
                        afterSave={() => loadScopes()}
                      />
                    }
                    </div>
                    
  )
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
    <iframe className='w-full h-[80vh]' src={reportUrl}></iframe>
    </>
    
  )
}
interface ModalScopeFormProps {
  projectId: number
  scope?: string
  description?: string
  id?:number
  onClose: () => void
  afterSave: () => void
}
function ModalScopeForm(props: ModalScopeFormProps):JSX.Element{
  const [showModal, setShowModal] = useState(true)
  const clearModal = () => {
    props.onClose()
    setShowModal(false)
  }
  return(
    <Dialog handler={clearModal} open={showModal}  size="md" className="modal-box w-full bg-white p-4 rounded-md" >
          <DialogBody className='max-w-[600px] '>
          <ScopeForm 
            projectId={props.projectId}
            onClose={clearModal}
            description={props.description}
            scope={props.scope}
            id={props.id}
            afterSave={props.afterSave}
          />
          </DialogBody>
        </Dialog>
  )
}
interface ScopeFormProps {
  projectId: number
  scope?: string
  description?: string
  id?:number
  onClose: () => void
  afterSave: (scope: Scope) => void
}
function ScopeForm(props: ScopeFormProps):JSX.Element{
  const [scope, setScope] = useState(props.scope || '')
  const [description, setDescription] = useState(props.description || '')
  const {id} = props
  const [saving, setSaving] = useState(false)
  const [scopeError, setScopeError] = useState('')
  
  const saveScope = async () => {
    // if(!validator.isURL(scope)){
    //   setScopeError('Invalid URL')
    //   return
    // }
    setSaving(true)
    const data = [{scope, description}]
    let result
    try {
      if(id){
        result = await updateProjectScope(id, data[0])
      } else {
        result = await insertProjectScopes(props.projectId, data)
      }
    } catch(error){
      setScopeError('Error saving scope')
    } finally {
      setSaving(false)
    }
    props.afterSave(result)
    props.onClose()
  }
  const handleScopeChange = (event: any) => {
    setScope(event.target.value)
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
  hide: (event: any) => void
  afterUpload: (data: any) => void
  afterUploadError: (error: any) => void
}
const CSVInput = ({projectId, visible = false, hide, afterUpload, afterUploadError}: CSVInputProps): JSX.Element => {
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
  const handleCSVUpload = async () : Promise<void> => {
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
      <p className='text-sm my-2'>Click <span className='font-bold'>Choose File</span> to select a CSV or <span className='underline cursor-pointer text-secondary' onClick={hide}>cancel</span></p>
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

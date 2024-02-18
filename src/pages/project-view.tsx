import React, { 
  useState, 
  useEffect,
} from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { withAuth } from "../lib/authutils";
import { FormSkeleton } from '../components/skeletons'
import { getProject, fetchProjectFindings, deleteProjectVulnerabilities, searchVulnerabilities} from '../lib/data/api';
import { Project, Vulnerability } from '../lib/data/definitions'
import "react-datepicker/dist/react-datepicker.css";
import { ModalErrorMessage } from '../lib/formstyles';
import { StyleLabel } from '../lib/formstyles';
import PageTitle from '../components/page-title';
import { useDebounce } from '@uidotdev/usehooks';
import { toast } from 'react-hot-toast';
import { List, ListItem, Spinner } from '@material-tailwind/react';
import { XCircleIcon, DocumentPlusIcon } from '@heroicons/react/24/outline';



interface ProjectViewProps {
  id?: string; // Make the ID parameter optional
}
function ProjectView({ id: externalId}: ProjectViewProps): JSX.Element {
  const params = useParams()
  
  const { id: routeId } = params;
  const id = externalId || routeId; // Use externalId if provided, otherwise use routeId
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<Project>()
  const [findings, setFindings] = useState<Vulnerability[]>([])
  const [loadingError, setLoadingError] = useState(false);
  const [refresh, setRefresh] = useState(false) //setting to true refreshes the data
  const [searchValue, setSearchValue] = useState('')
  const [spinner, setSpinner] = useState(false) //shows spinner for vulnerability search
  const debouncedValue = useDebounce<string>(searchValue, 500)
  const [searchResults, setSearchResults] = useState<{ id:number, vulnerabilityname: string }[]>([])
  const [currentVulnerability, setCurrentVulnerability] = useState<Vulnerability | null >(null)
  const [showSearchResults, setShowSearchResults] = useState(false)
  useEffect(() => {
    const loadData = async () => {
      if (id || refresh) {
        setLoading(true);
        try {
          const projectData = await getProject(id) as Project;
          setProject(projectData as Project);
          const _findings = await fetchProjectFindings(id) as Vulnerability[]
          setFindings(_findings)

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
      setCurrentVulnerability(null)
    }
  }
  async function deleteFinding(event:any, id:any): Promise<void> {
    event.stopPropagation()
    if (!confirm('Are you sure?')) {
      return null;
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
  
  const navigate = useNavigate()
  const handleSelectedItem = (vid:string | number, name: string = '') => {
    setSearchValue(name.trim());
    setSpinner(true)
    setShowSearchResults(false)
    setSearchResults([])
    console.log('selected is ', vid)
    if(vid=='new'){
      return navigate(`/projects/${id}/vulnerability/add`)
    }
    if(vid){
        navigate(`/projects/${id}/vulnerability/add/${vid}`)
    } else {
      setCurrentVulnerability(null)
    }
  }
  const editSelectedItem = (vid:string | number | undefined | null) => {
    if(vid){
      navigate(`/projects/${id}/vulnerability/edit/${vid}`)
    }

  }
  
  
  if(loading) return <FormSkeleton numInputs={6} className='max-w-lg'/>
  if (loadingError) return <ModalErrorMessage message={"Error loading project"} />

  return (
        <>
          {typeof(project) == 'object' && (
            <div className="max-w-screen flex-1 rounded-lg bg-white px-6 pb-4 ">
              <PageTitle title='Project Details' />
              <Link className='text-primary underline' to={`/projects/${project.id}/edit`}>edit</Link>
              <div className="grid grid-cols-2">
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
                      {project.description}
                    </div>
                  </div>
                </div>
                <div className='w-1/3 min-w-[300px]'>
                  <h1>Vulnerabilities</h1>
                    { findings.map((v, index)=>{
                        return(
                        <div key={`finding-${index}`}>
                          <span className='bg-secondary p-2 leading-10 mr-1 rounded-lg text-sm text-white text-nowrap' onClick={()=>editSelectedItem(v.id)}>{v?.vulnerabilityname}
                          <span className="text-white ml-2 bg-secondary"><XCircleIcon onClick={(event)=>deleteFinding(event, v.id)}className="text-white w-6 h-6 bg-secondary inline" /></span>
                          </span>
                        </div>
                        )
                      })
                    }
                    <div className="relative">
                      <input list="searchResults" placeholder='Search & add' value={searchValue} onFocus={()=>setShowSearchResults(true)} onBlur={()=>setShowSearchResults(false)} className="border border-gray-200 p-2 rounded-md w-full mb-2" type="text" onChange={handleNameSearch} />
                      {spinner && <Spinner className="h-4 w-4 absolute right-2 top-3" />}
                    </div>
                  {searchResults.length > 0 &&
                    <List>
                      { searchResults.map((item, index)=>{
                          return <ListItem key={`search-${index}`} onClick={()=>handleSelectedItem(item?.id, item?.vulnerabilityname)} >{item?.vulnerabilityname}</ListItem>
                        })
                      }
                      
                    </List>
                  }
                  <ListItem key='addNew' className="cursor-pointer" onClick={()=>handleSelectedItem('new')}><DocumentPlusIcon className="h-6 w-6 mr-1"/> Add New</ListItem>
                  {currentVulnerability &&
                      <div className="border-1 border-primary p-2" key={`current-${currentVulnerability.id}`}>
                        <p>Name: {currentVulnerability.vulnerabilityname}</p>
                        <p>Score: {currentVulnerability.cvssscore}</p>
                      </div>
                  }
                </div>
              </div>
            </div>
            )
          }
        </>
  );
}
export default withAuth(ProjectView);

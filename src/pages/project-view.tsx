import React, { 
  useState, 
  useEffect,
} from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { withAuth } from "../lib/authutils";
import { FormSkeleton } from '../components/skeletons'
import { getProject, getProjectFindings, searchVulnerabilities, getVulnerabilityByName } from '../lib/data/api';
import { Project, Vulnerability } from '../lib/data/definitions'
import "react-datepicker/dist/react-datepicker.css";
import { ModalErrorMessage } from '../lib/formstyles';
import { StyleLabel } from '../lib/formstyles';
import PageTitle from '../components/page-title';
import { useDebounce } from '@uidotdev/usehooks';
import { toast } from 'react-hot-toast';
import { List, ListItem, Spinner } from '@material-tailwind/react';



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
  
  const [searchValue, setSearchValue] = useState('')
  const [searching, setSearching] = useState(false)
  const debouncedValue = useDebounce<string>(searchValue, 500)
  const [searchResults, setSearchResults] = useState<{ vulnerabilityname: string }[]>([])
  const [currentVulnerability, setCurrentVulnerability] = useState<Vulnerability | null >(null)
  const [showSearchResults, setShowSearchResults] = useState(false)
  useEffect(() => {
    const loadData = async () => {
      if (id) {
        setLoading(true);
        try {
          const projectData = await getProject(id) as Project;
          setProject(projectData as Project);
          const _findings = await getProjectFindings(id) as Vulnerability[]
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
  }, [id]);
  useEffect(() => {
    console.log('debounced valued', debouncedValue)
    if(debouncedValue){
      setSearching(true)
      searchVulnerabilities(debouncedValue).then((data) => {
        setSearchResults(data);
      }).catch((error) => {
        toast.error(error)
      }).finally(() => {
        setSearching(false)
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
  const handleSelectedItem = (name:string) => {
      setSearchValue(name.trim());
      setShowSearchResults(false)
      setSearchResults([])
      if(name){
        getVulnerabilityByName(name).then((data:any) => {
          setCurrentVulnerability(data as Vulnerability)
          console.log(data)
        }).catch((error) => {
          toast.error(error)
        });
      } else {
        setCurrentVulnerability(null)
      }
  }
  
  
  if(loading) return <FormSkeleton numInputs={4}/>
  if (loadingError) return <ModalErrorMessage message={"Error loading project"} />
  console.log(searchResults)

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
                          <span className='bg-secondary p-1 mr-1 my-1 rounded-lg text-xs text-white text-nowrap'>{v?.vulnerabilityname}
                          <span className="text-white ml-2">{showXCircle()}</span>
                          </span>
                        </div>
                        )
                      })
                    }
                    <div className="relative">
                      <input list="searchResults" placeholder='Add vulnerability' value={searchValue} onFocus={()=>setShowSearchResults(true)} onBlur={()=>setShowSearchResults(false)} className="border border-gray-200 p-2 rounded-md" type="text" onChange={handleNameSearch} />
                      {searching && <Spinner className="h-4 w-4 absolute right-8 top-3" />}
                    </div>
                  {searchResults.length > 0 &&
                    <List>
                      { searchResults.map((item, index)=>{
                          return <ListItem  key={`search-${index}`} onClick={()=>handleSelectedItem(item?.vulnerabilityname)} >{item?.vulnerabilityname}</ListItem>
                        })
                      }
                      <ListItem key='addNew'>[Add new]</ListItem>
                    </List>
                  }
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
function showXCircle(){
  return(
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
          )

}
export default withAuth(ProjectView);

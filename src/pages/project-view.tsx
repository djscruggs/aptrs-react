import React, { 
  useState, 
  useEffect,
} from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { withAuth } from "../lib/authutils";
import { FormSkeleton } from '../components/skeletons'
import { getProject, searchVulnerabilities } from '../lib/data/api';
import { Project } from '../lib/data/definitions'
import "react-datepicker/dist/react-datepicker.css";
import { ModalErrorMessage } from '../lib/formstyles';
import { StyleLabel } from '../lib/formstyles';
import PageTitle from '../components/page-title';
import { useDebounce } from '@uidotdev/usehooks';
import { toast } from 'react-hot-toast';




interface ProjectViewProps {
  id?: string; // Make the ID parameter optional
}
function ProjectView({ id: externalId}: ProjectViewProps): JSX.Element {
  const params = useParams()
  
  const { id: routeId } = params;
  const id = externalId || routeId; // Use externalId if provided, otherwise use routeId
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<Project>()
  const [loadingError, setLoadingError] = useState(false);
  
  const [searchValue, setSearchValue] = useState('')
  const debouncedValue = useDebounce<string>(searchValue, 500)
  const [searchResults, setSearchResults] = useState<{ vulnerabilityname: string }[]>([])
  useEffect(() => {
    const loadData = async () => {
      if (id) {
        setLoading(true);
        try {
          const projectData = await getProject(id) as Project;
          setProject(projectData as Project);
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
      searchVulnerabilities(debouncedValue).then((data) => {
        setSearchResults(data);
      }).catch((error) => {
        toast.error(error)
      });
    }
  }, [debouncedValue]);
  const handleNameSearch = (event:any) => {
    setSearchValue(event.target.value)
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
                <div className='w-1/3'>
                  <h1>Vulnerabilities</h1>
                  <input className="border border-gray-200 p-2 rounded-md" type="text" onChange={handleNameSearch} />
                  <ul>
                  { searchResults.map((item)=>{
                      return <li key={item?.vulnerabilityname}>{item?.vulnerabilityname}</li>;
                    })
                  }
                  </ul>
                </div>
              </div>
            </div>
            )
          }
        </>
  );
}

export default withAuth(ProjectView);

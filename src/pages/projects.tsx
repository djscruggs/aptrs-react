import {Project} from '../lib/data/definitions'
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { fetchProjects } from "../lib/data/api";
import { TableSkeleton } from '../components/skeletons'
import ErrorPage from '../components/error-page'
import PageTitle from '../components/page-title';
import { Link } from 'react-router-dom';
import { withAuth } from "../lib/authutils";
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';


interface ProjectsProps {
  pageTitle: string; 
  hideActions?: boolean;
}
export function Projects(props:ProjectsProps): JSX.Element {
  const [projects, setProjects] = useState<Project[]>();
  const [error, setError] = useState();
  useEffect(() => {
    fetchProjects()
      .then((data) => {
        setProjects(data as Project[]);
      }).catch((error) => {
        setError(error)})
  }, []);

  const navigate = useNavigate();
  const clickRow = (id: string) => {
    navigate('/projects/' + id)
  }

  if(error){
    console.error(error)
    return <ErrorPage />
  }
  if(typeof projects == 'undefined'){
    return (<TableSkeleton />)
  }
  
  
  return(
    <>
      {typeof(projects) == "object" && (
        <PageTitle title={props.pageTitle} />
      )}
      {typeof(projects) == "object" &&
        <div className="mt-6 flow-root">
          <div className="inline-block min-w-full align-middle">
            <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
              <div className="table w-full text-gray-900 md:table">
                <div className="table-header-group rounded-lg text-left text-sm">
                  <div className="table-row">
                    {!props.hideActions &&
                      <div className="table-cell text-left"> 
                        Action
                      </div>
                    }
                    <div className="table-cell text-left py-4 pl-2"> 
                      Name
                    </div>
                    <div className="table-cell text-left py-4 pl-2"> 
                      Description
                    </div>
                    <div className="table-cell text-left py-4 pl-2"> 
                      Start Date
                    </div>
                    <div className="table-cell text-left py-4 pl-2"> 
                      End Date
                    </div>
                  </div>
                </div>
                <div className="table-row-group">
                  {typeof(projects) === "object"  && projects.map((project: Project) => (
                    <div className="table-row py-4 pl-2 bg-white cursor-pointer"
                      key={project.id + "-web"}
                    >
                      {!props.hideActions &&
                        <div className="table-cell py-4 pl-2">
                          <Link to={`/projects/${project.id}/edit`}><PencilSquareIcon className="inline w-6" /></Link>
                          <Link to={`/projects/${project.id}/delete`}><TrashIcon className="inline w-6 ml-2" /></Link>
                        </div>
                      }
                      <div className="table-cell py-4 pl-2" onClick={()=> clickRow(String(project.id))}>
                          {project.name}
                      </div>
                      <div className="table-cell py-4 pl-2" onClick={()=> clickRow(String(project.id))}>
                        {project.description.length > 50 ?
                            `${project.description.substring(0, 50)}...` : project.description}
                      </div>
                      <div className="table-cell py-4 pl-2" onClick={()=> clickRow(String(project.id))}>
                        {project.startdate}
                      </div>
                      <div className="table-cell py-4 pl-2" onClick={()=> clickRow(String(project.id))}>
                      {project.enddate}
                      </div>
                      
                    </div>
                   ))
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </>
  )
}

export default withAuth(Projects);
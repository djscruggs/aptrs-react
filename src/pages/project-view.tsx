import React, { 
  useState, 
  useEffect,
  ChangeEvent, 
  FormEvent
} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { withAuth } from "../lib/authutils";
import Button from '../components/button';
import { FormSkeleton } from '../components/skeletons'
import { getProject } from '../lib/data/api';
import { Project } from '../lib/data/definitions'
import "react-datepicker/dist/react-datepicker.css";
import { ModalErrorMessage } from '../lib/formstyles';
import { StyleLabel } from '../lib/formstyles';
import PageTitle from '../components/page-title';




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
  
  
  if(loading) return <FormSkeleton numInputs={4}/>
  if (loadingError) return <ModalErrorMessage message={"Error loading project"} />


  return (
        <>
          {typeof(project) == 'object' && (
            <div className="max-w-lg flex-1 rounded-lg bg-white px-6 pb-4 ">
              <PageTitle title='Project Details' />
              <div className="w-full mb-4">
                <label className={StyleLabel}>
                  Name
                </label>
                
                <div className="relative">
                  {project.name}
                </div>
              </div>
              <div className="mt-4">
                <label className={StyleLabel}>
                  Type
                </label>
                <div className="relative">
                  {project.projecttype}
                </div>
              </div>
              <div className="mt-4">
                <label className={StyleLabel}>
                  Company
                </label>
                <div className="relative">
                  {project.companyname} 
                </div>
              </div>
              <div className='grid grid-cols-2'>
                <div className="mt-4">
                  <label className={StyleLabel}>
                    Start Date
                  </label>
                  <div className="relative">
                    {project.startdate} 
                  </div>
                </div>
                <div className="mt-4">
                  <label className={StyleLabel}>
                    End Date
                  </label>
                  <div className="relative">
                    {project.enddate}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className={StyleLabel}>
                  Testing Type
                </label>
                <div className="relative">
                  {project.testingtype}
                </div>
              </div>
              <div className="mt-4">
                <label className={StyleLabel}>
                  Project Exception
                </label>
                <div className="relative">
                  {project.projectexception}
                </div>
              </div>
              <div className="mt-4">
                <label className={StyleLabel} >
                  Description
                </label>
                <div className="relative">
                  {project.description}
                </div>
              </div>
            </div>
            )
          }
        </>
  );
}

export default withAuth(ProjectView);

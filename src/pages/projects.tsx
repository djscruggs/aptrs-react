import { withAuth } from "../lib/authutils";
import { fetchProjects } from "../lib/data/api";
import { useEffect, useState } from "react";
import ProjectList from '../components/project-list'
import { Suspense } from 'react';
import {InvoicesTableSkeleton} from '../components/skeletons'

const Projects = () => {
  
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects().then((projects) => setProjects(projects));
  }, []);

  if (!projects) return (<div>Loading...</div>);
  
 return (
    <>
      <h1>Projects</h1>
      <Suspense key="abce" fallback={<InvoicesTableSkeleton />}>
        <ProjectList projects = {projects} />
      </Suspense>
    </>
  )
}

export default withAuth(Projects);
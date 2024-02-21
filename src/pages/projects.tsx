import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { fetchProjects, searchProjects, deleteProjects } from "../lib/data/api";
import { TableSkeleton } from '../components/skeletons'
import { toast } from 'react-hot-toast';
import PageTitle from '../components/page-title';
import { Link } from 'react-router-dom';
import { withAuth} from "../lib/authutils";
import { parseErrors } from "../lib/utilities"
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import {Project, Column} from '../lib/data/definitions'
import DataTable from 'react-data-table-component';
import Button from '../components/button';


interface ProjectsProps {
  pageTitle: string; 
  searchTerm?: string
  hideActions?: boolean;
  refresh: boolean | undefined
}
export function Projects(props:ProjectsProps): JSX.Element {
  const [projects, setProjects] = useState<Project[]>();
  const [error, setError] = useState();
  const [refresh, setRefresh] = useState(Boolean(props.refresh))
  const [selected, setSelected] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(20)
  interface ProjectWithActions extends Project {
    actions: JSX.Element;
  }
  useEffect(() => {
    if(props.searchTerm && !refresh){
      return searchForProjects()
    } else {
      return loadAllProjects()
    }
  }, [props.searchTerm, refresh]);
  const loadAllProjects = () => {
    //TODO pagination
    //{{domainname}}/api/project/projects/filter?name=j&companyname=&projecttype=&testingtype=&owner=u&status=del&startdate=&enddate_before=&limit=10&offset=0
    //https://react-data-table-component.netlify.app/?path=/story/pagination-remote--remote
    fetchProjects()
      .then((data) => {
        let temp: any = []
        data.forEach((row: ProjectWithActions) => {
          row.actions = (<>
                          {!props.hideActions &&
                          <>
                          <Link to={`/projects/${row.id}/edit`}><PencilSquareIcon className="inline w-6" /></Link>
                          <TrashIcon className="inline w-6 ml-2 cursor-pointer" onClick={()=> handleDelete(row.id)}/>
                          </>
                           }                     
                        </>)
          temp.push(row)
        });
        //for testing purposes
        let largerDataset = temp.concat(temp, temp, temp, temp);
        setProjects(largerDataset as ProjectWithActions[])
      }).catch((error) => {
        setError(error)})
  }
  const searchForProjects = () =>{
    if(!props.searchTerm){
      console.error('No search term provided')
      return;
    }
    searchProjects(props.searchTerm)
      .then((data) => {
        let temp: any = []
        data.forEach((row: ProjectWithActions) => {
          row.actions = (<>
                          {!props.hideActions &&
                          <>
                          <Link to={`/projects/${row.id}/edit`}><PencilSquareIcon className="inline w-6" /></Link>
                          <TrashIcon className="inline w-6 ml-2 cursor-pointer" onClick={()=> handleDelete(row.id)}/>
                          </>
                           }                     
                        </>)
          temp.push(row)
        });
        setProjects(temp as ProjectWithActions[])
      }).catch((error) => {
        setError(error)})
  }
  const onRowClicked = (row:any) => navigate(`/projects/${row.id}`);

  const columns: Column[] = [
    {
      name: 'Action',
      selector: (row: any) => row.actions,
      maxWidth: '5em',
      omit: props.hideActions
    },
    {
      name: 'Name',
      selector: (row: Project) => row.name,
      sortable: true,
    },
    {
      name: 'Status',
      selector: (row: Project) => row.status,
    },
    {
      name: 'Description',
      selector: (row: Project) => row.description.length > 50 ? row.description.substring(0, 50) + '...' : row.description,
    },
    {
      name: 'Start Date',
      selector: (row: Project) => row.startdate,
      sortable: true,
    },
    {
      name: 'End Date',
      selector: (row: Project) => row.enddate,
    },
  ];
  const navigate = useNavigate();
  const handleNew = () => {
    navigate('/projects/new')
  }
  const handleDelete = async (ids: any[]) => {
    if (!confirm('Are you sure?')) {
      return false;
    }
    const count = ids.length;
    try {
      const result = await deleteProjects(ids)
      setRefresh(true);
      let msg: string;
      if (count === 1) {
        msg = 'Project deleted';
      } else {
        msg = `${count} projects deleted`;
      }
      toast.success(msg);
      setSelected([])
    } catch(error) {
        const msg = parseErrors(error);
        setError(msg);
    }
    
  };
  const deleteMultiple = () => {
    return handleDelete(selected)
  }
  const handleSelectedChange = (event: any) => {
    const ids = event.selectedRows.map((item:any) => item.id);
    setSelected(ids)
  }
  if(error){
    console.error(error)
    navigate('/error')
  }
  if(typeof projects == 'undefined'){
    return (<TableSkeleton />)
  }
  
  return(
    <>
      {typeof(projects) == "object" && (
        <PageTitle title={props.pageTitle} />
      )}
      
      <div className="mt-6 flow-root">
        <Button className='btn bg-primary float-right m-2' onClick={handleNew}>
          New Project
        </Button>
        {selected.length > 0 &&
        <Button className="btn bg-secondary float-right m-2 mr-0 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200" 
          disabled={selected.length == 0}
          onClick = {deleteMultiple}>
            Delete
        </Button>
        }
        {typeof(projects) == "object" &&
            <DataTable
              columns={columns}
              data={projects}
              selectableRows={!props.hideActions}
              onRowClicked={onRowClicked}
              pagination
              paginationPerPage={rowsPerPage}
              striped
              onSelectedRowsChange={handleSelectedChange}
            />
          }
      </div>
    </>
  )
}

export default withAuth(Projects);
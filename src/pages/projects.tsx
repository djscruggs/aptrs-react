import { useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom";
import { fetchProjects, fetchFilteredProjects, searchProjects, deleteProjects } from "../lib/data/api";
import { TableSkeleton } from '../components/skeletons'
import { toast } from 'react-hot-toast';
import PageTitle from '../components/page-title';
import { Link } from 'react-router-dom';
import { withAuth} from "../lib/authutils";
import { parseErrors } from "../lib/utilities"
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import {Project, Column, ProjectsQueryParams, FilteredSet} from '../lib/data/definitions'
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
  const [totalRows, setTotalRows] = useState(0);

  const DEFAULT_LIMIT = 20
  const DEFAULT_OFFSET = 0
  const [queryParams, setQueryParams] = useState<ProjectsQueryParams>({
    limit: DEFAULT_LIMIT,
    offset: 0,
    name: '',
    companyname: '',
    projecttype: '',
    testingtype: '',
    owner: '',
    status: '',
    startdate: '',
    enddate_before: '',
  })
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const newQueryParams: ProjectsQueryParams = {
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
      name: searchParams.get('name') || '',
      companyname: searchParams.get('companyname') || '',
      projecttype: searchParams.get('projecttype') || '',
      testingtype: searchParams.get('testingtype') || '',
      owner: searchParams.get('owner') || '',
      status: searchParams.get('status') || '',
      startdate: searchParams.get('startdate') || '',
      enddate_before: searchParams.get('enddate_before') || '',
    };
    setQueryParams(newQueryParams);
  }, [location.search]);
  useEffect(() => {
    const searchParams = new URLSearchParams();
    if (queryParams.limit !== DEFAULT_LIMIT) searchParams.set('limit', queryParams.limit.toString());
    if (queryParams.offset !== DEFAULT_OFFSET) searchParams.set('offset', queryParams.offset.toString());
    if (queryParams.name) searchParams.set('name', queryParams.name);
    if (queryParams.companyname) searchParams.set('companyname', queryParams.companyname);
    if (queryParams.projecttype) searchParams.set('projecttype', queryParams.projecttype);
    if (queryParams.testingtype) searchParams.set('testingtype', queryParams.testingtype);
    if (queryParams.owner) searchParams.set('owner', queryParams.owner);
    if (queryParams.status) searchParams.set('status', queryParams.status);
    if (queryParams.startdate) searchParams.set('startdate', queryParams.startdate);
    if (queryParams.enddate_before) searchParams.set('enddate_before', queryParams.enddate_before);
  
    const newUrl = `${location.pathname}?${searchParams.toString()}`;
    navigate(newUrl, { replace: true })
  }, [queryParams]);
  const handleQueryChange = (name:string, value:any):void => {
    setQueryParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
  
  const handlePerRowsChange = async (newPerPage: number, page: number) => {
    handleQueryChange('limit',newPerPage)
	};
  const handlePageChange = async (page: number) => {
    //convert page number to offset
    let offset = 0
    if(page > 1){
      offset = ((page-1) * queryParams.limit)
    }
    handleQueryChange('offset',offset)
	};
  interface ProjectWithActions extends Project {
    actions: JSX.Element;
  }
  useEffect(() => {
    console.log('load triggered')
    if(props.searchTerm && !refresh){
      return searchForProjects()
    } else {
      return loadAllProjects()
    }
  }, [props.searchTerm, refresh, location.search]);
  const loadAllProjects = () => {
    console.log('loading')
    //TODO pagination
    //{{domainname}}/api/project/projects/filter?name=j&companyname=&projecttype=&testingtype=&owner=u&status=del&startdate=&enddate_before=&limit=10&offset=0
    //https://react-data-table-component.netlify.app/?path=/story/pagination-remote--remote
    fetchFilteredProjects(queryParams)
      .then((data:FilteredSet) => {

        let temp: any = []
        setTotalRows(data.count)
        data.results.forEach((row: ProjectWithActions) => {
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
              paginationPerPage={queryParams.limit}
              onChangeRowsPerPage={handlePerRowsChange}
              onChangePage={handlePageChange}
              paginationTotalRows={totalRows}
              striped
              onSelectedRowsChange={handleSelectedChange}
            />
          }
      </div>
    </>
  )
}

export default withAuth(Projects);
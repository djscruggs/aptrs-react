import { useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom";
import { fetchFilteredProjects, deleteProjects } from "../lib/data/api";
import { TableSkeleton, RowsSkeleton } from '../components/skeletons'
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
  refresh?: boolean | undefined
}
export function Projects(props:ProjectsProps): JSX.Element {
  const [projects, setProjects] = useState<Project[]>();
  const [error, setError] = useState<any>();
  const [refresh, setRefresh] = useState(Boolean(props.refresh))
  const [selected, setSelected] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate();
  const DEFAULT_LIMIT = 20
  const DEFAULT_OFFSET = 0
  const [queryParams, setQueryParams] = useState<ProjectsQueryParams>({
    limit: DEFAULT_LIMIT,
    offset: 0,
    name: props.searchTerm,
    companyname: '',
    projecttype: '',
    testingtype: '',
    owner: '',
    status: '',
    startdate: '',
    enddate_before: '',
  })
  useEffect(() => {
    console.log('useEffect with search term', props.searchTerm)
    setQueryParams(prev => ({
      ...prev,
      name: props.searchTerm
    }));
    filterProjects()
  }, [props.searchTerm]);
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const newQueryParams: ProjectsQueryParams = {
      limit: parseInt(searchParams.get('limit') || DEFAULT_LIMIT.toString()),
      offset: parseInt(searchParams.get('offset') || DEFAULT_OFFSET.toString()),
    };
    Object.keys(queryParams).forEach(key => {
      if (key !== 'limit' && key !== 'offset') {
        newQueryParams[key] = searchParams.get(key) || '';
      }
    });
    console.log('location search changed, location & params are', location, newQueryParams)
    filterProjects()
  }, [location.search]);
  // useEffect(() => {
  //   const searchParams = new URLSearchParams();
  //   if (queryParams.limit !== DEFAULT_LIMIT) searchParams.set('limit', queryParams.limit.toString());
  //   if (queryParams.offset !== DEFAULT_OFFSET) searchParams.set('offset', queryParams.offset.toString());
  //   Object.keys(queryParams).forEach(key => {
  //     if (key !== 'limit' && key !== 'offset' && queryParams[key]) {
  //       if(queryParams[key]!=='') {
  //         searchParams.set(key, queryParams[key] as string);
  //       }
  //     }
  //   });
  //   if(searchParams.toString()!==''){
  //     const newUrl = `${location.pathname}?${searchParams.toString()}`;
  //     console.log('newUrl', newUrl)
  //     navigate(newUrl, { replace: true })
  //   } else {
      
  //   }
  // }, [queryParams]);

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
    console.log('handlePageChange', page)
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
    if(refresh) {
      filterProjects()
    }
  }, [refresh]);
  const filterProjects = async () => {
    console.log('loading, params are', queryParams)
    setLoading(true)
    //TODO pagination
    //{{domainname}}/api/project/projects/filter?name=j&companyname=&projecttype=&testingtype=&owner=u&status=del&startdate=&enddate_before=&limit=10&offset=0
    //https://react-data-table-component.netlify.app/?path=/story/pagination-remote--remote
    try {
      const data:FilteredSet = await fetchFilteredProjects(queryParams)
      let temp: any = []
      
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
      setTotalRows(data.count)
      setProjects(temp as ProjectWithActions[])
    } catch(error){
      if (error instanceof Error) {
        setError(error);
      }
    } finally {
      setLoading(false)
    }
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
  
  const handleNew = () => {
    navigate('/projects/new')
  }
  const handleDelete = async (ids: any[]) => {
    if (!confirm('Are you sure?')) {
      return false;
    }
    const count = ids.length;
    try {
      await deleteProjects(ids)
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
        {loading && <RowsSkeleton num={queryParams.limit}/>}
        {(!loading && typeof(projects) == "object") &&
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
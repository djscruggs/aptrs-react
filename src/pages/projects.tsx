import { useEffect, useState, useReducer, useCallback} from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { fetchFilteredProjects, deleteProjects } from "../lib/data/api";
import { RowsSkeleton } from '../components/skeletons'
import { toast } from 'react-hot-toast';
import PageTitle from '../components/page-title';
import { Link } from 'react-router-dom';
import { withAuth} from "../lib/authutils";
import { parseErrors } from "../lib/utilities"
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Project, Column, ProjectsQueryParams, FilteredSet } from '../lib/data/definitions'
import DataTable from 'react-data-table-component';
import Button from '../components/button';
import SearchBar from "../components/searchbar";
 
interface ProjectsProps {
  pageTitle: string; 
  embedded?: boolean;
  refresh?: boolean | undefined
  onClear?: () => void //call back to clear search if embedded
}
const DEFAULT_LIMIT = 20
type Mode = 'idle' | 'loading' | 'error';
type State = {
  /** A high-level description of the current state of the app
   * (e.g., if it's loading or encountered an error). */
  mode: Mode;
  /** The current set of project results returned by the API. */
  projects: Project[] | ProjectWithActions[];
  /** The the current query params, Defaults to {offset:0, limit:DEFAULT_LIMIT}. */
  queryParams: ProjectsQueryParams;
  /** Total rows in the data set after params are applied and data returned */
  totalRows: number;
  // The current search term
  searchTerm?: string;
  //Error - can be object or string, will try to format with parseErrors()
  error?: any;
};
type Action = 
 | { type: 'set-mode'; payload: Mode }
 | { type: 'set-search'; payload: string }
 | { type: 'set-page'; payload: number }
 | { type: 'set-rows-per-page'; payload: number }
 | { type: 'set-error'; payload: any }
 | { type: 'clear-search'}
 | { type: 'set-projects-data'; payload: { data: FilteredSet} }
 | { type: 'reset'}
 
interface ProjectWithActions extends Project {
  actions: JSX.Element;
}



export function Projects(props:ProjectsProps): JSX.Element {
  const initialState: State = {
    mode: 'idle',
    projects: [],
    queryParams: {offset:0, limit:DEFAULT_LIMIT},
    totalRows: 0,
  };
  // initial load - if there's a search term in the url, set it in state,
  // this makes search load immediately in useEffect
  const params = new URLSearchParams(window.location.search);
  const search = params.get('name') || '';
  if(search){
    initialState.queryParams = {offset:0, limit:DEFAULT_LIMIT, name: search};
  }
  function formatDataActions(data:FilteredSet):ProjectWithActions[] {
    const formatted: ProjectWithActions[] = [];
    data.results.forEach((row: ProjectWithActions) => {
      row.actions = (<>
                      <Link to={`/projects/${row.id}/edit`}><PencilSquareIcon className="inline w-6" /></Link>
                      <TrashIcon className="inline w-6 ml-2 cursor-pointer" onClick={()=> handleDelete([row.id])}/>
                    </>)
      formatted.push(row)
    });
    return formatted
  }
  
  
  const handleSearch = (term = '') => {
    if (term) {
      dispatch({ type: 'set-search', payload: term });
      const params = new URLSearchParams(window.location.search);
      params.set('name', term);
      navigate(`?${params.toString()}`, { replace: true });
    } else {
      dispatch({ type: 'clear-search'})
      navigate(location.pathname, { replace: true });
    }
  }
  
  const reducer = (state: State, action: Action): State => {
    switch (action.type) {
      case 'set-mode': {
        if(state.mode == action.payload){
          return state
        }
        return { ...state, mode: action.payload };
      }
      case 'set-projects-data': {
        const { data } = action.payload;
        const totalRows = data.count
        const projects = props.embedded ? (data.results as Project[]) : formatDataActions(data)as ProjectWithActions[];
        return { ...state, projects: projects, totalRows, mode: 'idle' };
      }
      case 'set-search': {
        if(state.queryParams.name === action.payload) {
          return state
        }
        let newQueryParams = {name: action.payload, offset: 0, limit: state.queryParams?.limit || DEFAULT_LIMIT}
        return {...state, queryParams: newQueryParams};
      }
      case 'set-rows-per-page': {
        if(state.queryParams.limit === action.payload){
          return state
        }
        let newQueryParams = {...state.queryParams, limit: action.payload}
        return {...state, queryParams: newQueryParams};
      }
      case 'set-page': {
        let newOffset = (action.payload-1) * state.queryParams.limit
        if(newOffset == state.queryParams.offset){
          return state
        }
        let newQueryParams = {...state.queryParams, offset: newOffset}
        return {...state, queryParams: newQueryParams};
      }
      case 'set-error': {
        return {...state, error: parseErrors(action.payload)};
      }
      case 'clear-search': {
        const newQueryParams = {offset: 0, limit: state.queryParams?.limit || DEFAULT_LIMIT};
        if(JSON.stringify(state.queryParams) == JSON.stringify(newQueryParams)){
          return state
        }
        return {...state, queryParams: newQueryParams};
        
      }
      case 'reset': {
        const newQueryParams = {offset: 0, limit: state.queryParams?.limit || DEFAULT_LIMIT};
        return {...initialState, queryParams: newQueryParams};
      }
      default:
        return initialState;
    }
  };
  const [state, dispatch] = useReducer(reducer, initialState);
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  
  
  useEffect(() => {
    filterProjects()
  }, [state.queryParams])
  
  const handlePerRowsChange = (newPerPage: number) => {
    //for some reason this function gets called by react-data-table on page load, skip if there's no actual change
    dispatch({ type: 'set-rows-per-page', payload: newPerPage });
  }
  function handlePageChange(page: number){
    dispatch({ type: 'set-page', payload: page });
  }
  const filterProjects = async () => {
    try {
      dispatch({ type: 'set-mode', payload: 'loading' });
      const data:FilteredSet = await fetchFilteredProjects(state.queryParams)
      dispatch({ type: 'set-projects-data', payload: {data} });
    } catch(error){
      dispatch({ type: 'set-error', payload: error });
    } finally {
      dispatch({ type: 'set-mode', payload: 'idle' });
    }
  }
  const onRowClicked = (row:any) => navigate(`/projects/${row.id}`);

  const columns: Column[] = [
    {
      name: 'Action',
      selector: (row: any) => row.actions,
      maxWidth: '5em',
      omit: props.embedded
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
      dispatch({ type: 'reset'});
      let msg: string;
      if (count === 1) {
        msg = 'Project deleted';
      } else {
        msg = `${count} projects deleted`;
      }
      toast.success(msg);
      setSelected([])
    } catch(error) {
      dispatch({ type: 'set-error', payload: error });
    }
    
  };
  const deleteMultiple = () => {
    return handleDelete(selected)
  }
  const handleSelectedChange = (event: any) => {
    const ids = event.selectedRows.map((item:any) => item.id);
    setSelected(ids)
  }
  const clearSearch = () => {
    dispatch({ type: 'clear-search'})
    navigate(location.pathname, { replace: true }); 
  }
  
  if(state.error){
    console.error(state.error)
    navigate('/error')
  }
  
  
  return(
    <>
      {props.pageTitle && <PageTitle title={props.pageTitle} /> }
      <div className="mt-6 flow-root" key={`searchkey-${state.queryParams.name}`}>
        <SearchBar onSearch={handleSearch} onClear={clearSearch} searchTerm={state.queryParams.name}/>
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
         {state.queryParams.name &&
          <p className="mt-8">
            Results for &quot;{state.queryParams.name}&quot;
            <span className="text-xs">(<span className="ml-1 underline text-blue-600" onClick={clearSearch}>clear</span>)</span>
          </p>
        }
        {state.mode === 'loading' && <div className="mt-16"><RowsSkeleton numRows={state.queryParams.limit}/></div>} 
        <div className={state.mode != 'idle' ? 'hidden' : ''}>
          <DataTable
            columns={columns}
            data={state.projects}
            selectableRows={!props.embedded}
            onRowClicked={onRowClicked}
            progressPending={state.mode === 'loading'}
            progressComponent={<div className="mt-16"><RowsSkeleton numRows={state.queryParams.limit}/></div>}
            pagination
            paginationServer
            paginationPerPage={state.queryParams.limit}
            onChangeRowsPerPage={handlePerRowsChange}
            onChangePage={handlePageChange}
            paginationTotalRows={state.totalRows}
            striped
            onSelectedRowsChange={handleSelectedChange}
          />
        </div>  
      </div>
    </>
  )
}

export default withAuth(Projects);
import { useEffect, useState, useCallback} from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { fetchFilteredProjects, deleteProjects } from "../lib/data/api";
import { RowsSkeleton } from '../components/skeletons'
import { toast } from 'react-hot-toast';
import PageTitle from '../components/page-title';
import { Link } from 'react-router-dom';
import { WithAuth} from "../lib/authutils";
import { useDataPageReducer } from '../lib/useDataPageReducer';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Project, Column, FilteredSet, DatasetState, DatasetAction, DEFAULT_DATA_LIMIT } from '../lib/data/definitions'
import DataTable from 'react-data-table-component';
import Button from '../components/button';
import SearchBar from "../components/searchbar";
 
interface ProjectsProps {
  pageTitle: string; 
  embedded?: boolean;
  refresh?: boolean | undefined
  onClear?: () => void //call back to clear search if embedded
}


 
interface ProjectWithActions extends Project {
  actions: JSX.Element;
}



export function Projects(props:ProjectsProps): JSX.Element {
  const initialState: DatasetState = {
    mode: 'idle',
    data: [],
    queryParams: {offset:0, limit:DEFAULT_DATA_LIMIT},
    totalRows: 0,
  };
  // initial load - if there's a search term in the url, set it in state,
  // this makes search load immediately in useEffect
  const params = new URLSearchParams(window.location.search);
  const search = params.get('name') || '';
  if(search){
    initialState.queryParams = {offset:0, limit:DEFAULT_DATA_LIMIT, name: search};
  }
  function formatDataActions(data:any):ProjectWithActions[] {
    const formatted: ProjectWithActions[] = [];
    console.log('in formatDataActions', data)
    data.forEach((row: ProjectWithActions) => {
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
  
  //partial reducer for search and pagination; the rest is handled by useDataPageReducer
  const reducer = (state: DatasetState, action: DatasetAction): DatasetState | void => {
    switch (action.type) {
      case 'reset': {
      const newQueryParams = {offset: 0, limit: state.queryParams?.limit || DEFAULT_DATA_LIMIT};
      return {...initialState, queryParams: newQueryParams};
      }
      case 'set-search': {
        if(state.queryParams.name === action.payload) {
          return state
        }
        let newQueryParams = {name: action.payload, offset: 0, limit: state.queryParams?.limit || DEFAULT_DATA_LIMIT}
        return {...state, queryParams: newQueryParams};
      }
    }
  };
  const [state, dispatch] = useDataPageReducer(reducer, initialState);
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
      dispatch({ type: 'set-data', payload: {data} });
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
            <span className="text-xs ml-1">(<span className="underline text-blue-600" onClick={clearSearch}>clear</span>)</span>
          </p>
        }
        {state.mode === 'loading' && <div className="mt-16"><RowsSkeleton numRows={state.queryParams.limit}/></div>} 
        <div className={state.mode != 'idle' ? 'hidden' : ''}>
          <DataTable
            columns={columns}
            data={formatDataActions(state.data)}
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

export default WithAuth(Projects);
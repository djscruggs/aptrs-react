import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { fetchFilteredProjects, deleteProjects } from "../lib/data/api";
import { RowsSkeleton } from '../components/skeletons'
import { toast } from 'react-hot-toast';
import PageTitle from '../components/page-title';
import { Link } from 'react-router-dom';
import { WithAuth} from "../lib/authutils";
import { useDataReducer } from '../lib/useDataReducer';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Project, Column, FilteredSet} from '../lib/data/definitions'
import {  DatasetState, DatasetAction, DEFAULT_DATA_LIMIT } from '../lib/useDataReducer'
import DataTable from 'react-data-table-component';
import Button from '../components/button';
import SearchBar from "../components/searchbar";
import { FunnelIcon } from '@heroicons/react/24/outline';
 
export interface ProjectsProps {
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
    data.forEach((row: ProjectWithActions) => {
      row.actions = (<>
                      <Link to={`/projects/${row.id}/edit`}><PencilSquareIcon className="inline w-5" /></Link>
                      <TrashIcon className="inline w-5 ml-1 cursor-pointer" onClick={()=> handleDelete([row.id])}/>
                    </>)
      formatted.push(row)
    });
    return formatted
  }
  
  
  //partial reducer for search and pagination; the rest is handled by useDataReducer
  const reducer = (state: DatasetState, action: DatasetAction): DatasetState | void => {
    switch (action.type) {
      case 'set-search': {
        if(state.queryParams.name === action.payload) {
          return state
        }
        let newQueryParams = {name: action.payload, offset: 0, limit: state.queryParams?.limit || DEFAULT_DATA_LIMIT}
        return {...state, queryParams: newQueryParams};
      }
    }
  };
  const [state, dispatch] = useDataReducer(reducer, initialState);
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  
  
  useEffect(() => {
    loadData()
  }, [state.queryParams])
  
  const handlePerRowsChange = (newPerPage: number) => {
    dispatch({ type: 'set-rows-per-page', payload: newPerPage });
  }
  function handlePageChange(page: number){
    dispatch({ type: 'set-page', payload: page });
  }
  const loadData = async () => {
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
  const HeaderFilter = ({label, name}: {label: string, name: string}):JSX.Element => {
    return (
      <><input type="text" className='p-2 border border-gray-300 rounded-md w-full' name={name.toLowerCase().replace(' ','')} placeholder={label} onChange={handleFilter}/><FunnelIcon className='-ml-6 w-4 h-4'/></>
    )
  }
  const columns: Column[] = [
    {
      name: 'Action',
      selector: (row: any) => row.actions,
      maxWidth: '2rem',
      omit: props.embedded
    },
    {
      name: <HeaderFilter label='Name' name='name'/>,
      selector: (row: Project) => row.name,
      sortable: false,
      maxWidth: '16rem',
    },
    {
      name: <HeaderFilter label='Company' name='companyname'/>,
      selector: (row: Project) => row.companyname,
      maxWidth: '9rem',
    },
    {
      name: <HeaderFilter label='Owner' name='owner'/>,
      selector: (row: Project) => row.owner,
      maxWidth: '7rem',
    },
    {
      name: <HeaderFilter label='Status' name='status'/>,
      selector: (row: Project) => row.status,
      maxWidth: '7rem',
    },
    {
      name: <HeaderFilter label='Project Type' name='projecttype'/>,
      selector: (row: Project) => row.projecttype,
      maxWidth: '200px',
    },
    
    {
      name: 'Start Date',
      selector: (row: Project) => row.startdate,
      maxWidth: '120px',
    },
    {
      name: 'End Date',
      selector: (row: Project) => row.enddate,
      maxWidth: '120px',
    },
  ];
  
  const handleFilter = (event:any) => {
    console.log(event.target.name, event.target.value)
  }
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
  const clearSearch = () => {
    return handleSearch('')
  }
  
  if(state.error){
    console.error(state.error)
    navigate('/error')
  }
  return(
    <>
      {props.pageTitle && <PageTitle title={props.pageTitle} /> }
      <div className="mt-6 flow-root" >
        <div key={`searchkey-${state.queryParams.name}`}>
          <SearchBar onSearch={handleSearch} onClear={clearSearch} searchTerm={state.queryParams.name}/>
        </div>
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
            progressPending={state.mode != 'idle'}
            pagination
            paginationServer
            paginationPerPage={state.queryParams.limit}
            onChangeRowsPerPage={handlePerRowsChange}
            onChangePage={handlePageChange}
            paginationTotalRows={state.totalRows}
            striped
            highlightOnHover
            onSelectedRowsChange={handleSelectedChange}
          />
        </div>  
      </div>
    </>
  )
}




export default WithAuth(Projects);


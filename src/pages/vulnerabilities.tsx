import {Vulnerability, Column, DatasetState, DatasetAction, FilteredSet, DEFAULT_DATA_LIMIT} from '../lib/data/definitions';
import { useEffect, useState, useReducer } from 'react';
import { useNavigate } from 'react-router-dom'
import {  fetchVulnerabilities, fetchFilteredVulnerabilities, deleteVulnerabilities } from "../lib/data/api";
import { RowsSkeleton } from '../components/skeletons'
import PageTitle from '../components/page-title';
import SearchBar from '../components/searchbar';
import { WithAuth } from "../lib/authutils";
import { useDataPageReducer } from '../lib/useDataPageReducer';
import Button from '../components/button';
import { TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import DataTable from 'react-data-table-component';
import { useVulnerabilityColor } from '../lib/customHooks';
import { toast } from 'react-hot-toast';
import {searchVulnerabilities} from "../lib/data/api";



interface VulnWithActions extends Vulnerability {
  actions?: JSX.Element;
  severity?:JSX.Element;
}

 
const Vulnerabilities = () => {
  const initialState: DatasetState = {
    mode: 'idle',
    data: [],
    queryParams: {offset:0, limit:DEFAULT_DATA_LIMIT},
    totalRows: 0,
  };
  // initial load - if there's a search term in the url, set it in state,
  // this makes search load immediately in useEffect
  const params = new URLSearchParams(window.location.search);
  const search = params.get('vulnerabilityname') || '';
  if(search){
    initialState.queryParams = {offset:0, limit:DEFAULT_DATA_LIMIT, vulnerabilityname: search};
  }
  //reducer for search and pagination
  const reducer = (state: DatasetState, action: DatasetAction): DatasetState|void => {
    switch (action.type) {
      case 'reset': {
        const newQueryParams = {offset: 0, limit: state.queryParams?.limit || DEFAULT_DATA_LIMIT};
        return {...initialState, queryParams: newQueryParams};
      }
      case 'set-search': {
        console.log('set-search called', action.payload)
        if(state.queryParams.vulnerabilityname === action.payload) {
          return state
        }
        let newQueryParams = {vulnerabilityname: action.payload, offset: 0, limit: state.queryParams?.limit || DEFAULT_DATA_LIMIT}
        return {...state, queryParams: newQueryParams};
      }
    }
  };
  const [state, dispatch] = useDataPageReducer(reducer, initialState);
  const [selected, setSelected] = useState([])
  const [refresh, setRefresh] = useState(false);
  
  const navigate = useNavigate()
  const loadData = async () => {
    try {
      dispatch({ type: 'set-mode', payload: 'loading' });
      const data:FilteredSet = await fetchFilteredVulnerabilities(state.queryParams)
      let temp = formatRows(data.results)
      data.results = temp
      console.log(data)
      dispatch({ type: 'set-data', payload: {data} });
    } catch(error){
      dispatch({ type: 'set-error', payload: error });      
    } finally {
      dispatch({ type: 'set-mode', payload: 'idle' });
      setRefresh(false)
    }
  }
  async function handleSearch(term='') {
    const value = term.trim()
    if(!value) return;
    dispatch({ type: 'set-search', payload: value });
  }
  const handleSelectedChange = (event: any) => {
    const ids = event.selectedRows.map((item:any) => item.id);
    setSelected(ids)
  }
  const clearSearch = ():void => {
    dispatch({ type: 'clear-search'});
    setRefresh(true)
  }
  
  useEffect(() => {
    loadData()
  }, [refresh, state.queryParams]);
  const handlePerRowsChange = (newPerPage: number) => {
    //for some reason this function gets called by react-data-table on page load, skip if there's no actual change
    dispatch({ type: 'set-rows-per-page', payload: newPerPage });
  }
  function handlePageChange(page: number){
    dispatch({ type: 'set-page', payload: page });
  }
  
  const handleDelete = async (ids: any[]) => {
    if (!confirm('Are you sure?')) {
      return false;
    }
    try {
      const count = ids.length;
      await deleteVulnerabilities(ids)
      setRefresh(true);
      let msg: string;
      if (count === 1) {
        msg = 'Vulnerability deleted';
      } else {
        msg = `${count} vulnerabilities deleted`;
      }
      toast.success(msg);
    } catch(error) {
        console.error(error);
        dispatch({ type: 'set-error', payload: error });
    } finally {
        dispatch({ type: 'set-mode', payload: 'idle' });
        setSelected([])
    };
    return false;
  };
  function formatRows(rows: VulnWithActions[]):VulnWithActions[] {
  
    let temp: any = []
    rows.forEach((row: VulnWithActions) => {
      row.actions = (<>
                    <PencilSquareIcon onClick={() => navigate(`/vulnerabilities/${row.id}/edit`)} className="inline w-6 cursor-pointer"/>
                    
                    <TrashIcon onClick={() => handleDelete([row.id])} className="inline w-6 ml-2 cursor-pointer" />                        
                    </>)
      const [meaning, color] = useVulnerabilityColor(row.vulnerabilityseverity as string)
      row.severity = (<span className={`text-[${color}]`}>{meaning}</span>)
      temp.push(row)
    });
    return temp;
  
  }
  
  const columns: Column[] = [
    {
      name: 'Action',
      selector: (row: VulnWithActions) => row.actions,
      maxWidth: '5em'
    },
    {
      name: 'Name',
      selector: (row: VulnWithActions) => row.vulnerabilityname,
      sortable: true,
      maxWidth: '10em'
    },
    {
      name: 'Severity',
      selector: (row: VulnWithActions) => row.severity,
      sortable: true,
      maxWidth: '20em'
    },
    {
      name: 'CVSS 3.1',
      selector: (row: VulnWithActions) => row.cvssscore,
      maxWidth: '5em'
    },
    
  ]
  const deleteMultiple = () => {
    return handleDelete(selected)
  }
  if(state.error){
    console.error(state.error)
    navigate('/error')
  }
  return(
    <>
       
       <PageTitle title='Vulnerabilities' />
       <div className='mt-4 mb-8 max-w-lg'>
        <SearchBar onSearch={handleSearch} onClear={()=>setRefresh(true)} searchTerm={state.queryParams.vulnerabilityname} placeHolder='Search vulnerabilities'/>
       </div>
        <div className="flow-root max-w-lg">
        <Button 
            className='btn bg-primary float-right m-2 mr-0' 
            onClick={()=> navigate('/vulnerabilities/new')}
          >
              New
        </Button>
        {selected.length > 0 &&
          <Button  
            className="bg-secondary float-right m-2 mr-0 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200" 
            disabled={selected.length == 0}
            onClick = {deleteMultiple}
          >
            Delete
          </Button>
        }
        {state.queryParams.vulnerabilityname &&
          <p className="mt-8">
            Results for &quot;{state.queryParams.vulnerabilityname}&quot;
            <span className="text-xs">(<span className="ml-1 underline text-blue-600" onClick={clearSearch}>clear</span>)</span>
          </p>
        }
        
        
          <div className='mt-20 max-w-md'>
            {state.mode == 'loading' && <RowsSkeleton numRows={20} />}
            <div className={state.mode != 'idle' ? 'hidden' : ''}>
              <DataTable
                  columns={columns}
                  data={state.data}
                  progressPending={state.mode != 'idle'}
                  selectableRows
                  pagination
                  paginationServer
                  paginationPerPage={state.queryParams.limit}
                  paginationTotalRows={state.totalRows}
                  onChangeRowsPerPage={handlePerRowsChange}
                  onChangePage={handlePageChange}
                  striped
                  onSelectedRowsChange={handleSelectedChange}
              />
            </div>
          </div>
      </div>
       
    </>
       
    );
};


export default WithAuth(Vulnerabilities);


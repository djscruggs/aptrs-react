import {Company, Column, FilteredSet} from '../lib/data/definitions'
import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'
import { fetchFilteredCompanies, deleteCompanies } from "../lib/data/api";
import { RowsSkeleton } from '../components/skeletons'
import PageTitle from '../components/page-title';
import { WithAuth } from "../lib/authutils";
import Button from '../components/button';
import CompanyForm from './company-form';
import { Dialog, DialogBody } from '@material-tailwind/react'
import { TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import DataTable from 'react-data-table-component';
import { toast } from 'react-hot-toast';
import { useDataReducer, DatasetState, DatasetAction, DEFAULT_DATA_LIMIT } from '../lib/useDataReducer'
import SearchBar from "../components/searchbar";

export function Companies() {
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
  const [companies, setCompanies] = useState<Company[]>();
  const [selected, setSelected] = useState([])
  const navigate = useNavigate()
  //modal state variables
  const [companyId, setCompanyId] = useState('')
  const [refresh, setRefresh] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const ref = useRef<HTMLDialogElement>(null);
  
  const openModal = useCallback((id: string ='') => {
    setCompanyId(id)
    setShowModal(true)
    ref.current?.showModal();
    
  }, [ref]);
  useEffect(() => {
    if(showModal){
      ref.current?.showModal()
    } else {
      ref.current?.close()
    }
  },[showModal])
  const clearModal = () => {
    setCompanyId('')
    setShowModal(false);
  }
  const handleNew = () => {
    openModal('')
  }
  const handleSelectedChange = (event: any) => {
    const ids = event.selectedRows.map((item:any) => item.id);
    setSelected(ids)
    
  }
  const deleteMultiple = () => {
    return handleDelete(selected)
  }
  const columns: Column[] = [
    {
      name: 'Action',
      selector: (row: any) => row.actions,
      maxWidth: '5em'
    },
    {
      name: 'Name',
      selector: (row: Company) => row.name,
      sortable: true,
    },
    {
      name: 'Address',
      selector: (row: Company) => row.address
    },
  ];
  interface CompanyWithActions extends Company {
    actions: JSX.Element;
  }
  const handleDelete = async (ids: any[]) => {
    if(!confirm('Are you sure?')){
      return false;
    }
    try {
      await deleteCompanies(ids)
      setRefresh(true)
      let msg:string;
      if(ids.length == 1) {
        msg = 'Company deleted';
      } else {
        msg = `${ids.length} companies deleted`;
      }
      toast.success(msg)
    } catch(error){
      dispatch({ type: 'set-error', payload: error });
    } finally {
      dispatch({ type: 'set-mode', payload: 'idle' });
    }
  }
  const loadCompanies = async() => {
    try {
      const data:FilteredSet = await fetchFilteredCompanies(state.queryParams)
      let temp: any = []
      data.results.forEach((row: CompanyWithActions) => {
        row.actions = (<>
                      <PencilSquareIcon onClick={() => openModal(String(row.id))} className="inline w-6 cursor-pointer"/>
                      <TrashIcon onClick={() => handleDelete([row.id])} className="inline w-6 ml-2 cursor-pointer" />                        
                      </>)
        temp.push(row)
      });
      data.results = temp
      dispatch({ type: 'set-data', payload: {data} });
    } catch(error){
      dispatch({ type: 'set-error', payload: error });
    } finally {
      dispatch({ type: 'set-mode', payload: 'idle' });
    }
  }
  useEffect(() => {
    loadCompanies()
    setRefresh(false)
  }, [refresh, state.queryParams]);
  const handlePerRowsChange = (newPerPage: number) => {
    dispatch({ type: 'set-rows-per-page', payload: newPerPage });
  }
  function handlePageChange(page: number){
    dispatch({ type: 'set-page', payload: page });
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
      <PageTitle title='Companies' />
      {/* modal content */}
        {showModal &&
        <Dialog handler={clearModal} open={showModal} size="xs" className="rounded-md" >
          <form method="dialog" onSubmit={clearModal}>
            <Button className="bg-gray visible absolute right-2 top-4 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-md w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
              <span className="text-gray-400 hover:text-white-900">x</span>
            </Button>
          </form>
          <DialogBody>
          {companyId   && <CompanyForm id={companyId} forwardedRef={ref} setRefresh={setRefresh} onClose={clearModal}/>}
          {!companyId && <CompanyForm forwardedRef={ref} setRefresh={setRefresh} onClose={clearModal}/>}
          </DialogBody>
        </Dialog>
        }
        {/* END modal content */}
      <div className="mt-6 flow-root">
        <div key={`searchkey-${state.queryParams.name}`}>
          <SearchBar onSearch={handleSearch} onClear={clearSearch} searchTerm={state.queryParams.name}/>
        </div>
        <Button className='btn bg-primary float-right m-2' onClick={handleNew}>
            New Company
        </Button>
        {selected.length> 0 &&
          <Button 
            className="btn bg-secondary float-right m-2 mr-0 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200" 
            disabled={selected.length == 0}
            onClick = {deleteMultiple}
            >
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
            data={state.data}
            selectableRows
            pagination
            striped
            onSelectedRowsChange={handleSelectedChange}
            progressPending={state.mode != 'idle'}
            progressComponent={<div className="mt-16"><RowsSkeleton numRows={state.queryParams.limit}/></div>}
            paginationServer
            paginationPerPage={state.queryParams.limit}
            onChangeRowsPerPage={handlePerRowsChange}
            onChangePage={handlePageChange}
            paginationTotalRows={state.totalRows}
          />
        </div>
        
        
      </div>
    </>
  )
}

export default WithAuth(Companies);
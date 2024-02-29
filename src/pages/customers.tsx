import { 
        useEffect, 
        useState, 
        useRef, 
        useCallback } from 'react'
import { useNavigate } from 'react-router-dom';
import { fetchFilteredCustomers } from "../lib/data/api";
import { DatasetState, DatasetAction, DEFAULT_DATA_LIMIT, useDataReducer } from '../lib/useDataReducer';
import { RowsSkeleton } from '../components/skeletons'
import SearchBar from '../components/searchbar';
import PageTitle from '../components/page-title';
import { WithAuth } from "../lib/authutils";
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import Button from '../components/button';
import CustomerForm from './customer-form';
import { Dialog, DialogBody } from '@material-tailwind/react'
import {Customer, Column, FilteredSet} from '../lib/data/definitions'
import DataTable from 'react-data-table-component';



export function Customers() {
  const initialState: DatasetState = {
    mode: 'idle',
    data: [],
    queryParams: {offset:0, limit:DEFAULT_DATA_LIMIT},
    totalRows: 0,
  };
  // initial load - if there's a search term in the url, set it in state,
  // this makes search load immediately in useEffect
  const params = new URLSearchParams(window.location.search);
  const search = params.get('full_name') || '';
  if(search){
    initialState.queryParams = {offset:0, limit:DEFAULT_DATA_LIMIT, full_name: search};
  }
  const reducer = (state: DatasetState, action: DatasetAction): DatasetState|void => {
    switch (action.type) {
      case 'set-search': {
        if(state.queryParams.full_name === action.payload) {
          return state
        }
        let newQueryParams = {full_name: action.payload, offset: 0, limit: state.queryParams?.limit || DEFAULT_DATA_LIMIT}
        return {...state, queryParams: newQueryParams};
      }
    }
  };
  const [state, dispatch] = useDataReducer(reducer, initialState);
  const navigate = useNavigate()
  
  /* MODAL CREATING AND HANDLING */
  const [customerId, setCustomerId] = useState('') //id of the object to be edited in modal
  const [refresh, setRefresh] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState([])
  

  const openModal = useCallback((id: string ='') => {
    setCustomerId(id)
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
    setCustomerId('')
    setShowModal(false);
  }
  const handleNew = () => {
    openModal('')
  }
  /* FETCH OF DATA TO RENDER */
  //CustomerWithActions is a type of customer that allows appending an actions column for use in the table view
  interface CustomerWithActions extends Customer {
    actions: JSX.Element;
  }
  const loadData = async() => {
    try {
      dispatch({ type: 'set-mode', payload: 'loading' });
      const data:FilteredSet = await fetchFilteredCustomers(state.queryParams)
      let temp: any = []
      data.results.forEach((row: CustomerWithActions) => {
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
    setRefresh(false)
  }
  useEffect(() => {
    loadData()
  }, [refresh, state.queryParams]);
  
  
  const columns: Column[] = [
    {
      name: 'Action',
      selector: (row: any) => row.actions,
      maxWidth: '5em'
    },
    {
      name: 'Name',
      selector: (row: Customer) => row.full_name,
      sortable: true,
    },
    {
      name: 'Company',
      selector: (row: Customer) => row.company,
      sortable: true,
    },
    {
      name: 'Position',
      selector: (row: Customer) => row.position,
      sortable: true,
    },
    {
      name: 'Email',
      selector: (row: Customer) => row.email,
    },
    {
      name: 'Phone',
      selector: (row: Customer) => row.number,
    },
  ];
  
  const handleDelete = (id: any[]) => {
    console.log("deleting id ",id)
    alert('not implemented yet')
  }
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
      params.set('full_name', term);
      navigate(`?${params.toString()}`, { replace: true });
    } else {
      dispatch({ type: 'clear-search'})
      navigate(location.pathname, { replace: true });
    }
  }
  const handlePerRowsChange = (newPerPage: number) => {
    dispatch({ type: 'set-rows-per-page', payload: newPerPage });
  }
  function handlePageChange(page: number){
    dispatch({ type: 'set-page', payload: page });
  }
  const clearSearch = ():void => {
    return handleSearch('')
  }
  if(state.error){
    navigate('/error')
  } 
  return(
    <>
      <PageTitle title='Customers' />
      {/* modal content */}
      {showModal &&
      <Dialog handler={clearModal} open={showModal}  size="md" className="p-4 rounded-md" >
        <form method="dialog" onSubmit={clearModal}>
          <Button className="bg-gray visible absolute right-2 top-4 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-md w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
            <span className="text-gray-400 hover:text-white-900">x</span>
          </Button>
        </form>
        <DialogBody className="w-full">
        {customerId   && <CustomerForm id={customerId} forwardedRef={ref} setRefresh={setRefresh} onClose={clearModal}/>}
        {!customerId && <CustomerForm forwardedRef={ref} setRefresh={setRefresh} onClose={clearModal}/>}
        </DialogBody>
      </Dialog>
      }
      {/* END modal content */}
      <div className="mt-6 flow-root">
        <div key={`searchkey-${state.queryParams.full_name}`}>
          <SearchBar onSearch={handleSearch} onClear={()=>handleSearch('')} searchTerm={state.queryParams.full_name} />
        </div>
        <Button className='btn bg-primary float-right m-2' onClick={handleNew}>
            New Customer
        </Button>
        {selected.length > 0 && 
          <Button 
            className="btn bg-secondary float-right m-2 mr-0 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200" 
            onClick = {deleteMultiple}
            >
            Delete
          </Button>
        }
        {state.queryParams.full_name &&
          <p className="mt-8">
            Results for &quot;{state.queryParams.full_name}&quot;
            <span className="text-xs ml-1">(<span className="underline text-blue-600" onClick={clearSearch}>clear</span>)</span>
          </p>
        }
        {state.mode === 'loading' && <div className="mt-16"><RowsSkeleton numRows={state.queryParams.limit}/></div>} 
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
    </>
  )
}

export default WithAuth(Customers);
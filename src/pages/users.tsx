import { User, Column, FilteredSet } from '../lib/data/definitions'
import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'
import { fetchFilteredUsers, deleteUsers } from "../lib/data/api";
import { RowsSkeleton } from '../components/skeletons'
import PageTitle from '../components/page-title';
import { WithAuth } from "../lib/authutils";
import { parseErrors } from "../lib/utilities";
import Button from '../components/button';
import UserForm from './user-form';
import { Dialog, DialogBody } from '@material-tailwind/react'
import { TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import DataTable from 'react-data-table-component';
import { toast } from 'react-hot-toast';
import { useCurrentUser } from '../lib/customHooks';
import { useDataReducer } from '../lib/useDataReducer';
import { DatasetState, DatasetAction, DEFAULT_DATA_LIMIT } from '../lib/useDataReducer'
import SearchBar from "../components/searchbar";

interface UserWithActions extends User {
  actions: JSX.Element;
}

export function Users() {
  const initialState: DatasetState = {
    mode: 'idle',
    data: [],
    queryParams: {offset:0, limit:DEFAULT_DATA_LIMIT},
    totalRows: 0,
  }
  // initial load - if there's a search term in the url, set it in state,
  // this makes search load immediately in useEffect
  const params = new URLSearchParams(window.location.search);
  const search = params.get('full_name') || '';
  if(search){
    initialState.queryParams = {offset:0, limit:DEFAULT_DATA_LIMIT, full_name: search};
  }
  const reducer = (state: DatasetState, action: DatasetAction): DatasetState | void => {
    switch (action.type) {
      case 'set-search': {
        if(state.queryParams.full_name === action.payload) {
          return state
        }
        let newQueryParams = {full_name: action.payload, offset: 0, limit: state.queryParams?.limit || DEFAULT_DATA_LIMIT}
        return {...state, queryParams: newQueryParams};
      }
    }
  }
  const [state, dispatch] = useDataReducer(reducer, initialState);
  //super user check to prevent url tampering
  const navigate = useNavigate()
  const currentUser = useCurrentUser()
  if(!currentUser.isAdmin){
    navigate('/access-denied')
  }
  const [users, setUsers] = useState<User[]>();
  const [selected, setSelected] = useState([])
  
  
  //modal state variables
  const [userId, setUserId] = useState('')
  const [refresh, setRefresh] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const ref = useRef<HTMLDialogElement>(null);
  
  const openModal = useCallback((id = '') => {
    setUserId(id)
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
    setShowModal(false);
    setUserId('')
  }
  const hideModal = () => {    
    setUserId('')
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
    // "username": "manager",
    //     "full_name": "manager user",
    //     "email": "manager@manager.com",
    //     "is_staff": true,
    //     "is_active": true,
    //     "is_superuser": false,
    //     "profilepic": "/media/profile/avatar-1.svg",
    //     "number": null,
    //     "company": "AnoF PVT LTD",
    //     "position": null,
    //     "groups":
    {
      name: 'Action',
      selector: (row: any) => row.actions,
      maxWidth: '5em'
    },
    {
      name: 'Name',
      selector: (row: User) => row.full_name,
      sortable: true,
    },
    {
      name: 'Phone',
      selector: (row: User) => row.number
    },
    {
      name: 'Address',
      selector: (row: User) => row.email
    },
    {
      name: 'Company',
      selector: (row: User) => row.company
    },
    {
      name: 'Admin?',
      selector: (row: User) => row.is_superuser ? "Yes" : "No"
    },
  ];
  const handleDelete = async (ids: any[]) => {
    if(ids.includes(currentUser.id)){
      toast.error("You cannot delete your own account")
      return false
    }
    if(!confirm('Are you sure?')){
      return false;
    }
    try {
      await deleteUsers(ids)
      setRefresh(true)
      let msg:string;
      if(ids.length == 1) {
        msg = 'User deleted';
      } else {
        msg = `${ids.length} users deleted`;
      }
      toast.success(msg)
    } catch(error){
      setRefresh(false)
      toast.error(parseErrors(error))
    }
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
  const clearSearch = () => {
    return handleSearch('')
  }
  const fetchUsers = async () => {
    try {
      const data:FilteredSet = await fetchFilteredUsers(state.queryParams)
      const temp: any = []
      data.results.forEach((row: UserWithActions) => {
        row.actions = (<>
                      <PencilSquareIcon onClick={() => openModal(String(row.id))} className="inline w-6 cursor-pointer"/>
                      <TrashIcon onClick={() => handleDelete([row.id])} className="inline w-6 ml-2 cursor-pointer" />                        
                      </>)
        temp.push(row)
      });
      dispatch({ type: 'set-data', payload: {data} });
    } catch(error){
      dispatch({ type: 'set-error', payload: error });
    } finally {
      dispatch({ type: 'set-mode', payload: 'idle' });
    }
  }
  useEffect(() => {
      fetchUsers();
  }, [refresh, state.queryParams]);

  const handlePerRowsChange = (newPerPage: number) => {
    dispatch({ type: 'set-rows-per-page', payload: newPerPage });
  }
  function handlePageChange(page: number){
    dispatch({ type: 'set-page', payload: page });
  }
  if(state.mode == 'error'){
    console.error(state.error)
    navigate('/error')
  }
  return(
    <>
      <PageTitle title='Users' />
        
      {/* modal content */}
        {showModal &&
        <Dialog handler={clearModal} open={showModal} size="sm" className="modal-box w-[500px] bg-white p-4 rounded-md" >
          <form method="dialog" onSubmit={hideModal}>
            <Button className="bg-gray visible absolute right-2 top-4 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-md w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
              <span className="text-gray-400 hover:text-white-900">x</span>
            </Button>
          </form>
          <DialogBody className='max-w-[600px] '>
          {userId   && <UserForm id={userId} forwardedRef={ref} setRefresh={setRefresh} onClose={clearModal}/>}
          {!userId && <UserForm forwardedRef={ref} setRefresh={setRefresh} onClose={clearModal}/>}
          </DialogBody>
        </Dialog>
        }
        
        {/* END modal content */}
      <div className="mt-6 flow-root">
        <div key={`searchkey-${state.queryParams.full_name}`}>
          <SearchBar onSearch={handleSearch} onClear={()=>handleSearch('')} searchTerm={state.queryParams.full_name} placeHolder='Search vulnerabilities'/>
        </div>
        <Button className='btn btn-primary float-right m-2' onClick={handleNew}>
            New User
        </Button>
        
        <Button 
          className="btn btn-error float-right m-2 mr-0 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200" 
          disabled={selected.length == 0}
          onClick = {deleteMultiple}
          >
            Delete
        </Button>
        {state.queryParams.full_name &&
          <p className="mt-8">
            Results for &quot;{state.queryParams.full_name}&quot;
            <span className="text-xs ml-1">(<span className="underline text-blue-600" onClick={clearSearch}>clear</span>)</span>
          </p>
        }
        <div className='mt-20 w-xl'>
          {state.mode == 'loading' && <RowsSkeleton numRows={state.queryParams.limit} />}
          <div className={state.mode != 'idle' ? 'hidden' : ''}>
            <DataTable
                  columns={columns}
                  data={state.data}
                  selectableRows
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
      </div>
    </>
  )
}

export default WithAuth(Users);
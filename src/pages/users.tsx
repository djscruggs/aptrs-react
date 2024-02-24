import {User, Column} from '../lib/data/definitions'
import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'
import { fetchUsers, deleteUsers } from "../lib/data/api";
import { TableSkeleton } from '../components/skeletons'
import PageTitle from '../components/page-title';
import { WithAuth } from "../lib/authutils";
import Button from '../components/button';
import UserForm from './user-form';
import { Dialog, DialogBody } from '@material-tailwind/react'
import { TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import DataTable from 'react-data-table-component';
import { toast } from 'react-hot-toast';
import { useCurrentUser } from '../lib/customHooks';



export function Users() {
  //super user check to prevent url tampering
  const navigate = useNavigate()
  const currentUser = useCurrentUser()
  if(!currentUser.isAdmin){
    navigate('/access-denied')
  }
  const [users, setUsers] = useState<User[]>();
  const [selected, setSelected] = useState([])
  const [error, setError] = useState(false);
  
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
  interface UserWithActions extends User {
    actions: JSX.Element;
  }
  const handleDelete = (ids: any[]) => {
    if(ids.includes(currentUser.id)){
      toast.error("You cannot delete your own account")
      return false
    }
    if(!confirm('Are you sure?')){
      return false;
    }
    const count = ids.length
    deleteUsers(ids)
      .then(() => {
        setRefresh(true)
        let msg:string;
        if(count == 1) {
          msg = 'Company deleted';
        } else {
          msg = `${count} users deleted`;
        }
        toast.success(msg)
        return true
        
      }).catch((error) => {
        console.error(error)
        setError(error)})
        setRefresh(false)
        return false
  }
  useEffect(() => {
    fetchUsers()
      .then((data) => {
        const temp: any = []
        data.forEach((row: UserWithActions) => {
          row.actions = (<>
                        <PencilSquareIcon onClick={() => openModal(String(row.id))} className="inline w-6 cursor-pointer"/>
                        <TrashIcon onClick={() => handleDelete([row.id])} className="inline w-6 ml-2 cursor-pointer" />                        
                        </>)
          temp.push(row)
        });
        setUsers(temp as UserWithActions[]);
      }).catch((error) => {
        setError(error)
      })
      setRefresh(false)
  }, [refresh]);
  if(error){
    console.error(error)
    navigate('/error')
  }
  if(typeof users == 'undefined'){
    return (<TableSkeleton />)
  }
  return(
    <>
      {typeof(users) == "object" && (
        <PageTitle title='Users' />
      )}
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
        {users &&
          <DataTable
                columns={columns}
                data={users}
                selectableRows
                pagination
                striped
                onSelectedRowsChange={handleSelectedChange}
            />
        }
        
        
      </div>
    </>
  )
}

export default WithAuth(Users);
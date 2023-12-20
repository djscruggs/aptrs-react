import {Company, Column} from '../lib/data/definitions'
import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'
import { fetchCompanies, deleteCompanies } from "../lib/data/api";
import { TableSkeleton } from '../components/skeletons'
import PageTitle from '../components/page-title';
import { withAuth } from "../lib/authutils";
import Button from '../components/button';
import CompanyForm from './company-form';
import { Modal } from 'react-daisyui'
import { TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import DataTable from 'react-data-table-component';
import { toast } from 'react-hot-toast';
import {AuthUser} from '../lib/data/api'



export function Users() {
  //super user check to prevent url tampering
  const navigate = useNavigate()
  if(!AuthUser().isAdmin){
    navigate('/access-denied')
  }
  
  const [companies, setCompanies] = useState<Company[]>();
  console.log(AuthUser())
  
  const [selected, setSelected] = useState([])
  const [error, setError] = useState(false);
  
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
    console.log(event)
    const ids = event.selectedRows.map((item:any) => item.id);
    console.log('ids selected ', ids)
    console.log(event.selectedCount)
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
  const handleDelete = (ids: any[]) => {
    if(!confirm('Are you sure?')){
      return false;
    }
    console.log()
    let count = ids.length
    deleteCompanies(ids)
      .then((data) => {
        setRefresh(true)
        let msg:string;
        if(count == 1) {
          msg = 'Company deleted';
        } else {
          msg = `${count} companies deleted`;
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
    fetchCompanies()
      .then((data) => {
        let temp: any = []
        data.forEach((row: CompanyWithActions) => {
          row.actions = (<>
                        <PencilSquareIcon onClick={() => openModal(String(row.id))} className="inline w-6 cursor-pointer"/>
                        
                        <TrashIcon onClick={() => handleDelete([row.id])} className="inline w-6 ml-2 cursor-pointer" />                        
                        </>)
          temp.push(row)
        });
        setCompanies(data as CompanyWithActions[]);
      }).catch((error) => {
        setError(error)
      })
      setRefresh(false)
  }, [refresh]);
  if(error){
    console.error(error)
    navigate('/error')
  }
  if(typeof companies == 'undefined'){
    return (<TableSkeleton />)
  }
  
  return(
    <>
      {typeof(companies) == "object" && (
        <PageTitle title='Users' />
      )}
      {/* modal content */}
        {showModal &&
        <Modal ref={ref}  className="modal-box bg-white w-full  p-4 rounded-md" >
          <form method="dialog" onSubmit={clearModal}>
            <Button className="bg-gray visible absolute right-2 top-4 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-md w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
              <span className="text-gray-400 hover:text-white-900">x</span>
            </Button>
          </form>
          <Modal.Body>
          {companyId   && <CompanyForm id={companyId} forwardedRef={ref} setRefresh={setRefresh} onClose={clearModal}/>}
          {!companyId && <CompanyForm forwardedRef={ref} setRefresh={setRefresh} onClose={clearModal}/>}
          </Modal.Body>
        </Modal>
        }
        
        {/* END modal content */}
      <div className="mt-6 flow-root">
        <Button className='btn btn-primary float-right m-2' onClick={handleNew}>
            New Company
        </Button>
        
        <Button 
          className="btn btn-error float-right m-2 mr-0 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200" 
          disabled={selected.length == 0}
          onClick = {deleteMultiple}
          >
            Delete
        </Button>
        {companies &&
          <DataTable
                columns={columns}
                data={companies}
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

export default withAuth(Users);
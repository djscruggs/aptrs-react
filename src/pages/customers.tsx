import { 
        useEffect, 
        useState, 
        useRef, 
        useCallback } from 'react'
import { useNavigate } from 'react-router-dom';
import { fetchCustomers } from "../lib/data/api";
import { TableSkeleton } from '../components/skeletons'

import PageTitle from '../components/page-title';
import { withAuth } from "../lib/authutils";
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import Button from '../components/button';
import CustomerForm from './customer-form';
import { Dialog, DialogBody } from '@material-tailwind/react'
import {Customer, Column} from '../lib/data/definitions'
import DataTable from 'react-data-table-component';



export function Customers() {
  
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
  const [customers, setCustomers] = useState<CustomerWithActions[]>();
  const [error, setError] = useState();
  interface CustomerWithActions extends Customer {
    actions: JSX.Element;
  }
  useEffect(() => {
    fetchCustomers()
      .then((data) => {
        let temp: any = []
        data.forEach((row: CustomerWithActions) => {
          row.actions = (<>
                        <PencilSquareIcon onClick={() => openModal(String(row.id))} className="inline w-6 cursor-pointer"/>
                        
                        <TrashIcon onClick={() => handleDelete(String(row.id))} className="inline w-6 ml-2 cursor-pointer" />                        
                        </>)
          temp.push(row)
        });
        
        setCustomers(temp as CustomerWithActions[]);
      }).catch((error) => {
        setError(error)})
    setRefresh(false)
  }, [refresh]);
  
  
  const columns: Column[] = [
    {
      name: 'Action',
      selector: (row: any) => row.actions,
      maxWidth: '5em'
    },
    {
      name: 'Name',
      selector: (row: Customer) => row.name,
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
      selector: (row: Customer) => row.phoneNumber,
    },
  ];
  
  const handleDelete = (id: any) => {
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
  
   /* RENDERING IF ERROR OR STILL LOADING */
   if(error){
    navigate('/error')
  }
  if(typeof customers == 'undefined'){
    return (<TableSkeleton />)
  }
  return(
    <>
      
      {typeof(customers) == "object" && (
        <PageTitle title='Customers' />
      )}
        {/* modal content */}
        {showModal &&
        <Dialog handler={clearModal} open={showModal}  size="xs" className="p-4 rounded-md" >
          <form method="dialog" onSubmit={clearModal}>
            <Button className="bg-gray visible absolute right-2 top-4 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-md w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
              <span className="text-gray-400 hover:text-white-900">x</span>
            </Button>
          </form>
          <DialogBody className="max-w-sm">
          {customerId   && <CustomerForm id={customerId} forwardedRef={ref} setRefresh={setRefresh} onClose={clearModal}/>}
          {!customerId && <CustomerForm forwardedRef={ref} setRefresh={setRefresh} onClose={clearModal}/>}
          </DialogBody>
        </Dialog>
        }
        {/* END modal content */}
      
        
      <div className="mt-6 flow-root">
        <Button className='btn btn-primary float-right m-2' onClick={handleNew}>
            New Customer
        </Button>
        <Button 
          className="btn btn-error float-right m-2 mr-0 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200" 
          disabled={selected.length == 0}
          onClick = {deleteMultiple}
          >
          Delete
        </Button>
        {typeof(customers) == "object" &&
          <DataTable
              columns={columns}
              data={customers}
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

export default withAuth(Customers);
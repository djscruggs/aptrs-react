import {Customer} from '../lib/data/definitions'
import { 
        useEffect, 
        useState, 
        useRef, 
        useCallback,
        useContext, 
        createContext } from 'react';
import { fetchCustomers } from "../lib/data/api";
import { TableSkeleton } from '../components/skeletons'
import ErrorPage from '../components/error-page'
import PageTitle from '../components/page-title';
import { Link } from 'react-router-dom';
import { withAuth } from "../lib/authutils";
import { StyleCheckbox } from '../lib/formstyles';
import Button from '../components/button';
import CustomerForm from './customer-form';
import { Modal } from 'react-daisyui'
import { ModalContext } from '../lib/modalcontext';

// import CompanyForm from './customer-form';



export function Customers() {
  
  
  
  /* MODAL CREATING AND HANDLING */
  const [currentId, setCurrentId] = useState('') //id of the object to be edited in modal
  const [refresh, setRefresh] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);
  const openModal = useCallback((id: string ='') => {
    setCurrentId(id)
    setIsModalOpen(true)
    setShow(true)
    ref.current?.showModal();
  }, [ref]);
  
  const clearModal = () => {
    setCurrentId('')
    setIsModalOpen(false);
  }
  const { show, setShow } = useContext(ModalContext);
  const [isModalOpen, setIsModalOpen] = useState(show);

  const showModalOpen = {
    show: isModalOpen,
    setShow: setIsModalOpen,
    toggleModal: clearModal
  };
  useEffect(() => {
    setIsModalOpen(show);
  }, [show]);
  
  
  const handleNew = () => {
    // navigate('/customers/new')
    
    openModal('')
  }
  /* FETCH OF DATA TO RENDER */
  const [customers, setCustomers] = useState<Customer[]>();
  const [error, setError] = useState();
  useEffect(() => {
    fetchCustomers()
      .then((data) => {
        setCustomers(data as Customer[]);
      }).catch((error) => {
        setError(error)})
    setRefresh(false)
  }, [refresh]);
  const handleDelete = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    alert('not implemented yet')
    
  }
  /* UI HANDLERS FOR CHECKBOXES */
  const [allChecked, setAllChecked] = useState(false);
  const [itemChecked, setItemChecked] = useState<(number | undefined)[]>([]);
  const handleMultiCheckbox = () => {
    setAllChecked(!allChecked);
    if(!allChecked){
      setItemChecked([])
    }
  }
  const handleItemCheckbox = (event:React.FormEvent<HTMLInputElement>) => {
    let search = Number(event.currentTarget.value)
    let checked = event.currentTarget.checked
    let newChecked: any = []
    if(itemChecked.length === 0 && checked){
      newChecked.push(Number(search))
    } else {
      itemChecked.forEach((id) => {
        if(id === search){
          if(checked){
            newChecked.push(id)
          }
        } else {
          newChecked.push(id)
        }
      })
    }
    setItemChecked(newChecked)
  }
   /* RENDERING IF ERROR OR STILL LOADING */
   if(error){
    console.error(error)
    return <ErrorPage />
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
      
      
          <Modal ref={ref}  className="modal-box bg-white w-full  p-4 rounded-md" >
            <form method="dialog" onSubmit={clearModal}>
              <Button className="bg-gray visible absolute right-2 top-4 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-md w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                <span className="text-gray-400 hover:text-white-900">x</span>
              </Button>
            </form>
            <Modal.Body>
            {currentId   && <CustomerForm id={currentId} forwardedRef={ref} setRefresh={setRefresh}/>}
            {!currentId && <CustomerForm forwardedRef={ref} setRefresh={setRefresh}/>}
            </Modal.Body>
          </Modal>
      
      
      <div className="mt-6 flow-root">
        <Button className='btn btn-primary float-right m-2' onClick={handleNew}>
            New Customer
        </Button>
        {(allChecked || itemChecked.length > 0)  &&
          <Button className="btn btn-error float-right m-2 mr-0">
            Delete
         </Button>
        }
        
      {typeof(customers) == "object" &&
          <div className="inline-block min-w-full align-middle">
            <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
              <div className="md:hidden">
              {typeof(customers) == "object" && customers.map((customer: Customer) => (
                  <div
                    key={customer.id + "-mobile"}
                    className="mb-2 w-full rounded-md bg-white p-4"
                  >
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <div className="mb-2 flex items-center">
                          <p>{customer.name}</p>
                        </div>
                      </div>
                    </div>
                    
                    
                  </div>
                  ))
                }
              </div>
              <table className="table zebra">
                <thead className="rounded-lg text-left text-sm font-normal">
                  <tr>
                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                    <input
                      id="selectAll"
                      type="checkbox"
                      checked = {allChecked}
                      onChange={handleMultiCheckbox}
                      className={StyleCheckbox}
                    />
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium sm:pl-6">
                      Action
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium sm:pl-6">
                      Id
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Position
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Company
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Email
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Phone
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                {typeof(customers) == "object"  && customers.map((customer: Customer) => (
                    <tr
                      key={customer.id + "-web"}
                      className="hover w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                    >
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <input
                          id={"select-" + customer.id + "-web"}
                          type="checkbox"
                          checked = {allChecked || itemChecked.includes(customer.id)}
                          value= {customer.id}
                          onChange={handleItemCheckbox}
                          className={StyleCheckbox}
                        />
                      </td>
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                            
                            <div className='underline cursor-pointer' onClick={() => openModal(String(customer.id))}>edit</div>

                            <Link to={`/customers/${customer.id}/delete`} onClick={handleDelete} className='underline'>delete</Link>
                        </div>
                      </td>

                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          <p>{customer.id}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          <p>{customer.name}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          {customer.position}
                        </div>
                      </td>
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          {customer.company}
                        </div>
                      </td>
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          {customer.email}
                        </div>
                      </td>
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          {customer.phoneNumber}
                        </div>
                      </td>
                      
                    </tr>
                   ))
                  }
                </tbody>
              </table>
            </div>
          </div>
      }
      </div>
    </>
  )
}

export default withAuth(Customers);
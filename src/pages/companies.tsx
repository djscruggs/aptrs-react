import {Company} from '../lib/data/definitions'
import { useEffect, useState, useRef, useCallback } from 'react';
import { fetchCompanies } from "../lib/data/api";
import { TableSkeleton } from '../components/skeletons'
import ErrorPage from '../components/error-page'
import PageTitle from '../components/page-title';
import { withAuth } from "../lib/authutils";
import { StyleCheckbox } from '../lib/formstyles';
import Button from '../components/button';
import CompanyForm from './company-form';
import { Modal } from 'react-daisyui'
import { TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';


export function Companies() {
  const [companies, setCompanies] = useState<Company[]>();
  const [error, setError] = useState();
  const [allChecked, setAllChecked] = useState(false);
  const [itemChecked, setItemChecked] = useState<(number | undefined)[]>([]);
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
  
  
 
  useEffect(() => {
    fetchCompanies()
      .then((data) => {
        setCompanies(data as Company[]);
      }).catch((error) => {
        setError(error)})
      setRefresh(false)
  }, [refresh]);
  if(error){
    console.error(error)
    return <ErrorPage />
  }
  if(typeof companies == 'undefined'){
    return (<TableSkeleton />)
  }
  const handleMultiCheckbox = () => {
    setAllChecked(!allChecked);
    if(!allChecked){
      setItemChecked([])
    }
  }
  
  const handleDelete = (id:string) => {
    alert('not implemented yet')
  }
  const handleItemCheckbox = (event:React.FormEvent<HTMLInputElement>) => {
    let search = Number(event.currentTarget.value)
    console.log('search is ', search)
    let checked = event.currentTarget.checked
    console.log('checked is ', checked)
    let newChecked: any = []
    console.log(itemChecked)
    if(itemChecked.length === 0 && checked){
      console.log('empty & pushing')
      newChecked.push(Number(search))
    } else {
      console.log('searching for ', search)
      itemChecked.forEach((id) => {
        if(id === search){
          if(checked){
            console.log('checked and pushing')
            newChecked.push(search)
          } else {
            console.log('NOT checked')
          }
        }
        console.log('bottom of foreach')
        console.log(newChecked)
      })
    }
    setItemChecked(newChecked)
    console.log('new state')
    console.log(newChecked)
    
  }
  
  
  
  return(
    <>
      {typeof(companies) == "object" && (
        <PageTitle title='Companies' />
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
        {(allChecked || itemChecked.length > 0)  &&
          <Button className="btn btn-error float-right m-2 mr-0">
            Delete
         </Button>
        }
        <div className="mt-6 flow-root min-w-full">
          <div className="inline-block min-w-full align-middle">
            <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
              <div className="table w-full text-gray-900 md:table">
                <div className="table-header-group rounded-lg text-left text-sm">
                  <div className="table-row">
                    <div className="table-cell text-left pl-2 py-2"> 
                    <input
                      id="selectAll"
                      type="checkbox"
                      checked = {allChecked}
                      onChange={handleMultiCheckbox}
                      className={`${StyleCheckbox} align-bottom`}
                    />
                    </div>
                    <div className="table-cell text-left py-4 pl-2"> 
                      Action
                    </div>
                    <div className="table-cell text-left py-4 pl-2"> 
                      Name
                    </div>
                    <div className="table-cell text-left py-4 pl-2"> 
                      Address
                    </div>
                    <div className="table-cell text-left py-4 pl-2"> 
                      Logo
                    </div>
                  </div>
                </div>
                {typeof(companies) == "object" &&
                  <div className="table-row-group">
                    {typeof(companies) === "object"  && companies.map((company: Company) => (
                      <div className="table-row py-4 pl-2 bg-white cursor-pointer" key={company.id + "-web"}>
                        <div className="table-cell py-4 pl-2">
                        <input
                            id={"select-" + company.id + "-web"}
                            type="checkbox"
                            checked = {allChecked || itemChecked.includes(company.id)}
                            value= {company.id}
                            onChange={handleItemCheckbox}
                            className={`${StyleCheckbox} align-bottom`}
                          />
                        </div>
                        <div className="table-cell py-4 pl-2">
                          <PencilSquareIcon className="inline w-6 cursoer-pointer" onClick={() => openModal(String(company.id))}/>
                          <TrashIcon className="inline w-6 ml-2 cursor-pointer" onClick={() => handleDelete(String(company.id))}/>
                        </div>
                        
                        <div className="table-cell py-4 pl-2">
                            {company.name}
                        </div>
                        <div className="table-cell py-4 pl-2">
                          {company.address}
                        </div>
                        <div className="table-cell py-4 pl-2">
                          {company.img}
                        </div>
                        
                      </div>
                    ))
                    }
                  </div>
                }                  
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default withAuth(Companies);
import {Company} from '../lib/data/definitions'
import { useEffect, useState } from 'react';
import { fetchCompanies } from "../lib/data/api";
import { TableSkeleton } from '../components/skeletons'
import ErrorPage from '../components/error-page'
import PageTitle from '../components/page-title';
import { Link } from 'react-router-dom';
import { withAuth } from "../lib/authutils";
import { StyleCheckbox } from '../lib/formstyles';
import Button from '../components/button';


export function Companies() {
  const [companies, setCompanies] = useState<Company[]>();
  const [error, setError] = useState();
  const [allChecked, setAllChecked] = useState(false);
  const [itemChecked, setItemChecked] = useState<(number | undefined)[]>([]);
  useEffect(() => {
    fetchCompanies()
      .then((data) => {
        setCompanies(data as Company[]);
      }).catch((error) => {
        setError(error)})
  }, []);
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
  const handleItemCheckbox = (event:React.FormEvent<HTMLInputElement>) => {
    let search = Number(event.currentTarget.value)
    let checked = event.currentTarget.checked
    let newChecked: any = []
    if(itemChecked.length == 0 && checked){
      newChecked.push(Number(search))
    } else {
      itemChecked.map((id) => {
        if(id == search){
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
  
  
  
  return(
    <>
      {typeof(companies) == "object" && (
        <PageTitle title='Companies' />
      )}
      
      <div className="mt-6 flow-root">
        <Button className="float-right mb-2">
            New Company
        </Button>
        {(allChecked || itemChecked.length > 0)  &&
          <Button className="float-right mb-2 bg-red-600 mr-2">
            Delete
         </Button>
        }
        
      {typeof(companies) == "object" &&
          <div className="inline-block min-w-full align-middle">
            <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
              <div className="md:hidden">
              {typeof(companies) === "object" && companies.map((company: Company) => (
                  <div
                    key={company.id + "-mobile"}
                    className="mb-2 w-full rounded-md bg-white p-4"
                  >
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <div className="mb-2 flex items-center">
                          <p>{company.name}</p>
                        </div>
                      </div>
                    </div>
                    
                    
                  </div>
                  ))
                }
              </div>
              <table className="hidden min-w-full text-gray-900 md:table">
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
                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                      Action
                    </th>
                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                      Id
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Address
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Logo
                    </th>
                    
                    <th scope="col" className="relative py-3 pl-6 pr-3">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                {typeof(companies) === "object"  && companies.map((company: Company) => (
                    <tr
                      key={company.id + "-web"}
                      className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                    >
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <input
                          id={"select-" + company.id + "-web"}
                          type="checkbox"
                          checked = {allChecked || itemChecked.includes(company.id)}
                          value= {company.id}
                          onChange={handleItemCheckbox}
                          className={StyleCheckbox}
                        />
                      </td>
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                            
                            <Link to={`/companies/${company.id}/edit`}>edit</Link>
        
                        </div>
                      </td>

                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          <p>{company.id}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          <p>{company.name}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        {company.address}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        {company.img}
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

export default withAuth(Companies);
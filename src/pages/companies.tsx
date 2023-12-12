import {Company} from '../lib/data/definitions'
import { useEffect, useState } from 'react';
import { fetchCompanies } from "../lib/data/api";
import { LatestInvoicesSkeleton } from '../components/skeletons'
import ErrorPage from '../components/error-page'
import { Link } from 'react-router-dom';
import { withAuth } from "../lib/authutils";


export function Companies() {
  const [companies, setCompanies] = useState<Company[]>();
  const [error, setError] = useState();
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
    return (<LatestInvoicesSkeleton />)
  }
  
  
  return(
    <>
      {typeof(companies) == "object" && (
        <h1>Companies</h1>
      )}
      {typeof(companies) == "object" &&
        <div className="mt-6 flow-root">
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
                      {/* <InvoiceStatus status={invoice.status} /> */}
                    </div>
                    
                    
                  </div>
                  ))
                }
              </div>
              <table className="hidden min-w-full text-gray-900 md:table">
                <thead className="rounded-lg text-left text-sm font-normal">
                  <tr>
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
                      <td className="whitespace-nowrap px-3 py-3">
                        {/* <InvoiceStatus status={invoice.status} /> */}
                      </td>
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <div className="flex justify-end gap-3">
                          {/* <UpdateInvoice id={invoice.id} />
                          <DeleteInvoice id={invoice.id} /> */}
                        </div>
                      </td>
                    </tr>
                   ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }
    </>
  )
}

export default withAuth(Companies);
import { fetchCompanies } from '../lib/data/api';
import { Company } from  '../lib/data/definitions'
import {  useState, useEffect } from 'react';
import { StyleTextfield } from '../lib/formstyles';
import { StyleTextfieldError } from '../lib/formstyles';
import {SingleInputSkeleton} from './skeletons'
import {sortByPropertyName} from '../lib/utilities'

interface CompanySelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  name: string
  value: any,
  changeHandler: React.ChangeEventHandler | undefined
  error?: boolean
  required?:boolean
}
export default function CompanySelect(props: React.PropsWithChildren<CompanySelectProps>) {
  
  const [companies, setCompanies] = useState<Company[]>();
console.log('required is', props.required)
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const companiesData = await fetchCompanies()
        const sorted = sortByPropertyName(companiesData,'name')
        setCompanies(sorted as Company[]);
      } catch (error) {
        console.error("Error fetching companies list:", error);
      }
      return null;
    }
    loadCompanies()
  }, []);
  if(typeof companies === 'undefined'){
    return (<SingleInputSkeleton />)
  }
  return (
          <>
           
           {companies && (
            <select name={props.name}
              value={props.value} 
              onChange={props.changeHandler}
              required={props.required}
              className={props.error ? `${StyleTextfieldError}` :`${StyleTextfield}`}
            >
              <option key='' value=''>Select...</option>
            {companies && companies.map((company =>
                <option key={company.id} value={company.name}>{company.name}</option>
           ))}
            </select>
          )}
          </>
  )
}
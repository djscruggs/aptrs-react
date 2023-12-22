import { fetchCompanies } from '../lib/data/api';
import { Company } from  '../lib/data/definitions'
import { ChangeEvent, useState } from 'react';
import { StyleTextfield } from '../lib/formstyles';
import { StyleTextfieldError } from '../lib/formstyles';
import {SingleInputSkeleton} from './skeletons'

interface CompanySelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  name: string
  value: any,
  changeHandler: React.ChangeEventHandler | undefined
  error?: boolean
};
export default function CompanySelect(props: React.PropsWithChildren<CompanySelectProps>) {
  
  const [companies, setCompanies] = useState<Company[]>();

  const loadCompanies = async () => {
    try {
      const companiesData = await fetchCompanies()
      setCompanies(companiesData as Company[]);
    } catch (error) {
      console.error("Error fetching companies list:", error);
    } 
  }
  loadCompanies()
  if(typeof companies == 'undefined'){
    return (<SingleInputSkeleton />)
  }
  return (
          <>
           
           {companies && (
            <select name={props.name}
              value={props.value} 
              onChange={props.changeHandler}
              className={props.error ? `${StyleTextfieldError}` :`${StyleTextfield}`}
            >
            {companies && companies.map((company =>
                <option key={company.id} value={company.name}>{company.name}</option>
           ))}
            </select>
          )}
          </>
  )
}
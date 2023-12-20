import {Vulnerability, Column} from '../lib/data/definitions'
import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'
import { fetchCompanies, deleteCompanies, fetchVulnerabilities } from "../lib/data/api";
import { TableSkeleton } from '../components/skeletons'
import PageTitle from '../components/page-title';
import { withAuth } from "../lib/authutils";
import Button from '../components/button';
import { Modal } from 'react-daisyui'
import { TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import DataTable from 'react-data-table-component';
import { toast } from 'react-hot-toast';
const Vulnerabilities = () => {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>();
  const [selected, setSelected] = useState([])
  const [error, setError] = useState(false);
  const [refresh, setRefresh] = useState(false);
  
  const navigate = useNavigate()
  interface VulnWithActions extends Vulnerability {
    actions: JSX.Element;
  }
  useEffect(() => {
    fetchVulnerabilities()
      .then((data) => {
        let temp: any = []
        data.forEach((row: VulnWithActions) => {
          row.actions = (<>
                        <PencilSquareIcon onClick={() => navigate(`/vulnerabilities/${row.id}/edit`)} className="inline w-6 cursor-pointer"/>
                        
                        <TrashIcon onClick={() => handleDelete([row.id])} className="inline w-6 ml-2 cursor-pointer" />                        
                        </>)
          temp.push(row)
        });
        console.log(temp)
        setVulnerabilities(temp as VulnWithActions[]);
      }).catch((error) => {
        setError(error)
      })
      setRefresh(false)
  }, [refresh]);

  const handleDelete = (ids: any[]) => {
    alert('not implemented yet')
  }
  // Title: The title of the vulnerability.
  // Description: A description of the vulnerability.
  // CVSS 3.1: The CVSS 3.1 score for the vulnerability.
  // Status: The status of the vulnerability (i.e., Vulnerable, Confirmed Fixed, Accepted Risk).
  // Solution: A description of the solution for the vulnerability.
  // Reference Link: A link to the reference documentation for the vulnerability.
  const columns: Column[] = [
    {
      name: 'Action',
      selector: (row: VulnWithActions) => row.actions,
      maxWidth: '5em'
    },
    {
      name: 'Name',
      selector: (row: VulnWithActions) => row.vulnerabilityname,
      sortable: true,
      maxWidth: '10em'
    },
    {
      name: 'Description',
      selector: (row: VulnWithActions) => row.vulnerabilitydescription,
      sortable: true,
      maxWidth: '20em'
    },
    {
      name: 'CVSS 3.1',
      selector: (row: VulnWithActions) => row.cvssscore,
      maxWidth: '5em'
    },
    {
      name: 'Status',
      selector: (row: VulnWithActions) => 'Status does not exist in api',
      maxWidth: '5em'
    },
    {
      name: 'Solution',
      selector: (row: VulnWithActions) => row.vulnerabilitysolution,
      maxWidth: '5em'
    },
    {
      name: 'Reference Link',
      selector: (row: VulnWithActions) => row.vulnerabilityreferlnk,
      maxWidth: '5em'
    },
  ]
    
  if(error){
    console.error(error)
    navigate('/error')
  }
  if(typeof vulnerabilities == 'undefined'){
    return (<TableSkeleton />)
  }
  return(
    <>
       <PageTitle title='Vulnerabilities' />
        <div className="mt-6 flow-root">
        <Button 
            className='btn btn-primary float-right m-2' 
            onClick={()=> navigate('vulnerabilities/new')}
          >
              New Project
        </Button>
        <Button  
          className="btn btn-error float-right m-2 mr-0 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200" 
          disabled={false}
        >
          Delete
        </Button>
        {typeof(vulnerabilities) == "object" &&
            <DataTable
                columns={columns}
                data={vulnerabilities}
                selectableRows
                pagination
                striped
            />
          }
        </div>
    </>
       
    );
};

export default withAuth(Vulnerabilities);
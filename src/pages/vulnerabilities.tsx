import {Vulnerability, Column} from '../lib/data/definitions'
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import {  fetchVulnerabilities, deleteVulnerabilities } from "../lib/data/api";
import { TableSkeleton } from '../components/skeletons'
import PageTitle from '../components/page-title';
import SearchBar from '../components/searchbar';
import { withAuth } from "../lib/authutils";
import Button from '../components/button';
import { TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import DataTable from 'react-data-table-component';
import { useVulnerabilityColor } from '../lib/customHooks';
import { toast } from 'react-hot-toast';
import {searchVulnerabilities} from "../lib/data/api";
import type { NavigateFunction } from 'react-router-dom';


interface VulnWithActions extends Vulnerability {
  actions?: JSX.Element;
  severity?:JSX.Element;
}

const Vulnerabilities = () => {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>();
  const [selected, setSelected] = useState([])
  const [error, setError] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  async function handleSearch(term='') {
    const value = term.trim()
    if(!value) return;
    setLoading(true)
    setSearchTerm(value)
    searchVulnerabilities(term).then((data) => {
      let temp = formatRows(data, handleDelete, navigate)
      setVulnerabilities(temp as VulnWithActions[]);
    }).catch((error) => {
      setError(error)
    })
    setLoading(false)
    setRefresh(false)
    
    
  }
  const handleSelectedChange = (event: any) => {
    const ids = event.selectedRows.map((item:any) => item.id);
    setSelected(ids)
    
  }
  const clearSearch = ():void => {
    setSearchTerm('')
    setRefresh(true)
  }
  
  useEffect(() => {
    setLoading(true)
    fetchVulnerabilities()
      .then((data) => {
        let temp = formatRows(data, handleDelete, navigate)
        setVulnerabilities(temp as VulnWithActions[]);
      }).catch((error) => {
        setError(error)
      })
      setRefresh(false)
      setLoading(false)
  }, [refresh]);

  const handleDelete = (ids: any[]) => {
    if (!confirm('Are you sure?')) {
      return false;
    }
    const count = ids.length;
    deleteVulnerabilities(ids)
      .then(() => {
        setRefresh(true);
        let msg: string;
        if (count === 1) {
          msg = 'Vulnerability deleted';
        } else {
          msg = `${count} vulnerabilities deleted`;
        }
        toast.success(msg);
        return true;
      })
      .catch((error) => {
        console.error(error);
        setError(error);
      });
    setRefresh(false);
    return false;
  };
  
  
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
      name: 'Severity',
      selector: (row: VulnWithActions) => row.severity,
      sortable: true,
      maxWidth: '20em'
    },
    {
      name: 'CVSS 3.1',
      selector: (row: VulnWithActions) => row.cvssscore,
      maxWidth: '5em'
    },
    
  ]
  const deleteMultiple = () => {
    return handleDelete(selected)
  }
  if(error){
    console.error(error)
    navigate('/error')
  }
  console.log('loading', loading)
  if(loading){
    return (<TableSkeleton />)
  }
  console.log('searchTerm is', searchTerm)
  return(
    <>
       <div className='-mt-8 mb-8 max-w-lg'>
        <SearchBar onSearch={handleSearch} searchTerm={searchTerm} placeHolder='Search vulnerabilities'/>
       </div>
       <PageTitle title='Vulnerabilities' />
        <div className="mt-6 flow-root max-w-lg">
        <Button 
            className='btn btn-primary float-right m-2 mr-0' 
            onClick={()=> navigate('/vulnerabilities/new')}
          >
              New
        </Button>
        <Button  
          className="btn btn-error float-right m-2 mr-0 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200" 
          disabled={selected.length == 0}
          onClick = {deleteMultiple}
        >
          Delete
        </Button>
        {searchTerm &&
        <p>
          Results for &quot;{searchTerm}&quot;
          <span className="text-xs underline text-blue-600" onClick={clearSearch}>(clear search results)</span>
        </p>
        }
        {typeof(vulnerabilities) == "object" &&
            <div className='max-w-lg'>
            <DataTable
                columns={columns}
                data={vulnerabilities}
                progressPending={loading}
                selectableRows
                pagination
                striped
                onSelectedRowsChange={handleSelectedChange}
            />
            </div>
          }
        </div>
    </>
       
    );
};

function formatRows(rows: VulnWithActions[], handleDelete: (ids: any[]) => void, navigate: NavigateFunction ):VulnWithActions[] {
  
  let temp: any = []
  rows.forEach((row: VulnWithActions) => {
    row.actions = (<>
                  <PencilSquareIcon onClick={() => navigate(`/vulnerabilities/${row.id}/edit`)} className="inline w-6 cursor-pointer"/>
                  
                  <TrashIcon onClick={() => handleDelete([row.id])} className="inline w-6 ml-2 cursor-pointer" />                        
                  </>)
    const [meaning, color] = useVulnerabilityColor(row.vulnerabilityseverity as string)
    row.severity = (<span className={`text-[${color}]`}>{meaning}</span>)
    temp.push(row)
  });
  return temp;

}

export default withAuth(Vulnerabilities);


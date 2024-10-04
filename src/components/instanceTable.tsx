import { useState, useEffect, ChangeEvent, useContext } from 'react';
import { VulnerabilityInstance, Column, FilteredSet } from '../lib/data/definitions'
import { DatasetState, DatasetAction, DEFAULT_DATA_LIMIT, useDataReducer } from '../lib/useDataReducer';
import { 
  deleteVulnerabilityInstances,
  updateProjectVulnerabilityInstance,
  insertProjectVulnerabilityInstance,
  updateProjectInstanceStatus,
  fetchFilteredVulnerabilityInstances
} from '../lib/data/api';
import toast from 'react-hot-toast';
import {
  StyleTextfield,
  StyleLabel,
  FormErrorMessage,
  } from '../lib/formstyles'
import { Button, Dialog,DialogHeader,DialogBody,DialogFooter } from '@material-tailwind/react';

import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import DataTable from 'react-data-table-component'
import { ThemeContext } from '../layouts/layout'
import { RowsSkeleton } from '../components/skeletons'
import { HeaderFilter, ClearFilter } from '../components/headerFilter';
interface InstanceTableProps {
  id: number
}
export default function InstanceTable(props: InstanceTableProps) {
  const initialState: DatasetState = {
    mode: 'idle',
    data: [],
    queryParams: {offset:0, limit:DEFAULT_DATA_LIMIT},
    totalRows: 0,
  };
  const reducer = (state: DatasetState, action: DatasetAction): DatasetState|void => {
    switch (action.type) {
      case 'set-data': {
        return {...state, data: action.payload.data.results};
      }
    }
  };
  const [state, dispatch] = useDataReducer(reducer, initialState);
  const {id} = props
  const [editingData, setEditingData] = useState<VulnerabilityInstance | undefined>(undefined)
  const [showDialog, setShowDialog] = useState(false)
  const [showBulkDialog, setShowBulkDialog] = useState(false)
  const theme = useContext(ThemeContext);
  
  const loadInstances = async() => {
    try {
      dispatch({ type: 'set-mode', payload: 'loading' });
      const data:FilteredSet = await fetchFilteredVulnerabilityInstances(id, state.queryParams)
      let temp = formatRows(data.results)
      data.results = temp
      dispatch({ type: 'set-data', payload: {data} });
    } catch(error){
      dispatch({ type: 'set-error', payload: error });      
    } finally {
      dispatch({ type: 'set-mode', payload: 'idle' });
    }
    // const data = await fetchVulnerabilityInstances(id)
    
  }
  
  useEffect(() => {
    loadInstances()
  }, []);
  const [selected, setSelected] = useState<VulnerabilityInstance[]>([])
  
  const openEditDialog = (row: VulnerabilityInstance) => {
    setEditingData(row)
    setShowDialog(true)
  }
  const openNewDialog = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setEditingData(undefined)
    setShowDialog(true)
  }
  const openBulkDialog = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setShowBulkDialog(true)
  }
  const clearDialog = () => {
    setEditingData(undefined)
    setShowDialog(false)
  }
  const handleSort = (name: string, sortDirection: string) => {
    let order_by = sortDirection ? sortDirection : 'asc'
    
    if(name){
      if (state.totalRows < DEFAULT_DATA_LIMIT) {
        // Local sorting
        const sortedData = [...state.data].sort((a, b) => {
          if (a[name] < b[name]) return order_by === 'asc' ? -1 : 1;
          if (a[name] > b[name]) return order_by === 'asc' ? 1 : -1;
          return 0;
        });
        dispatch({ type: 'set-sort', payload: { sort: name, order_by: order_by as 'asc' | 'desc' } });
        dispatch({ type: 'set-data', payload: { data: { results: sortedData, count: state.totalRows } } });
      } else {
        // Server-side sorting
        dispatch({ type: 'set-sort', payload: { sort: name, order_by: order_by as 'asc' | 'desc' } });
        loadInstances();
      }
    }
  }
  const clearFilter = () => {
    setFilterValues({
      URL: '',
      Parameter: '',
      Status: '',
    })
    dispatch({ type: 'reset'})
  }
  const [filterValues, setFilterValues] = useState({
    URL: '',
    Parameter: '',
    Status: '',
  });
  const filterCommit = () => {
    dispatch({ type: 'set-filter', payload: filterValues})
    loadInstances()
  }
  const handleFilter = (event:any) => {
    const {name, value} = event.target
    setFilterValues((prevFilterValues) => ({
      ...prevFilterValues,
      [name]: value,
    }));
  }
  const deleteInstance = async(id: number) => {
    if (!confirm('Are you sure?')) {
      return;
    }
    try {
      await deleteVulnerabilityInstances([id])
      loadInstances()
      toast.success('URL deleted')
      setSelected([])
    } catch (error) {
      console.error('Error deleting instance:', error)
      toast.error(String(error))
    }
   
  }
  const deleteMultiple = async() => {
    if (!confirm('Are you sure?')) {
      return;
    }
    try {
      await deleteVulnerabilityInstances(selected.map(instance => instance.id))
      loadInstances()
      toast.success('URLs deleted')
    } catch (error) {
      console.error('Error deleting instances:', error)
      toast.error(String(error))
    }
  }
  interface  InstanceWithActions extends VulnerabilityInstance {
    actions: React.ReactNode
  }
  function formatRows(rows: VulnerabilityInstance[]):InstanceWithActions[] {
    let temp: any = []
    rows.forEach((row: any) => {
      row.actions = (<>
                    <PencilSquareIcon onClick={()=>openEditDialog(row)} className="inline w-6 cursor-pointer"/>
                    <TrashIcon onClick={() => deleteInstance(row.id)} className="inline w-6 ml-2 cursor-pointer" />                        
                    </>)
      temp.push(row)
    });
    return temp;
  
  }
  const columns: Column[] = [
    {
      name: 'Action',
      selector: (row: InstanceWithActions) => row.actions,
      maxWidth: '1rem'
    },
    {
      name: <HeaderFilter 
              label='URL' 
              name='URL' 
              defaultValue={filterValues.URL} 
              onCommit={filterCommit} 
              onChange={handleFilter}
              currentFilter={state.queryParams}
              handleSort={handleSort}
              />,
      selector: (row: InstanceWithActions) => row.URL,
      
    },
    {
      name: <HeaderFilter 
              label='Parameter' 
              name='Parameter' 
              defaultValue={filterValues.Parameter} 
              onCommit={filterCommit} 
              onChange={handleFilter}
              currentFilter={state.queryParams}
              handleSort={handleSort}
              />,
      selector: (row: InstanceWithActions) => row.Parameter,
   },
    {
      name: <HeaderFilter 
            label='Status' 
            name='Status' 
            defaultValue={filterValues.Status} 
            onCommit={filterCommit} 
            onChange={handleFilter}
            currentFilter={state.queryParams}
            handleSort={handleSort}
            />,
      selector: (row: InstanceWithActions) => row.status,
      
    }
  ]
  const handleSelectedRowsChange = (state: any) => {
    setSelected(state.selectedRows)
  }
  
  return (
        <>
        <label>Vulnerable URLs</label>
        <div className='mt-2 float-right'>
          
          <button  
            className="bg-secondary p-2 text-white rounded-md disabled:opacity-50"
            disabled={selected.length === 0}
            onClick = {deleteMultiple}
          >
            Delete
          </button>
          <button key='addNewVulnerability' className='bg-primary text-white p-2 rounded-md ml-2' onClick={openNewDialog}>Add New</button>
          <button key='addBulkVulnerability' className='bg-primary text-white p-2 rounded-md ml-2' onClick={openBulkDialog}>Add Multiple</button>
          
        
        </div>
        <ClearFilter queryParams={state.queryParams} clearFilter={clearFilter}/>
        {state.mode === 'loading' && <div className="mt-6 "><RowsSkeleton numRows={state.queryParams.limit}/></div>} 
        <div className={state.mode != 'idle' ? 'hidden' : ''}>
          <DataTable
            columns={columns}
            data={state.data}
            progressPending={state.mode != 'idle'}
            pagination
            paginationPerPage={10}
            striped
            onSelectedRowsChange={handleSelectedRowsChange}
            theme={theme}
            selectableRows
          />
          {showDialog && <InstanceForm visible={showDialog} projectVulnerabilityId={id} data={editingData} onCancel={clearDialog} onSave={loadInstances}/>}
          {showBulkDialog && <BulkInstanceForm visible={showBulkDialog} projectVulnerabilityId={id} onCancel={clearDialog} onSave={loadInstances}/>}
        </div>
        </>
  );
}

interface InstanceFormProps {
  data: VulnerabilityInstance | undefined
  projectVulnerabilityId: number
  visible: boolean
  onSave: () => void
  onCancel: () => void
}
function InstanceForm(props: InstanceFormProps): React.ReactNode {
  const [isOpen, setIsOpen] = useState(props.visible)
  const [error, setError] = useState(false)
  interface InstanceFormState {
    id?: number | 'new'
    URL?: string
    Parameter?: string
    status?: string
  }
  const [formData, setFormData] = useState<InstanceFormState>({ 
      URL: props.data?.URL || '', 
      Parameter: props.data?.Parameter || '', 
      status: (props.data?.status as 'Vulnerable' | 'Confirm Fixed' | 'Accepted Risk') || 'Vulnerable',
      id:  typeof props.data?.id === 'number' ? props.data.id : 'new'
    })
  const clearDialog = () => {
    setIsOpen(false)
    props.onCancel()
  }
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };
  const saveInstance = async() => {
    if(!formData.URL){
      setError(true)
      return false
    }
    try {
      if(formData.id === 'new'){
        await insertProjectVulnerabilityInstance(props.projectVulnerabilityId, [formData])
        toast.success('URL added')
      } else {
        const updated = await updateProjectVulnerabilityInstance(formData)
        // this is here because status update uses a different api endppoint from normal update
        await updateProjectInstanceStatus(updated)
        toast.success('URL updated')
      }
      clearDialog()
      props.onSave()
    } catch (error) {
      console.error('Error updating instance:', error)
      toast.error(String(error))
    }
  }
  
  return (
          <Dialog key={`instance-${props?.data?.id}`} handler={clearDialog} open={isOpen} size="sm" className="modal-box w-[500px] bg-white p-4 rounded-md" >
            <DialogHeader>{props?.data?.id === 'new' ? 'Add URL' : 'Edit URL'}</DialogHeader>
              <DialogBody>
                <div className="flex min-w-fit mb-2">
                  <div className="w-1/2">
                  <input
                    name='URL'
                    autoFocus
                    id='URL'
                    className={error ? `border border-red-500 ${StyleTextfield}` : StyleTextfield}
                    value={formData.URL}
                    placeholder='URL'
                    onChange={handleChange}
                    type="text"
                    required={true}
                  />
                  {error && <div className='absolute -bottom-8'><FormErrorMessage message="Invalid url" /></div>}
                </div>
                <div className='ml-4 flex items-start w-1/4'>
                  <input
                    name='Parameter'
                    id='Parameter'
                    placeholder='Parameter'
                    className={StyleTextfield}
                    value={formData.Parameter}
                    onChange={handleChange}
                    type="text"
                  />
                </div>
                <div className='ml-4 flex items-start'>
                  <select 
                      name='status'
                      id='status'
                      value={formData.status} 
                      className='peer block min-w-full rounded-md border border-gray-200 py-[9px] pl-2 text-sm outline-2 placeholder:text-gray-500'
                      onChange={handleChange}
                    >
                      
                    {['Vulnerable', 'Confirm Fixed','Accepted Risk'].map((status =>
                        <option key={`existing-status-${status}`} value={status}>{status}</option>
                    ))}
                  </select>
              </div>
                </div>
            </DialogBody>
            <DialogFooter>
            <button className='bg-primary rounded-md text-white mx-1 p-2'  onClick={saveInstance}>Save</button>
            <button className='bg-secondary rounded-md text-white mx-1 p-2'  onClick={clearDialog}>Cancel</button>
            </DialogFooter>
          </Dialog>
  )
}

interface BulkInstanceFormProps {
  visible: boolean
  projectVulnerabilityId: number
  onCancel: () => void
  onSave: () => void
}
function BulkInstanceForm(props: BulkInstanceFormProps): React.ReactNode {
  const [bulkUrls, setBulkUrls] = useState('')
  const [showDialog, setShowDialog] = useState(props.visible)
  const clearDialog = () => {
    setShowDialog(false)
    props.onCancel()
  }
  const bulkUrlsChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setBulkUrls(event.target.value);
  }
  const saveBulkUrls = async() => {
    const lines = bulkUrls.split('\n').map(urlWithParams => {
        const [url, ...parameter] = urlWithParams.trim().split(' '); // Split the line into URL and additional parameters
        return {URL: url, 
                Parameter:parameter.join(' '), 
                status: 'Vulnerable', 
                error: !url };
      });
      //new instances can be inserted all at once as an array
      try {
        await insertProjectVulnerabilityInstance(props.projectVulnerabilityId, lines)
        toast.success('URLs added')
        clearDialog()
        props.onSave()
      } catch (error) {
        console.error('Error adding URLs:', error)
        toast.error(String(error))
      }
  }
  return (
            <Dialog handler={clearDialog} open={showDialog} size="sm" className="modal-box w-[500px] bg-white p-4 rounded-md" >
              <label 
                htmlFor="bulkUrls"
                className={StyleLabel}>
                Enter URLs with (optional) parameters, one per line, URL first on each line
              </label>
              <textarea
                name="bulkUrls"
                id="bulkUrls"
                placeholder='http://www.example.com'
                rows={8}
                className={StyleTextfield}
                value={bulkUrls}
                onChange={bulkUrlsChange}
              />
              <Button 
                onClick={saveBulkUrls}
                className="bg-primary cursor-pointer disabled:bg-gray-300 mt-2"
                disabled = {bulkUrls.trim() === ''}
                >
                Add
              </Button>
              <Button onClick={clearDialog}
                className="bg-red-600 cursor-pointer disabled:bg-gray-300 mt-2 ml-2">
                Cancel
              </Button>
            </Dialog>
  )
}


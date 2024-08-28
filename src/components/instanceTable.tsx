import { useState, useEffect, ChangeEvent, useContext } from 'react';
import { ProjectVulnerability, VulnerabilityInstance, Column } from '../lib/data/definitions'
import { 
  deleteVulnerabilityInstances,
  updateProjectInstance,
  insertProjectInstance,
  updateProjectInstanceStatus,
  fetchVulnerabilityInstances
} from '../lib/data/api';
import toast from 'react-hot-toast';
import {
  StyleTextfield,
  StyleLabel,
  FormErrorMessage,
  } from '../lib/formstyles'
import { XCircleIcon } from '@heroicons/react/24/outline';
import { Button, Dialog,DialogHeader,DialogBody,DialogFooter } from '@material-tailwind/react';

import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import DataTable from 'react-data-table-component'
import { ThemeContext } from '../layouts/layout'
interface FormErrors {
  instance?: string
  url?: string
  parameter?: string
  bulkUrls?: string
}


interface InstanceTableProps {
  id: number
  instances: VulnerabilityInstance[]
}

export default function InstanceTable(props: InstanceTableProps) {
  const {id} = props
  const [errors, setErrors] = useState<FormErrors>({});
  const [editingData, setEditingData] = useState<VulnerabilityInstance | undefined>(undefined)
  const [instances, setInstances] = useState<VulnerabilityInstance[]>(formatRows(props.instances || []))
  const [bulkUrls, setBulkUrls] = useState('');
  const [showDialog, setShowDialog] = useState(false)
  const theme = useContext(ThemeContext);
  
  const loadInstances = async() => {
    const data = await fetchVulnerabilityInstances(id)
    setInstances(formatRows(data))
  }
  const bulkUrlsChange = (event:any) => {
    setBulkUrls(event.target.value);
  }
  
  useEffect(() => {
    // This effect will run whenever `instances` changes
    setInstances(formatRows(props.instances || []))
  }, [props.instances]);
  const captureBulkUrls = () => {
    const updated = newInstance
    const lines = bulkUrls.split('\n').map(urlWithParams => {
        const [url, ...parameter] = urlWithParams.trim().split(' '); // Split the line into URL and additional parameters
        return {URL: url, 
                Parameter:parameter.join(' '), 
                status: 'Vulnerable', 
                error: !url };
      });
      const merged = [
        ...updated,
        ...lines
      ] as VulnerabilityInstance[]
      setNewInstance(merged)
    
    setShowDialog(false)  
    setBulkUrls('')
  }
  const addBulkUrls = () => {
    setShowDialog(true)
  }
  const cancelBulkUrls = () => {
    setBulkUrls('')
    setShowDialog(false)
  }
  const removeNewInstance = (index: number) => {
    const updated = [...newInstance];
    updated.splice(index, 1);
    setNewInstance(updated)
  }
  const [newInstance, setNewInstance] = useState<VulnerabilityInstance[]>([])
  const addInstance = (event:any) => {
    event.preventDefault()
    //first validate the previous instance(s)
    if(!validateInstance()){
      return null
    }
    const temp = [...newInstance];
    temp.push({URL: '', Parameter: '', error:false, status:'Vulnerable'})
    setNewInstance(temp)
  }
  const validateInstance = () => {
    //first validate the previous instance(s)
    let valid = true;
    if(!newInstance){
      return true
    }
    const validatedNew = newInstance.map((instance) =>{
      if(!instance.URL){
        instance.error = true;
        valid = false
      } else {
        instance.error = false;
      }
      return instance
    })
    setNewInstance(validatedNew)      
    if(!instances){
      return valid
    }
    const validatedExisting = instances.map((instance) =>{
      if(!instance.URL){
        instance.error = true;
        valid = false
      } else {
        instance.error = false;
      }
      return instance
    })
    setInstances(validatedExisting)      
    return valid
  }
  const openEditDialog = (row: VulnerabilityInstance) => {
    setEditingData(row)
    setShowDialog(true)
  }
  const clearDialog = () => {
    setEditingData(undefined)
    setShowDialog(false)
  }
  // /api/project/vulnerability/instances/filter/<Vulneability-id>/?URL=&Parameter=&status=&limit=20&offset=0&order_by=asc&sort=id
  const updateInstance = async(index: number) => {
      try {
        const updated = await updateProjectInstance(instances[index])
        const statusUpate = await updateProjectInstanceStatus(updated)
        console.log('statusUpate',statusUpate)
        toast.success('Instance updated')
        return updated
      } catch (error) {
        console.error('Error updating instance:', error)
        toast.error(String(error))
      }
  }
  const insertNewInstance = async(index: number) => {
    if(!validateInstance()){
      return
    }
    const data = newInstance[index]
    const result = await insertProjectInstance(props.id, [data])
    setInstances([...instances, ...newInstance])
    setNewInstance([])
    toast.success('Instance added')
  }
  const deleteInstance = async(id: number) => {
    if (!confirm('Are you sure?')) {
      return;
    }
    try {
      await deleteVulnerabilityInstances([id])
      loadInstances()
      toast.success('Instance deleted')
    } catch (error) {
      console.error('Error deleting instance:', error)
      toast.error(String(error))
    }
    
  }
  const handleInstanceChange = (which: 'new'|'existing', key: string, index: number, event:any) => {
    
    const { value } = event.target;
    let updatedInstance
    if(which === 'new') {
      updatedInstance = [...newInstance]; // Create a copy of the array
      updatedInstance[index] = { ...updatedInstance[index], [key]: value };
      setNewInstance(updatedInstance);
    } else {
      updatedInstance = [...instances]; // Create a copy of the array
      updatedInstance[index] = { ...updatedInstance[index], [key]: value };
      setInstances(updatedInstance);
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
      name: 'URL',
      selector: (row: InstanceWithActions) => row.URL,
      sortable: true
    },
    {
      name: 'Parameter',
      selector: (row: InstanceWithActions) => row.Parameter,
      sortable: true
    },
    {
      name: 'Status',
      selector: (row: InstanceWithActions) => row.status,
      sortable: true
    }
  ]
  const handleSelectedRowsChange = (state: any) => {
    console.log('state', state)
  }
  console.log('showDialog', showDialog)
  return (
        <>
        <label>Vulnerable URLs</label>
        <DataTable
          columns={columns}
          data={instances}
          pagination
          paginationPerPage={10}
          striped
          onSelectedRowsChange={handleSelectedRowsChange}
          theme={theme}
          selectableRows
        />
        {showDialog && <EditInstance visible={showDialog} data={editingData} onCancel={clearDialog}/>}
        
        </>
  );
}

interface EditInstanceProps {
  data: VulnerabilityInstance | undefined
  visible: boolean
  onSave?: () => void
  onCancel: () => void
}
function EditInstance(props: EditInstanceProps): React.ReactNode {
  console.log('props', props)
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
        await insertProjectInstance(formData.projectId, [formData])
        toast.success('URL added')
      } else {
        const updated = await updateProjectInstance(formData)
        const statusUpate = await updateProjectInstanceStatus(updated)
        toast.success('URL updated')
      }
      clearDialog()
      
    } catch (error) {
      console.error('Error updating instance:', error)
      toast.error(String(error))
    }
  }
  console.log('isOpen', isOpen)
  return (
          <Dialog key={`instance-${props.data.id}`} handler={clearDialog} open={isOpen} size="sm" className="modal-box w-[500px] bg-white p-4 rounded-md" >
            <DialogHeader>{props?.data.id === 'new' ? 'Add URL' : 'Edit URL'}</DialogHeader>
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


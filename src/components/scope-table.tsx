import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteProjectScope, getProjectScopes } from '../lib/data/api'
import DataTable from 'react-data-table-component'
import { ThemeContext } from '../layouts/layout'
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { Column, Scope } from '../lib/data/definitions'
import ScopeForm, { ModalScopeForm } from '../components/scope-form'
interface ScopeTableProps {
  projectId: number
}
export default function ScopeTable(props: ScopeTableProps): JSX.Element {
  const {projectId} = props
  const [editingScope, setEditingScope] = useState<number | false>(false)
  const [newScope, setNewScope] = useState(false)
  const [scopes, setScopes] = useState<Scope[]>([])
  const [selected, setSelected] = useState([])
  const theme = useContext(ThemeContext);
  useEffect(() => {
    loadScopes()
  }, [projectId])
  async function deleteScope(event:any, ids: number[]): Promise<void> {
    event.stopPropagation()
    if (!confirm('Are you sure?')) {
      return;
    }
    try {
      await deleteProjectScope(ids)
      loadScopes()
      toast.success('Scope deleted')
    } catch(error){
      console.error(error)
      toast.error(String(error))
    }
  }
  async function deleteMultiple(event:any){
    event.stopPropagation()
    if(selected.length == 0){
      toast.error('Please select at least one scope to delete')
      return
    }
    return deleteScope(event, selected)
    
  }
  const loadScopes = async () => {
    const _scopes = await getProjectScopes(String(projectId)) as ScopeWithActions[]
    const formatted: ScopeWithActions[] = formatRows(_scopes)
    setScopes(formatted)
  }
  const handleSelectedChange = (event: any) => {
    const ids = event.selectedRows.map((item:any) => item.id);
    setSelected(ids)
  }
  interface ScopeWithActions extends Scope {
    actions: React.ReactNode
  }
  function formatRows(rows: ScopeWithActions[]):ScopeWithActions[] {
    let temp: ScopeWithActions[] = []
    rows.forEach((row: ScopeWithActions) => {
      row.actions = (<>
                    <PencilSquareIcon onClick={() => setEditingScope(row.id)} className="inline w-6 cursor-pointer"/>
                    <TrashIcon onClick={(event) => deleteScope(event,[row.id])} className="inline w-6 ml-2 cursor-pointer" />                        
                    </>)
      temp.push(row)
    });
    return temp;
  
  }
  const columns: Column[] = [
    {
      name: 'Action',
      selector: (row: ScopeWithActions) => row.actions,
      maxWidth: '1rem'
    },
    {
      name: 'Scope',
      selector: (row: ScopeWithActions) => row.scope,
    },
    {
      name: 'Description',
      selector: (row: ScopeWithActions) => row.description,
      maxWidth: '10em'
    }
  ]
  return (
      <div className='max-w-2xl'>
                       
        
                      <div className='mb-4'>
                      {newScope ? 
                        <ScopeForm projectId={Number(projectId)} onClose={()=>setNewScope(false)} afterSave={()=>loadScopes()}/>
                      :
                        <>
                          
                          {selected.length > 0 &&
                          <button  
                            className="bg-secondary float-right p-2 text-white rounded-md disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200" 
                            disabled={selected.length == 0}
                            onClick = {deleteMultiple}
                          >
                            Delete
                          </button>
                          }
                          <button className='bg-primary text-white p-2 rounded-md block ' onClick={()=>setNewScope(true)}>Add New</button>
                        </>
                      }
                      </div>
                      <DataTable
                        columns={columns}
                        data={scopes}
                        selectableRows
                        pagination
                        paginationPerPage={10}
                        striped
                        onSelectedRowsChange={handleSelectedChange}
                        theme={theme}
                      />
                      {editingScope &&
                      <ModalScopeForm
                        projectId={projectId}
                        scope={scopes.find((scope) => scope.id === editingScope)?.scope}
                        description={scopes.find((scope) => scope.id === editingScope)?.description}
                        id={editingScope}
                        onClose={() => setEditingScope(false)}
                        afterSave={() => loadScopes()}
                      />
                    }
                    </div>
                    
  )
}
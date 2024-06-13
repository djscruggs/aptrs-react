import { useState, useRef } from 'react'
import { BackspaceIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { PiKeyReturnThin } from "react-icons/pi"
import DatePicker from "react-datepicker";
import { DatasetState } from '../lib/useDataReducer'
import { CiCircleRemove } from "react-icons/ci";
import { BiSortAZ, BiSortZA } from "react-icons/bi";

interface HeaderFilterProps {
  label: string;
  name: string;
  defaultValue: string;
  isDate?: boolean;
  isBoolean?: boolean;
  onChange: (event: any) => void;
  onCommit: (event: any) => void;
  handleSort?: (name: string, order: string) => void;
}

export function isFiltered(queryParams: DatasetState['queryParams']): boolean {
  const { limit, offset, order_by, sort, ...rest } = queryParams;
  return Object.values(rest).some(value => value !== '');
}

interface ClearFilterProps {
  queryParams: DatasetState['queryParams'];
  clearFilter: (event: any) => void;
  
}
export function ClearFilter({queryParams, clearFilter }: ClearFilterProps): JSX.Element {
  if(!isFiltered(queryParams)) {
    return <></>
  }
  return (
      <div className='text-sm text-center my-4'  onClick={clearFilter}>
          <CiCircleRemove className='w-4 h-4 text-secondary inline'/> Clear filters
      </div>
  )
}
interface HeaderFilterProps {
  label: string;
  name: string;
  defaultValue: string;
  isDate?: boolean;
  isBoolean?: boolean;
  onChange: (event: any) => void;
  onCommit: (event: any) => void;
  handleSort?: (name: string, order: string) => void;
  currentFilter: DatasetState['queryParams'];
  }
export function HeaderFilter({label, name, defaultValue, isDate = false, isBoolean = false, onChange, onCommit, handleSort, currentFilter }: HeaderFilterProps): JSX.Element {
  const [active, setActive] = useState(isBoolean ? false : Boolean(defaultValue))
  const [value, setValue] = useState(defaultValue)
  const [focus, setFocus] = useState(false)
  const inputRef = useRef(null);
  const filterKeyDown = (event:any) => {
    if(event.key === 'Enter') {
      onCommit(event)
    }
  }
  const handleRadioChange = (event:any) => {
    setValue(event.target.value)
    setFocus(true)
    const ev = {
      target: {
        name: name,
        value: event.target.value
      }
    }
    onChange(ev)
  }
  const clearValue = () => {
    setValue('')
  }
  const handleChange = (event:any) => {
    setValue(event.target.value)
    if(event.target.value) {
      setFocus(true)
    }
    if(onChange) {
      onChange(event)
    }
  }
  const handleBlur = () => {
    setFocus(false)
    setActive(Boolean(value))
  }
  const handleDatePicker = (date:string) => {
    setValue(new Date(date).toISOString())
    setFocus(true)
    setActive(Boolean(date))
    if(onChange) {
      const event = {
        target: {
          name: name,
          value: new Date(date).toISOString()
        }
      }
      onChange(event)
    }
  }
  const isSorted = currentFilter?.sort === name
  
  const sortDirection = isSorted ? currentFilter.order_by : ''
  return (
    <>
    {active ? (
      <>
        {isDate || isBoolean ? (
          <>
          {isDate ? (
          <DatePicker
           key={name}
           ref={inputRef}
           id={name}
           name={name}
           placeholderText='Select date'
           dateFormat="yyyy-MM-dd"
           onChange={handleDatePicker}
           selected={value ? new Date(value) : ''}
           onBlur={handleBlur}
           onKeyDown={filterKeyDown}
          />) : (
            <div className='block'>
              <label className='ml-2'>{label}</label>
              <div className='absolute top-9 bg-white z-50 p-1 border border-gray-300 rounded-md' onKeyDown={filterKeyDown}>
                <div><input type='radio' name={name} value='1' checked={value==='1'} onChange={handleRadioChange} onBlur={handleBlur} /> Yes</div>
                <div><input type='radio' name={name} value='0' checked={value==='0'} onChange={handleRadioChange} onBlur={handleBlur}/> No</div>
              </div>
            </div>
          )}
        </>
        ): (
        <input 
          type="text" className='p-2 border border-gray-300 rounded-md w-full' 
          ref={inputRef}
          autoFocus={active} 
          key={label+name} 
          name={name} 
          placeholder={label} 
          value={value} 
          onKeyDown={filterKeyDown} 
          onChange={handleChange} 
          onBlur={handleBlur}
        />)}
        {value && !isBoolean && (
          <BackspaceIcon className='-ml-6 w-5 h-5 text-secondary' onClick={()=>clearValue()}/>
        )}
        {active && focus && !isBoolean &&
          <span className='absolute top-10 left-4 bg-white bg-opacity-75 p-1 w-5/8 border border-gray-300 rounded-md'><PiKeyReturnThin className='inline w-5 h-5' /> to search</span>
        }
        {active && focus && isBoolean &&
          <span className='absolute top-20 left-4 bg-white  p-1 w-5/8 border border-gray-300 rounded-md'><PiKeyReturnThin className='inline w-5 h-5' /> to search</span>
        }
        {!value && !isBoolean  && 
          <FunnelIcon key={name+ 'icon'} className='-ml-6 w-4 h-4' /> 
        }
        {handleSort && (
          <span onClick={()=>handleSort(name, 'asc')}>sort</span>
        )}
      </>
     ) : (
        <>
          <span onClick={()=>setActive(true)}>{label} 
          <FunnelIcon key={name+ 'icon'} className='ml-2 w-4 h-4 inline'/></span>
        </>
    )}
    {handleSort && (
      <span onClick={()=>handleSort(name, ['asc',''].includes(sortDirection)  ? 'desc' : 'asc')} className={`cursor-pointer ${sortDirection === '' ? 'opacity-50 hover:opacity-100' : ''} ${isSorted  ? 'text-primary' : ''}`}>
        {sortDirection === 'asc' ? <BiSortAZ className='inline w-5 h-5' /> : <BiSortZA className='inline w-5 h-5' />}
      </span>
    )}
    </>
  )
}
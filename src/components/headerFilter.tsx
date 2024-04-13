import { useState } from 'react'
import { BackspaceIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { PiKeyReturnThin } from "react-icons/pi"
import DatePicker from "react-datepicker";

interface HeaderFilterProps {
  label: string;
  name: string;
  defaultValue: string;
  isDate?: boolean;
  onChange: (event: any) => void;
  onCommit: (event: any) => void;
}

export default function HeaderFilter({label, name, defaultValue, isDate = false, onChange, onCommit}: HeaderFilterProps): JSX.Element {
  const [active, setActive] = useState(Boolean(defaultValue))
  const [value, setValue] = useState(defaultValue)
  const [focus, setFocus] = useState(false)
  const filterKeyDown = (event:any) => {
    if(event.key === 'Enter') {
      onCommit(event)
    }
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
  const handlBlur = () => {
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
  return (
    <>
    {active ? (
      <>
        {isDate ? (
           <DatePicker
           key={name}
           id={name}
           name={name}
           placeholderText='Select date'
           dateFormat="yyyy-MM-dd"
           onChange={handleDatePicker}
           selected={value ? new Date(value) : ''}
           onBlur={handlBlur}
           onKeyDown={filterKeyDown}
         />
        ): (
        <input 
          type="text" className='p-2 border border-gray-300 rounded-md w-full' 
          autoFocus={active} 
          key={label+name} 
          name={name} 
          placeholder={label} 
          value={value} 
          onKeyDown={filterKeyDown} 
          onChange={handleChange} 
          onBlur={handlBlur}
        />)}
        {value && 
          <BackspaceIcon className='-ml-6 w-5 h-5 text-secondary' onClick={()=>clearValue()}/>
        }
        {active && focus &&
          <span className='absolute top-10 left-4 bg-white bg-opacity-75 p-1 w-5/8 border border-gray-300 rounded-md'><PiKeyReturnThin className='inline w-5 h-5' /> to search</span>
        }
        {!value && 
          <FunnelIcon key={name+ 'icon'} className='-ml-6 w-4 h-4' /> 
        }
      </>
     ) : (
        <>
          <span onClick={()=>setActive(true)}>{label} 
          <FunnelIcon key={name+ 'icon'} className='ml-2 w-4 h-4 inline'/></span>
        </>
    )}
    </>
  )
}
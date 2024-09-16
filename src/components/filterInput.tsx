import { useState } from "react";
import {StyleTextfield} from '../lib/formstyles'

interface FilterInputProps {
  searchArray: {label: string, value: string}[] | undefined;
  defaultValue: string;
  name: string;
  autoFocus?: boolean;
  multiple?: boolean; // Added multiple prop
  onSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FilterInput(props: FilterInputProps) {
  const {searchArray, onSelect, defaultValue, name, autoFocus, multiple = false} = props; // Default multiple to false
  const [filteredArray, setFilteredArray] = useState<{label: string, value: string}[]>([]);
  const [search, setSearch] = useState(defaultValue || '');
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [kbIndex, setKbIndex] = useState(-1);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target?.value === '') {
      setKbIndex(0);
    }
    setSearch(e.target.value);
    const filtered = searchArray?.filter(item => 
      item.label.toLowerCase().includes(e.target.value.toLowerCase()) || 
      item.value.toLowerCase().includes(e.target.value.toLowerCase())
    ) || [];
    // setSelectedValues(e.target.value.split(', '));
    setFilteredArray(filtered);

    
  }

  const handleSelect = (value: string) => {
    if (multiple) {
      if (!selectedValues.includes(value)) {
        const newSelectedValues = [...selectedValues, value];
        setSelectedValues(newSelectedValues);
        propagateChange(newSelectedValues);
      }
    } else {
      setSelectedValues([value]);
      propagateChange([value]);
    }
    setSearch('');
    setFilteredArray([]);
    setKbIndex(0);
  }

  const handleRemove = (value: string) => {
    const newSelectedValues = selectedValues.filter(v => v !== value);
    setSelectedValues(newSelectedValues);
    propagateChange(newSelectedValues);
  }

  const propagateChange = (values: string[]) => {
    const obj = formatValue(values.join(', '));
    onSelect(obj);
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (searchArray) {
        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          if (filteredArray.length > 0) {
            handleSelect(filteredArray[kbIndex].value);
          }
        }
        if(e.key === "Escape" || e.key === "Tab") {
          setFilteredArray([]);
          setKbIndex(-1);
        }
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          const increment = e.key === "ArrowDown" ? 1 : -1;
          const newKbIndex = Math.max(0, Math.min(kbIndex + increment, filteredArray.length - 1));
          setKbIndex(newKbIndex);
          document.getElementById(`item-${name}-${newKbIndex}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
    return;
  }

  const formatValue = (value: string) => {
    const obj = {target: {name: name, value:value}} 
    return obj as React.ChangeEvent<HTMLInputElement>
  }
  console.log('selectedValues', selectedValues)
  console.log('kbIndex', kbIndex)
  return (
    <div className="relative bg-white dark:bg-gray-darkest dark:text-white">
      <div className="flex flex-wrap items-center gap-2 p-2 border rounded">
        {multiple && selectedValues.map((value, index) => (
          <div key={index} className="flex items-center bg-gray-lighter dark:bg-gray-darker rounded-full px-3 py-1">
            <span>{value}</span>
            <button onClick={() => handleRemove(value)} className="ml-2 text-red-500">x</button>
          </div>
        ))}
        <input
          type="text"
          placeholder='Type to see options'
          value={search}
          onFocus={() => setKbIndex(-1)}
          className={`flex-grow ${StyleTextfield}`}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
        />
      </div>
      {search.length > 0 && filteredArray.length > 0 &&
        <div className="absolute top-50 z-[1000] left-1 bg-white border-gray-lighter border rounded-b-md max-h-[200px] overflow-y-scroll">
          {filteredArray?.filter(item => !selectedValues.includes(item.value)).map((item, index) => (
            <FilterItem 
              key={index}
              item={item} 
              index={index} 
              kbIndex={kbIndex} 
              name={name} 
              onClick={handleSelect}/>
          ))}
        </div>
      }
    </div>
  )
}

function FilterItem(props: {item: {label: string, value: string}, index: number, kbIndex: number, name: string, onClick: (value: string) => void}) {
  const {item, index, kbIndex, name, onClick} = props;
  const display = item.value !== item.label ? `${item.value} - ${item.label}` : item.value;
  console.log('item', item)
  console.log('kbIndex', kbIndex)
  return (
    <div 
    onClick={() => onClick(item.value)} 
    id={`item-${name}-${index}`} 
    className={`p-2 cursor-pointer ${kbIndex === index ? 'bg-gray-lightest text-black' : 'bg-gray-darkest text-white hover:bg-gray-lighter hover:text-black dark:text-white hover:dark:text-black'}`} 
    key={index}
  >
    {display}
  </div>
  )
}
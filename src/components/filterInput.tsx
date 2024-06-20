import { useState } from "react";
import {StyleTextfield} from '../lib/formstyles'

interface FilterInputProps {
  searchArray: {label: string, value: string}[] | undefined;
  defaultValue: string;
  name: string;
  onSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FilterInput(props: FilterInputProps) {
  const {searchArray, onSelect, defaultValue, name} = props;
  const [filteredArray, setFilteredArray] = useState<{label: string, value: string}[]>([]);
  const [search, setSearch] = useState(defaultValue || '');
  const [selectedValue, setSelectedValue] = useState(defaultValue || '');
  const [kbIndex, setKbIndex] = useState(0);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target?.value==''){
      setKbIndex(0);
    }
    setSearch(e.target.value);
    setFilteredArray(searchArray?.filter(item => item.label.toLowerCase().includes(e.target.value.toLowerCase()) || item.value.toLowerCase().includes(e.target.value.toLowerCase())) || []);
  }
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (searchArray) {
        if (e.key === "Enter") {
          setSearch(selectedValue);
          e.preventDefault();
          e.stopPropagation();
          if (filteredArray.length > 0) {
            //create object that matches the shape of an HTML input event
            const obj = {target: {name: name, value:filteredArray[kbIndex].value}} 
            onSelect(obj as React.ChangeEvent<HTMLInputElement>);
            setFilteredArray([]);
            setKbIndex(0);
          }
        }
        if(e.key === "Escape" || e.key === "Tab") {
          setFilteredArray([]);
          setKbIndex(0);
        }
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          const increment = e.key === "ArrowDown" ? 1 : -1;
          const newKbIndex = Math.max(0, Math.min(kbIndex + increment, filteredArray.length - 1));
          setKbIndex(newKbIndex);
          setSelectedValue(filteredArray[newKbIndex].value);
          document.getElementById(`item-${name}-${newKbIndex}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
    return;
  }
  return (
    <div className="relative">
      <input
        type="text"
        placeholder='Type to see options'
        value={search}
        onFocus={() => setKbIndex(0)}
        className={StyleTextfield}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      {search.length > 0 && filteredArray.length > 0 &&
        <div className="absolute top-50 z-[1000] left-1 bg-white border-gray-lighter border rounded-b-md max-h-[200px] overflow-y-scroll">
          {filteredArray?.map((item, index) => (
            <FilterItem item={item} index={index} kbIndex={kbIndex} name={name} />
          ))}
        </div>
      }
    </div>
    )
  
}

function FilterItem(props: {item: {label: string, value: string}, index: number, kbIndex: number, name: string}) {
  const {item, index, kbIndex, name} = props;
  const display = item.value !== item.label ? `${item.value} - ${item.label}` : item.value;
  return (
    <div id={`item-${name}-${index}`} className={`p-2 hover:bg-gray-lighter ${kbIndex === index ? 'bg-gray-lighter' : ''}`} key={index}>{display}</div>
  )
}
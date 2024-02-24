import { useEffect, useState, useRef } from "react";
import {Button, Input} from '@material-tailwind/react'

type SearchBarProps = {
  onSearch: (searchTerm: string) => void;
  onClear?: () => void; //optional function to call if the search box is cleared
  searchTerm?: string
  placeHolder?: string
}

export default function SearchBar({ onSearch, onClear, searchTerm="", placeHolder='' }: SearchBarProps){
  const [searchValue, setSearchValue] = useState(searchTerm);
  const [showShortcut, setShowShortcut]= useState(true)
  const [hasSearched, setHasSearched] = useState(Boolean(searchTerm)) //flag to track whether the search has already happened. if it's passed in as a prop that means a search is already done
  const searchRef = useRef<HTMLInputElement>(null)
  const isActive = () => {
    return document.activeElement === searchRef.current?.children[0]
  }
  const handleKeyDown = (event: KeyboardEvent) => {
    const inputElement = event.target as HTMLInputElement;
    // Focus on the search input when cmd/meta + k is pressed
    if (event.key === 'k' && event.metaKey) {
      return (searchRef.current?.children[0] as HTMLInputElement)?.focus();
    }
    //blur the element when escape is pressed
    //if a search has aleady happened, escape clears the search input and refreshes if needed
    if(event.key === 'Escape' && isActive()){
      if(hasSearched){
        handleClear()
        setSearchValue('')
      } else {
        return (searchRef.current?.children[0] as HTMLInputElement)?.blur()
      }
    }
    //trigger a search if focused and active
    if(event.key === 'Enter' && isActive()){
      setSearchValue(inputElement.value)
      return handleSearch(inputElement.value);
    }
  };
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
      return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasSearched]);
  
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value)
    if(event.target.value === ''){
      handleClear()
    }
  }
  //param is optional; added because setSearchValue might be slow to update, so this is passed in in the case of hitting Enter on the keyboard
  const handleSearch = (value:string = '') => {
    if(value || searchValue){
      value ? onSearch(value) : onSearch(searchValue)
      setHasSearched(true)
    }
  }
  const handleClear = () => {
    if(onClear && hasSearched){
      setHasSearched(false)
      onClear()
    }
  }
  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select()
    setShowShortcut(false)
    
  }
  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setShowShortcut(true)
  }
  return(
    <div className='w-[30rem] relative flex flex-items-center overflow-visible' >
      <Input 
      id='searchInput' 
      size='lg' 
      className="w-[200px]"
      onChange={handleInputChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      value={searchValue}
      ref={searchRef}
      labelProps={{
        className: 'before:mr-0 after:ml-0 invisible',
      }}
      placeholder={placeHolder || 'Search'}></Input>
      {(!searchValue && showShortcut) &&
        <span className="absolute text-sm drop-shadow-2xl inset-y-2 right-[7rem] flex items-center p-1 rounded-lg text-gray-600 border border-gray-300">&#8984;+K</span>
      }
      <Button className="bg-secondary ml-2" onClick={()=> handleSearch()}>Search</Button>
    </div>
  )
}
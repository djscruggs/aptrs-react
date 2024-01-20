import { useEffect, useState, useRef } from "react";
import {Button, Input} from '@material-tailwind/react'

type SearchBarProps = {
  onSearch: (searchTerm: string) => void;
  searchTerm?: string
  placeHolder?: string
}

export default function SearchBar({ onSearch, searchTerm="", placeHolder='' }: SearchBarProps){
  const [searchValue, setSearchValue] = useState(searchTerm);
  const [showShortcut, setShowShortcut]= useState(true)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchValue(searchParam);
    }
  }, []);
  useEffect(() => {
    const isActive = () =>{
      return document.activeElement === document.getElementById('searchInput')
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      // Focus on the search input when cmd/meta + k is pressed
      if (event.key === 'k' && event.metaKey) {
        (searchRef.current?.children[0] as HTMLInputElement)?.focus();
      }
      //blur the element when escape is pressed
      if(event.key === 'Escape' && isActive()){
        (searchRef.current?.children[0] as HTMLInputElement)?.blur()
      }
      //trigger a search if focused and active
      if(event.key === 'Enter' && isActive()){
        console.log('calling search')
        handleSearch();
      }
    };
  
    document.addEventListener('keydown', handleKeyDown);
  
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  }

  const handleSearch = () => {
    onSearch(searchValue);
  }
  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select()
    console.log('focus called')
    setShowShortcut(false)
    
  }
  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    console.log('blur called')
    setShowShortcut(true)
  }

  return(
    <div className='w-[30rem] relative flex flex-items-center overflow-visible'>
    
      <Input variant="outlined" 
      id='searchInput' 
      size='lg' 
      className="w-min"
      onChange={handleInputChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      value={searchValue}
      ref={searchRef}
      label="Search"
      placeholder={placeHolder || 'Search'}></Input>
      {(!searchValue && showShortcut) &&
        <span className="absolute text-sm drop-shadow-2xl inset-y-2 right-[7rem] flex items-center p-1 rounded-lg text-gray-600 border border-gray-300">&#8984;+K</span>
      }
      <Button className="bg-primary ml-2" onClick={handleSearch}>Search</Button>
      
      
      </div>
  )
}
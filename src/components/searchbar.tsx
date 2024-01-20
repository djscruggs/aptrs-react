import { useEffect, useState } from "react";
import {Button, Input} from '@material-tailwind/react'

type SearchBarProps = {
  onSearch: (searchTerm: string) => void;
  searchTerm?: string
  placeHolder?: string
}

export default function SearchBar({ onSearch, searchTerm="", placeHolder='' }: SearchBarProps){
  const [searchValue, setSearchValue] = useState(searchTerm);
  const [showShorcut, setShowShorcut] = useState(true)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchValue(searchParam);
    }
  }, []);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'k') {
        // Focus on the search input when cmd/meta + k is pressed
        document.getElementById('searchInput')?.focus();
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
  const enterToSearch = (event: KeyboardEvent) => {
    console.log('enter', event.key)
    if (event.key === 'Enter') {
      // Focus on the search input when cmd/meta + k is pressed
      handleSearch()
    }
  };
  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select()
    setShowShorcut(false)
  }
  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setShowShorcut(true)
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
      label="Search"
      placeholder={placeHolder || 'Search'}></Input>
      {showShorcut &&
        <span className="absolute text-sm drop-shadow-2xl inset-y-2 right-[7rem] flex items-center p-1 rounded-lg text-gray-600 border border-gray-300">&#8984;+K</span>
      }
      <Button className="bg-primary ml-2" onClick={handleSearch}>Search</Button>
      
      
      </div>
  )
}
import { useEffect, useState } from "react";
import {Button, Input} from '@material-tailwind/react'

type SearchBarProps = {
  onSearch: (searchTerm: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps){
  const [searchValue, setSearchValue] = useState("");
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
  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select()
  }

  return(
    <div className='w-[40rem] relative flex flex-items-center overflow-visible'>
    
      {/* <input type='text' className='p-2 w-md rounded-md border border-1 border-blue-gray-100' name='search' value={searchValue} onChange={handleInputChange} /> */}
      <Input variant="outlined" 
      id='searchInput' 
      size='lg' 
      className="w-min"
      onChange={handleInputChange}
      onFocus={handleFocus}
      label="Search"
      placeholder="Search"></Input>
      <span className="absolute text-sm drop-shadow-2xl inset-y-2 right-[18%] flex items-center p-1 rounded-lg text-gray-600 border border-gray-300">&#8984;K</span>
      
      <Button type="submit" className="bg-primary ml-2" onClick={handleSearch}>Search</Button>
      
      
      </div>
  )
}
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import {Button} from '../components/button'
import { fetchProject } from '../lib/data/api';
import { Project } from '../lib/data/definitions';
import { withAuth } from "../lib/authutils";

const ProjectForm: React.FC = () => {
  const params = useParams()
  const id: string | undefined = params.id
  const [error, setError] = useState(false)
  console.log("id")
  console.log(id)
  
  
  
  const [project, setProject] = useState(null)
  useEffect(() => {
    fetchProject(id)
      .then((data) => {
        console.log(data)
        setProject(data);
      }).catch((error) => {
        setError(error)})
  }, []);

    
  const btnDisabled = false;
  const handleChange = (event: any) => {
    const name = event.target.name;
    const value = event.target.value;
    // setInputs(values => ({...values, [name]: value}))
  }

  const handleSubmit = (event: any) => {
    event.preventDefault();
    console.log(event)
  }
  
  return (
          
            <div className="max-w-sm flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
                <form action="" onSubmit={handleSubmit} id="projectForm" method="POST">
                  <h1 className="mb-3 text-2xl">
                    Edi  
                  </h1>
                  <div className="w-full mb-4">
                    <div>
                      <label
                        className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                        htmlFor="name"
                      >
                        Username
                      </label>
                      <div className="relative">
                        <input
                          className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                          id="username"
                          type="text"
                          name="name"
                          placeholder="Enter your username"
                          required
                        />
                        <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label
                        className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                        htmlFor="password"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <input
                          className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                          id="password"
                          type="password"
                          name="password"
                          placeholder="Enter password"
                          required
                          minLength={4}
                          
                        />
                        <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                      </div>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="mt-4 w-full"
                    disabled = {btnDisabled}
                  >
                      Log in <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
                  </Button>
                 
                    <div className="flex h-8 mt-1em items-end space-x-1" aria-live="polite" aria-atomic="true">
                      <>
                        <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                        <p className="text-sm text-red-500">Invalid credentials</p>
                      </>
                    </div>
                  
                </form>
            </div>
  );
}
          



export default withAuth(ProjectForm);
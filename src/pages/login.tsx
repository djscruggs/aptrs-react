import React, { useState } from 'react';
import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import {Button} from '../components/button'
import { login } from '../lib/data/api';
import { StyleLabel } from '../lib/formstyles'

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [btnDisabled, setBtnDisabled] = useState(false);
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setBtnDisabled(true)
    
    const result = await login(email,password)
    //api returns login errors like so:
    // {detail:"No active account found with the given credentials"}
    if(!result){
      //bad email & password
      setLoginError(true)
      setBtnDisabled(false)
    } else {
      //using document.location to force a full re-render, otherwise it doesn't pass the auth state to the navbar
      const redirect = localStorage.getItem('redirect')
      if(redirect){
        localStorage.removeItem('redirect')
        document.location = redirect;
      } else {
        document.location = "/dashboard";
      }
    } 
  };
  return (
          
            <div className="max-w-sm flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
                <form action="" onSubmit={handleLogin} id="loginForm">
                  {/* <h1 className="mb-3 text-2xl">
                    Please log in to continue.
                  </h1> */}
                  <div className="w-full mb-4">
                    <div>
                      <label
                        className={StyleLabel}
                        htmlFor="email"
                      >
                        Username
                      </label>
                      <div className="relative">
                        <input
                          className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                          id="email"
                          type="email"
                          name="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          required
                        />
                        <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label
                        className={StyleLabel}
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
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                      </div>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="bg-primary"
                    disabled = {btnDisabled}
                  >
                      Log in <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
                  </Button>
                  {loginError &&
                    <div className="flex h-8 mt-1em items-end space-x-1" aria-live="polite" aria-atomic="true">
                      <>
                        <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                        <p className="text-sm text-red-500">Invalid credentials</p>
                      </>
                    </div>
                  } 
                </form>
            </div>)
          
};


export default Login;
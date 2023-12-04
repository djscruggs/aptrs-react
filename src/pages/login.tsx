import React, { useState } from 'react';
import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import {Button} from '../components/button'
import { login } from '../lib/data/api';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [btnDisabled, setBtnDisabled] = useState(false);
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setBtnDisabled(true)
    
    const result = await login(username,password)
    //api returns login errors like so:
    // {detail:"No active account found with the given credentials"}
    if(!result){
      //bad username & password
      setLoginError(true)
      setBtnDisabled(false)
    } else {
      //using document.location to force a full re-render, otherwise it doesn't pass the auth state to the navbar
      document.location = "/dashboard";
    }
    
    // const result = await login(username, password)
    // Simulate authentication logic (replace with actual authentication logic)
    // if (username === 'user' && password === 'password') {
    //   // Set authentication flag in local storage
    //   sessionStorage.setItem('authenticated', 'true');
    //   window.location.href = '/'; // Redirect to the main app page on successful login
    // }
  };
  return (
          
            <div className="max-w-sm flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
                <form action="" onSubmit={handleLogin} id="loginForm">
                  <h1 className="mb-3 text-2xl">
                    Please log in to continue.
                  </h1>
                  <div className="w-full">
                    <div>
                      <label
                        className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                        htmlFor="username"
                      >
                        Username
                      </label>
                      <div className="relative">
                        <input
                          className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                          id="username"
                          type="text"
                          name="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
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
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
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
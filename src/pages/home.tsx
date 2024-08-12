import Logo from '../components/logo';
import Login from './login';
import { useCurrentUser } from '../lib/customHooks';
import { Navigate, useLocation } from 'react-router-dom';

interface HomeProps {
  isRelogin?: boolean
}
export default function Home({isRelogin = false}: HomeProps) {
  console.log('isRelogin', isRelogin)
  //is this a relogin after session expiration? set in WithAuth in authutils
  const currentUser = useCurrentUser()
  //if logged in, redirect to dashboard
  if(currentUser && !isRelogin){
    return <Navigate to={"/dashboard"} />
  }
  
  return (
    <main className="flex min-h-screen flex-col">
      <div className="bg-primary flex h-20 shrink-0 items-end rounded-lg bg-primary-500 color-primary p-4 md:h-52">
        <div className="flex flex-row items-center leading-none text-white">
          <p className="text-[44px]">Automated Penetration Testing Reporting System</p>
        </div>
      </div>
      <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
        <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:w-2/5 md:px-20">
          {/* <div
            className={styles.shape}
          /> */}
          <p className='text-xl text-gray-800 md:text-3xl md:leading-normal'>
            <strong>Welcome!</strong>
          </p>
          {isRelogin && 
            <p>Please login to proceed.</p>
          }
          <Login />
        </div>
        <div className="flex items-top justify-center align-top p-6 md:w-3/5 md:px-28 md:py-12">
          
          <div className="h-1/2 flex justify-center items-start">
              <Logo />
          </div>
          
          

        </div>
      </div>
    </main>
  );
}

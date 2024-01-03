import AcmeLogo from '../components/acme-logo';
import Login from './login';
import { AuthUser } from '../lib/data/api';
import { Navigate, useLocation } from 'react-router-dom';


export default function Home() {
  const location = useLocation()
  //is this a relogin after session expiration? set in WithAuth in authutils
  const isRelogin = location.state?.relogin
  //if logged in, redirect to dashboard
  if(AuthUser()){
    return <Navigate to={"/dashboard"} />
  }
  
  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className="bg-primary flex h-20 shrink-0 items-end rounded-lg bg-primary-500 color-primary p-4 md:h-52">
        <AcmeLogo />
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
        <div className="flex items-center justify-center align-top p-6 md:w-3/5 md:px-28 md:py-12">
          {/* Add Hero Images Here */}
          <img
            src="/hero-desktop.png"
            width={1000}
            height={760}
            className='hidden md:block'
            alt="Screensots of the dahboard project shwoing desktop version"
          />
          <img
            src="/hero-desktop.png"
            width={560}
            height={620}
            className='block md:hidden'
            alt="Screensots of the dahboard project shwoing desktop version"
          />
        </div>
      </div>
    </main>
  );
}

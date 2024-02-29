// App.tsx
import React, {useState} from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Layout from './layouts/layout';
import Home from './pages/home';
import Login from './pages/login';
import Vulnerabilities from './pages/vulnerabilities';
import VulnerabilityForm from './pages/vulnerability-form';
import Customers from './pages/customers';
import Projects from './pages/projects'
import ProjectView from './pages/project-view';
import ProjectForm from './pages/project-form';
import CompanyForm from './pages/company-form';
import Companies from './pages/companies';
import Dashboard from './pages/dashboard'; // Replace with your protected page component
import Users from './pages/users'
import ErrorPage from './pages/error-page';
import AccessDenied from './pages/access-denied';
import Profile from './pages/profile';
import { useEffect } from 'react';
import { refreshAuth, getAuthUser } from './lib/data/api';
import.meta.env.VITE_APP_ENV


const App: React.FC = () => {
  const user = getAuthUser()
  const navigate = useNavigate()
  useEffect(() => {
    const refreshUser = async () => {
      if('development' === import.meta.env.VITE_APP_ENV){
        console.log('skipping refresh')
      }
      console.log('refreshing at time ', new Date().toISOString())
      try {
        const refreshedUser = await refreshAuth();
        if(!refreshedUser){
          navigate('/')
        }
      } catch(error){
        console.error('Error refreshing authentication:', error);
      }
    };
    // Call the refreshUser function every 10 minutes
    const intervalId = setInterval(refreshUser, 600000);
    return () => clearInterval(intervalId);
  }, []);
  
  return (
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            {user &&
            <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/projects" element={<Projects pageTitle='Projects' hideActions={false}/>} />
            <Route path="/projects/new" element={<ProjectForm />} />
            <Route path="/projects/:id" element={<ProjectView />} />
            <Route path="/projects/:id/edit" element={<ProjectForm />} />
            <Route path="/projects/:projectId/vulnerability/add" element={<VulnerabilityForm action='addToProject' />} />
            <Route path="/projects/:projectId/vulnerability/add/:id" element={<VulnerabilityForm action='addToProject'/>} />
            <Route path="/projects/:projectId/vulnerability/edit/:id" element={<VulnerabilityForm action='saveToProject'/>} />
            <Route path="/companies/:id/edit" element={<CompanyForm />} />
            <Route path="/companies/new" element={<CompanyForm />} />
            <Route path="/vulnerabilities" element={<Vulnerabilities />} />
            <Route path="/vulnerabilities/:id/edit" element={<VulnerabilityForm />} />
            <Route path="/vulnerabilities/new" element={<VulnerabilityForm />} />
            <Route path="/users" element={<Users />} />
            <Route path="/profile" element={<Profile />} />
            </>
            }
            <Route path="/access-denied" element={<AccessDenied />} />
            <Route path="/error" element={<ErrorPage />} />
            
            <Route path="404" element={<ErrorPage is404={true}/>} />
            <Route path="*" element={<ErrorPage is404={true}/>} />
          </Routes>
        </Layout>
  
  );
};

export default App;

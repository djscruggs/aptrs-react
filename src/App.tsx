// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Layout from './layouts/layout';
import { AuthProvider, authenticated } from './lib/authcontext';
import Home from './pages/home';
import Login from './pages/login';
import ErrorPage from './components/error-page';
import Vulnerabilities from './pages/vulnerabilities';
import Customers from './pages/customers';
import Projects from './pages/projects';
import ProjectForm from './pages/project-form';
import CompanyForm from './pages/company-form';
import OldCompanyForm from './pages/old-company-form';
import Companies from './pages/companies';
import Dashboard from './pages/dashboard'; // Replace with your protected page component



const App: React.FC = () => {
  const isAuthenticated = authenticated(); // Fallback to false if context is undefined
  return (
    <AuthProvider>
      <Router>
        <Layout isAuthenticated={isAuthenticated}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/projects" element={<Projects pageTitle='Projects'/>} />
            <Route path="/projects/:id/edit" element={<ProjectForm />} />
            <Route path="/companies/:id/edit" element={<CompanyForm />} />
            <Route path="/companies-old/:id/edit" element={<OldCompanyForm />} />
            <Route path="/companies/new" element={<CompanyForm />} />
            <Route path="/vulnerabilities" element={<Vulnerabilities />} />
            <Route path="/error" element={<ErrorPage />} />
            <Route path="*" element={<ErrorPage is404={true}/>} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;

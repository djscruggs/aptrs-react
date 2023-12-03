// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Layout from './layouts/layout';
import { AuthProvider, authenticated } from './lib/authcontext';
import Home from './pages/home';
import Login from './pages/login';
import Vulnerabilities from './pages/vulnerabilities';
import Customers from './pages/customers';
import Projects from './pages/projects';
import Companies from './pages/companies';
import Dashboard from './pages/dashboard'; // Replace with your protected page component



const App: React.FC = () => {
  const isAuthenticated = Boolean(authenticated()); // Fallback to false if context is undefined
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
            <Route path="/projects" element={<Projects />} />
            <Route path="/vulnerabilities" element={<Vulnerabilities />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;

// App.tsx
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layouts/layout';
import { AuthContext, AuthProvider } from './lib/authcontext';
import Home from './pages/home';
import Login from './pages/login';
import Vulnerabilities from './pages/vulnerabilities';
import Customers from './pages/customers';
import Companies from './pages/companies';
import Dashboard from './pages/dashboard'; // Replace with your protected page component



const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/vulnerabilities" element={<Vulnerabilities />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;

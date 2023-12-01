// App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './layouts/layout';
import { AuthProvider } from './lib/authcontext';
import Home from './pages/home';
import Login from './pages/login';
// Import other pages here

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            {/* Other protected routes */}
            {/* <PrivateRoute path="/protectedRoute" element={<ProtectedComponent />} /> */}
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;

import React, { useState } from 'react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Simulate authentication logic (replace with actual authentication logic)
    if (username === 'user' && password === 'password') {
      // Set authentication flag in local storage
      localStorage.setItem('authenticated', 'true');
      window.location.href = '/'; // Redirect to the main app page on successful login
    }
  };
  return (
    <div>
      <h2>Login Page</h2>
      <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
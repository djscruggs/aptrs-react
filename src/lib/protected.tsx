import React from 'react';

interface ProtectedComponentProps {
  authenticated: boolean;
}

const ProtectedComponent: React.FC<ProtectedComponentProps> = ({ authenticated }) => {
  console.log("in protected")
  return (
    <div>
      {authenticated ? <h1>Welcome! This is a protected component.</h1> : <h1>You need to log in.</h1>}
    </div>
  );
};

export default ProtectedComponent;
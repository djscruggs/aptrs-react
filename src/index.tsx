import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './output.css';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from "@material-tailwind/react";
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter >
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter >
  </React.StrictMode>
);



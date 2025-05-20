import React from 'react';
import ReactDOM from 'react-dom/client'; // Import the new API
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';  


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

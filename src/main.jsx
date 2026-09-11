import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import './history.css';
import { registrarServiceWorker } from './pwa.js';
registrarServiceWorker();
createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);

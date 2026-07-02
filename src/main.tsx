import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ConfirmProvider } from './contexts/ConfirmContext';
import 'react-quill/dist/quill.snow.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ConfirmProvider>
      <App />
    </ConfirmProvider>
  </React.StrictMode>
);
// Point d'entrée du front : monte l'application React dans la page.
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { FournisseurAuth } from './contextes/ContexteAuth.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* BrowserRouter : gestion de la navigation entre les pages */}
    <BrowserRouter>
      {/* FournisseurAuth : rend l'utilisateur connecté accessible partout */}
      <FournisseurAuth>
        <App />
      </FournisseurAuth>
    </BrowserRouter>
  </React.StrictMode>
);

// Point d'entrée du front : monte l'application React dans la page.
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { FournisseurAuth } from './contextes/ContexteAuth.jsx';
import { FournisseurGardeNav } from './contextes/ContexteGardeNav.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <FournisseurGardeNav>
        <FournisseurAuth>
          <App />
        </FournisseurAuth>
      </FournisseurGardeNav>
    </BrowserRouter>
  </React.StrictMode>
);

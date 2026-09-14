import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import './history.css';
import { registrarServiceWorker } from './pwa.js';
import { aplicarEnderecoDoLink } from './mentor.js';
registrarServiceWorker();
// Antes de montar a tela: abrir o campus com ?ia=... aponta o Lumi para aquele endereço e some
// com o parâmetro da barra, para o link não ficar sendo recompartilhado por engano.
if (aplicarEnderecoDoLink()) history.replaceState(null, '', location.pathname + location.hash);
createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);

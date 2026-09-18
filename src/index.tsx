import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './components/app/App';
import "@fontsource/museomoderno";
import "@fontsource/inter";
import "@fontsource/montserrat";

const container = document.getElementById('root') as HTMLElement;
const app = (
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);

// build/index.html после пререндера (см. scripts/prerender.js) уже содержит
// готовую разметку внутри #root — в этом случае гидрируем её, а не рендерим
// с нуля. При обычном `npm start` (без пререндера) #root пуст, и это
// обычный клиентский рендер.
if (container.hasChildNodes()) {
  ReactDOM.hydrateRoot(container, app);
} else {
  ReactDOM.createRoot(container).render(app);
}

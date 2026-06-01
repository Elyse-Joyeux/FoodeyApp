import { BrowserRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { FoodeyApp } from './App.js';

if (import.meta.hot) {
  import.meta.hot.accept();
}

const container = document.getElementById('root');

createRoot(container!).render(
  <BrowserRouter>
    <FoodeyApp />
  </BrowserRouter>
);

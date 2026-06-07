import { BrowserRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { FoodeyApp } from './App.js';
import { UserProvider } from './src/context/user-context.js';

if (import.meta.hot) {
  import.meta.hot.accept();
}

const container = document.getElementById('root');

createRoot(container!).render(
  <BrowserRouter>
    <UserProvider>
      <FoodeyApp />
    </UserProvider>
  </BrowserRouter>
);

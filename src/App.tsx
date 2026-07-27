// src/App.tsx
import { useRoutes } from 'react-router-dom';
import { routes } from './router/router';

function App() {
  return useRoutes(routes);
}

export default App;
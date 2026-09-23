import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import ProjectsPage from './components/ProjectDetails.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProjectsPage />
  </StrictMode>,
);

// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider} from "./context/authcontext.tsx";
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <App />
                <Toaster
                    position="top-center"
                    toastOptions={{
                        style: {
                            background: '#1C1917',
                            color: '#fff',
                            fontSize: '14px',
                            borderRadius: '12px',
                            padding: '12px 16px',
                        },
                        success: { iconTheme: { primary: '#5B5BD6', secondary: '#fff' } },
                        error: { iconTheme: { primary: '#DC2626', secondary: '#fff' } },
                    }}
                />
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
);
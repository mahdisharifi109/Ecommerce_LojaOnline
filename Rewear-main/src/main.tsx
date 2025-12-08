import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);

import './index.css'

// Error boundary para capturar erros de renderização

const renderError = (error: any) => {
  console.error('Render error:', error);
  root.render(
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', color: '#ef4444' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Ocorreu um erro ao iniciar a aplicação
      </h1>
      <pre style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto' }}>
        {error instanceof Error ? error.message : String(error)}
      </pre>
      <p style={{ marginTop: '1rem', color: '#6b7280' }}>
        Verifique a consola do navegador para mais detalhes.
      </p>
    </div>
  );
};

try {
  console.log('Importing App...');
  // Import App dynamically to catch initialization errors (like Firebase config missing)
  import('./App').then(({ default: App }) => {
    console.log('App imported, rendering...');
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  }).catch(renderError);
} catch (error) {
  renderError(error);
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { FirebaseProvider } from './firebase/FirebaseProvider';
import { DataProvider } from './context/DataProvider';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <FirebaseProvider>
      <DataProvider>
        <App />
      </DataProvider>
    </FirebaseProvider>
  </React.StrictMode>
);
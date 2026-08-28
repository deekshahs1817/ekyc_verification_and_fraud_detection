import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { store } from './store';
import App from './App';

const GOOGLE_CLIENT_ID =
  process.env.REACT_APP_GOOGLE_CLIENT_ID ||
  process.env.VITE_GOOGLE_CLIENT_ID ||
  '992314878877-vvul89n1rol4ohtbkebhse4fs2npkgtn.apps.googleusercontent.com';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </Provider>
  </React.StrictMode>
);

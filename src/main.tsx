import React from 'react';import{createRoot}from'react-dom/client';import App from './App';import './style.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
// The app shell can open from the home screen, but voice calls still require a network connection.
if ('serviceWorker' in navigator) {
 window.addEventListener('load', () => { void navigator.serviceWorker.register('./sw.js').catch(() => {}); });
}

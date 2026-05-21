import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { GestureProvider } from './context/GestureContext.jsx'
import './styles/index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GestureProvider>
      <App />
    </GestureProvider>
  </StrictMode>,
)

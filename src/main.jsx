import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import logo from './assets/protosite_logo.png'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <img src={logo} className='app_logo'></img>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
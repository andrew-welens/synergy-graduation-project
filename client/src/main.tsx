import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import App from './App'
import { initTheme } from './utils/theme'
import './styles/global.scss'
import './styles/animations.scss'

initTheme()
const router = createBrowserRouter(App)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)

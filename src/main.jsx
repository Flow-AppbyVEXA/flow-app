import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../quiosco-app.jsx'
import Login from './Login.jsx'
import { AuthProvider, useAuth } from './AuthContext.jsx'

function Root() {
  const { user } = useAuth()
  return user ? <App /> : <Login />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </React.StrictMode>
)

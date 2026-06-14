import { createContext, useContext, useState, useEffect } from 'react'
import { auth, db } from './firebase.js'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

const INIT_DATA = {
  business: { name: 'Mi Quiosco', sidebarColor: '#0f1923', accentColor: '#2563EB' },
  products:  [],
  providers: [],
  sales:     [],
  registers: [],
  cashiers:  [],
  nid: { product: 1, provider: 1, sale: 1, register: 1, cashier: 1 },
}

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u)
      setAuthLoading(false)
    })
    return unsub
  }, [])

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password)

  const register = async (email, password, businessName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    const initData = { ...INIT_DATA, business: { ...INIT_DATA.business, name: businessName } }
    await setDoc(doc(db, 'users', cred.user.uid, 'data', 'main'), initData)
    return cred
  }

  const logout = () => signOut(auth)

  if (authLoading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#0f1923',
        fontFamily: "'DM Sans', system-ui, sans-serif"
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: -2, marginBottom: 12 }}>Flow</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', letterSpacing: 3, textTransform: 'uppercase' }}>
            Cargando...
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

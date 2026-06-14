import { useState } from 'react'
import { useAuth } from './AuthContext.jsx'

const FONT = "'DM Sans', system-ui, sans-serif"

function FInput({ type = 'text', placeholder, value, onChange }) {
  const [f, setF] = useState(false)
  return (
    <input
      type={type} placeholder={placeholder} value={value} onChange={onChange}
      onFocus={() => setF(true)} onBlur={() => setF(false)}
      style={{
        fontFamily: FONT, width: '100%', padding: '12px 16px',
        border: `1.5px solid ${f ? '#2563EB' : '#E5E7EB'}`,
        borderRadius: 12, fontSize: 14, outline: 'none',
        boxSizing: 'border-box', transition: 'border 0.15s', background: 'white'
      }}
    />
  )
}

export default function Login() {
  const [mode, setMode]               = useState('login')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [businessName, setBusiness]   = useState('')
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(false)
  const { login, register }           = useAuth()

  const handleSubmit = async () => {
    if (!email || !password) { setError('Completá todos los campos'); return }
    if (mode === 'register' && !businessName) { setError('Ingresá el nombre de tu negocio'); return }
    setError(''); setLoading(true)
    try {
      if (mode === 'login') await login(email, password)
      else await register(email, password, businessName)
    } catch (err) {
      const msgs = {
        'auth/user-not-found':      'No existe una cuenta con ese email',
        'auth/wrong-password':      'Contraseña incorrecta',
        'auth/email-already-in-use':'Ya existe una cuenta con ese email',
        'auth/weak-password':       'La contraseña debe tener al menos 6 caracteres',
        'auth/invalid-email':       'Email inválido',
        'auth/invalid-credential':  'Email o contraseña incorrectos',
      }
      setError(msgs[err.code] || 'Ocurrió un error. Intentá de nuevo.')
    }
    setLoading(false)
  }

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login')
    setError(''); setEmail(''); setPassword(''); setBusiness('')
  }

  const Label = ({ children }) => (
    <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 7 }}>
      {children}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: FONT }}>

      {/* ── LEFT: branding ── */}
      <div style={{
        flex: 1, background: '#0f1923', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '60px 48px'
      }}>
        <div style={{ maxWidth: 340, width: '100%' }}>
          <div style={{ fontSize: 56, fontWeight: 900, color: 'white', letterSpacing: -2, marginBottom: 6, lineHeight: 1 }}>
            Flow
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 52 }}>
            Gestión Comercial Inteligente
          </div>

          {[
            ['📖', 'Lector de ventas',     'Vendé rápido por código de barras o nombre'],
            ['📦', 'Control de stock',      'Inventario en tiempo real con alertas automáticas'],
            ['📊', 'Reportes inteligentes', 'Métricas de ventas, rotación y rentabilidad'],
            ['⏰', 'Control de vencimientos','Alertas por color antes de que venza tu mercadería'],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ display: 'flex', gap: 14, marginBottom: 26 }}>
              <div style={{ fontSize: 18, marginTop: 2 }}>{icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'white', marginBottom: 3 }}>{title}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}

          <div style={{ marginTop: 52, fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: 0.3 }}>
            © Powered by VEXA 2026
          </div>
        </div>
      </div>

      {/* ── RIGHT: form ── */}
      <div style={{
        width: 480, background: 'white', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '60px 48px',
        boxShadow: '-4px 0 32px rgba(0,0,0,0.06)'
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>

          <div style={{ marginBottom: 36 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', letterSpacing: -0.5, marginBottom: 6 }}>
              {mode === 'login' ? 'Bienvenido de nuevo' : 'Crear cuenta'}
            </div>
            <div style={{ fontSize: 13, color: '#9CA3AF' }}>
              {mode === 'login' ? 'Ingresá con tu cuenta de Flow' : '30 días gratis · Sin tarjeta requerida'}
            </div>
          </div>

          {mode === 'register' && (
            <div style={{ marginBottom: 14 }}>
              <Label>Nombre del negocio</Label>
              <FInput placeholder="Ej: Kiosco San Martín" value={businessName} onChange={e => setBusiness(e.target.value)} />
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <Label>Email</Label>
            <FInput type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div style={{ marginBottom: 28 }}>
            <Label>Contraseña</Label>
            <FInput type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            {mode === 'register' && (
              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6 }}>Mínimo 6 caracteres</div>
            )}
          </div>

          {error && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10,
              padding: '11px 14px', marginBottom: 18, fontSize: 13, color: '#DC2626', fontWeight: 500
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit} disabled={loading}
            style={{
              width: '100%', padding: '14px', background: loading ? '#93C5FD' : '#2563EB',
              color: 'white', border: 'none', borderRadius: 12, fontFamily: FONT,
              fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: 20, transition: 'background 0.15s', letterSpacing: -0.2
            }}
          >
            {loading ? 'Cargando...' : mode === 'login' ? 'Ingresar' : 'Crear cuenta gratis'}
          </button>

          <div style={{ textAlign: 'center', fontSize: 13, color: '#9CA3AF' }}>
            {mode === 'login' ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}
            {' '}
            <button onClick={switchMode} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#2563EB', fontWeight: 700, fontFamily: FONT, fontSize: 13, padding: 0
            }}>
              {mode === 'login' ? 'Registrarte' : 'Iniciá sesión'}
            </button>
          </div>

          {mode === 'register' && (
            <div style={{
              marginTop: 28, padding: '14px 16px', background: '#F0FDF4',
              border: '1px solid #BBF7D0', borderRadius: 12, fontSize: 12, color: '#15803D', lineHeight: 1.7
            }}>
              ✅ <strong>30 días gratis</strong> sin necesidad de tarjeta.<br />
              Luego, precio especial los primeros 6 meses.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

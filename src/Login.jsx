import { useState } from 'react'
import { useAuth } from './AuthContext.jsx'

const FONT = "'Nunito', system-ui, sans-serif"

const TCS = `TÉRMINOS Y CONDICIONES DE USO — FLOW
Desarrollado por VEXA Software · Argentina

1. DESCRIPCIÓN DEL SERVICIO
Flow es una aplicación web de gestión comercial para quioscos, desarrollada y operada por VEXA Software. Permite registrar ventas, productos, proveedores, caja y reportes de manera digital.

2. REGISTRO Y CUENTA
Al registrarte, sos responsable de mantener la confidencialidad de tu contraseña. Tu cuenta es personal e intransferible.

3. SUSCRIPCIÓN Y PAGOS
El servicio incluye 30 días de prueba gratuita. Luego requiere una suscripción mensual abonada a través de Mercado Pago. Podés cancelar en cualquier momento desde Ajustes → Información de cuenta.

4. PRIVACIDAD Y DATOS
Tus datos comerciales (productos, ventas, caja) se almacenan de forma segura en Google Firebase. No compartimos tu información con terceros salvo Mercado Pago para el procesamiento de pagos. Los datos se usan únicamente para el funcionamiento del servicio y para la mejora de Flow.

5. PROPIEDAD INTELECTUAL
Todo el software, diseño e interfaz de Flow es propiedad de VEXA Software. Queda prohibida su reproducción o distribución sin autorización.

6. LIMITACIÓN DE RESPONSABILIDAD
Flow es una herramienta de gestión. VEXA Software no se responsabiliza por decisiones comerciales tomadas con base en los datos registrados en la plataforma.

7. JURISDICCIÓN
Estos términos se rigen por las leyes de la República Argentina. Para cualquier disputa, las partes acuerdan someterse a la jurisdicción de los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires.

8. CONTACTO
vexaflowcore@gmail.com | WhatsApp: +54 344 463 5779`

function FInput({ type = 'text', placeholder, value, onChange }) {
  const [f, setF] = useState(false)
  return (
    <input type={type} placeholder={placeholder} value={value} onChange={onChange}
      onFocus={() => setF(true)} onBlur={() => setF(false)}
      style={{ fontFamily: FONT, width: '100%', padding: '12px 16px', border: `1.5px solid ${f ? '#2563EB' : '#E5E7EB'}`, borderRadius: 12, fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border 0.15s', background: 'white', minHeight: 48 }} />
  )
}

const Label = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 7 }}>{children}</div>
)

function TermsModal({ onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 18, maxWidth: 520, width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F0F0F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 15, color: '#0F172A' }}>Términos y Condiciones</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#9CA3AF' }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          <pre style={{ fontFamily: FONT, fontSize: 12, color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>{TCS}</pre>
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid #F0F0F0' }}>
          <button onClick={onClose} style={{ width: '100%', background: '#2563EB', color: 'white', border: 'none', borderRadius: 10, padding: 12, fontFamily: FONT, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Entendido</button>
        </div>
      </div>
    </div>
  )
}

export default function Login() {
  const [mode, setMode]             = useState('login')
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [businessName, setBusiness] = useState('')
  const [acceptTerms, setAccept]    = useState(false)
  const [showTerms, setShowTerms]   = useState(false)
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)

  // Reset password
  const [resetMode, setResetMode]   = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent]   = useState(false)
  const [resetLoading, setResetL]   = useState(false)

  const { login, register, resetPassword } = useAuth()

  const AUTH_ERRORS = {
    'auth/user-not-found':       'No existe una cuenta con ese email',
    'auth/wrong-password':       'Contraseña incorrecta',
    'auth/email-already-in-use': 'Ya existe una cuenta con ese email',
    'auth/weak-password':        'La contraseña debe tener al menos 6 caracteres',
    'auth/invalid-email':        'Email inválido',
    'auth/invalid-credential':   'Email o contraseña incorrectos',
    'auth/too-many-requests':    'Demasiados intentos. Esperá unos minutos.',
  }

  const handleSubmit = async () => {
    if (!email || !password) { setError('Completá todos los campos'); return }
    if (mode === 'register' && !businessName) { setError('Ingresá el nombre de tu negocio'); return }
    if (mode === 'register' && !acceptTerms) { setError('Debés aceptar los Términos y Condiciones'); return }
    setError(''); setLoading(true)
    try {
      if (mode === 'login') await login(email, password)
      else await register(email, password, businessName)
    } catch (err) {
      setError(AUTH_ERRORS[err.code] || 'Ocurrió un error. Intentá de nuevo.')
    }
    setLoading(false)
  }

  const handleReset = async () => {
    if (!resetEmail) { setError('Ingresá tu email'); return }
    setError(''); setResetL(true)
    try {
      await resetPassword(resetEmail)
      setResetSent(true)
    } catch (err) {
      setError(AUTH_ERRORS[err.code] || 'No encontramos una cuenta con ese email.')
    }
    setResetL(false)
  }

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login')
    setError(''); setEmail(''); setPassword(''); setBusiness(''); setAccept(false); setResetMode(false)
  }

  const Err = () => error ? (
    <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '11px 14px', marginBottom: 16, fontSize: 13, color: '#DC2626', fontWeight: 600 }}>{error}</div>
  ) : null

  // ── RESET PASSWORD SCREEN ──────────────────────────────────────────────────
  const ResetScreen = () => (
    <div style={{ width: '100%', maxWidth: 360 }}>
      <button onClick={() => { setResetMode(false); setResetSent(false); setError(''); setResetEmail(''); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563EB', fontFamily: FONT, fontSize: 13, fontWeight: 700, padding: 0, marginBottom: 28 }}>
        ← Volver al inicio de sesión
      </button>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', letterSpacing: -0.5, marginBottom: 8 }}>Recuperar contraseña</div>
      {!resetSent ? (
        <>
          <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 28 }}>Te enviamos un link para restablecer tu contraseña.</div>
          <Label>Email de tu cuenta</Label>
          <FInput type="email" placeholder="tu@email.com" value={resetEmail} onChange={e => setResetEmail(e.target.value)} />
          <Err />
          <button onClick={handleReset} disabled={resetLoading}
            style={{ width: '100%', padding: 14, background: resetLoading ? '#93C5FD' : '#2563EB', color: 'white', border: 'none', borderRadius: 12, fontFamily: FONT, fontWeight: 700, fontSize: 14, cursor: 'pointer', marginTop: 20 }}>
            {resetLoading ? 'Enviando...' : 'Enviar link de recuperación'}
          </button>
        </>
      ) : (
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 14, padding: '24px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📧</div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A', marginBottom: 8 }}>¡Revisá tu email!</div>
          <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>Te enviamos un link para restablecer tu contraseña a <strong>{resetEmail}</strong>. Revisá también la carpeta de spam.</div>
        </div>
      )}
    </div>
  )

  // ── MAIN FORM ──────────────────────────────────────────────────────────────
  return (
    <>
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap'); * { box-sizing: border-box; } @media (max-width: 640px) { .login-left { display: none !important; } .login-right { width: 100% !important; padding: 40px 28px !important; } }`}</style>
      <div style={{ minHeight: '100vh', display: 'flex', fontFamily: FONT }}>

        {/* LEFT PANEL */}
        <div className="login-left" style={{ flex: 1, background: '#0f1923', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 48px' }}>
          <div style={{ maxWidth: 340, width: '100%' }}>
            <div style={{ fontSize: 56, fontWeight: 900, color: 'white', letterSpacing: -2, marginBottom: 6, lineHeight: 1 }}>Flow</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 52 }}>Gestión Comercial Inteligente</div>
            {[['📖','Lector de ventas','Vendé rápido por código o nombre'],['📦','Control de stock','Inventario en tiempo real con alertas'],['📊','Reportes inteligentes','Métricas de ventas, rotación y rentabilidad'],['⏰','Control de vencimientos','Alertas automáticas antes de que venzan'],].map(([icon, title, desc]) => (
              <div key={title} style={{ display: 'flex', gap: 14, marginBottom: 26 }}>
                <div style={{ fontSize: 18, marginTop: 2 }}>{icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'white', marginBottom: 3 }}>{title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 52, fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>© Powered by VEXA 2026</div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="login-right" style={{ width: 480, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 48px', boxShadow: '-4px 0 32px rgba(0,0,0,0.06)' }}>
          {resetMode ? <ResetScreen /> : (
            <div style={{ width: '100%', maxWidth: 360 }}>
              <div style={{ marginBottom: 32 }}>
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
              <div style={{ marginBottom: mode === 'register' ? 14 : 6 }}>
                <Label>Contraseña</Label>
                <FInput type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                {mode === 'register' && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 5 }}>Mínimo 6 caracteres</div>}
              </div>

              {mode === 'login' && (
                <div style={{ textAlign: 'right', marginBottom: 20 }}>
                  <button onClick={() => { setResetMode(true); setError(''); setResetEmail(email); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563EB', fontFamily: FONT, fontSize: 12, fontWeight: 600 }}>
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}

              {mode === 'register' && (
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20, cursor: 'pointer' }}>
                  <input type="checkbox" checked={acceptTerms} onChange={e => setAccept(e.target.checked)}
                    style={{ marginTop: 3, width: 16, height: 16, cursor: 'pointer', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>
                    Acepto los{' '}
                    <button onClick={e => { e.preventDefault(); setShowTerms(true); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563EB', fontWeight: 700, fontFamily: FONT, fontSize: 12, padding: 0 }}>
                      Términos y Condiciones
                    </button>{' '}y la Política de Privacidad de Flow.
                  </span>
                </label>
              )}

              <Err />

              <button onClick={handleSubmit} disabled={loading}
                style={{ width: '100%', padding: 14, background: loading ? '#93C5FD' : '#2563EB', color: 'white', border: 'none', borderRadius: 12, fontFamily: FONT, fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 18, letterSpacing: -0.2 }}>
                {loading ? 'Cargando...' : mode === 'login' ? 'Ingresar' : 'Crear cuenta gratis'}
              </button>

              <div style={{ textAlign: 'center', fontSize: 13, color: '#9CA3AF' }}>
                {mode === 'login' ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}{' '}
                <button onClick={switchMode} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563EB', fontWeight: 700, fontFamily: FONT, fontSize: 13, padding: 0 }}>
                  {mode === 'login' ? 'Registrarte' : 'Iniciá sesión'}
                </button>
              </div>

              {mode === 'register' && (
                <div style={{ marginTop: 24, padding: '14px 16px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, fontSize: 12, color: '#15803D', lineHeight: 1.7 }}>
                  ✅ <strong>30 días gratis</strong> sin tarjeta.<br />
                  Luego, precio especial los primeros 6 meses.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

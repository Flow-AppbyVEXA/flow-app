import { useState } from 'react'
import { useAuth } from './AuthContext.jsx'

const FONT = "'Inter', system-ui, sans-serif"

const TCS = `TÉRMINOS Y CONDICIONES DE USO — FLOW
Desarrollado por VEXA Software · Argentina

1. DESCRIPCIÓN DEL SERVICIO
Flow es una aplicación web de gestión comercial para quioscos, desarrollada y operada por VEXA Software. Permite registrar ventas, productos, proveedores, caja y reportes de manera digital.

2. REGISTRO Y CUENTA
Al registrarte, sos responsable de mantener la confidencialidad de tu contraseña. Tu cuenta es personal e intransferible.

3. SUSCRIPCIÓN Y PAGOS
El servicio incluye 30 días de prueba gratuita. Luego requiere una suscripción mensual abonada a través de Mercado Pago. Podés cancelar en cualquier momento desde Ajustes → Información de cuenta.

4. PRIVACIDAD Y DATOS
Tus datos comerciales se almacenan de forma segura en Google Firebase. No compartimos tu información con terceros salvo Mercado Pago para el procesamiento de pagos.

5. PROPIEDAD INTELECTUAL
Todo el software, diseño e interfaz de Flow es propiedad de VEXA Software. Queda prohibida su reproducción sin autorización.

6. LIMITACIÓN DE RESPONSABILIDAD
Flow es una herramienta de gestión. VEXA Software no se responsabiliza por decisiones comerciales tomadas con base en los datos registrados.

7. JURISDICCIÓN
Estos términos se rigen por las leyes de la República Argentina.

8. CONTACTO
vexaflowcore@gmail.com | WhatsApp: +54 344 463 5779`

// ── Definidos FUERA de Login para evitar re-mount al escribir ─────────────────
const EyeIcon = ({ show }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {show
      ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
    }
  </svg>
)

function FInput({ type, placeholder, value, onChange }) {
  const [focused, setFocused] = useState(false)
  const [showPw, setShowPw]   = useState(false)
  const isPw    = type === 'password'
  const inputType = isPw ? (showPw ? 'text' : 'password') : (type || 'text')

  return (
    <div style={{ position: 'relative' }}>
      <input
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          fontFamily: FONT, width: '100%',
          padding: isPw ? '10px 42px 10px 14px' : '10px 14px',
          border: `1px solid ${focused ? '#2563EB' : '#E4E4E7'}`,
          boxShadow: focused ? '0 0 0 3px #EFF6FF' : 'none',
          borderRadius: 8, fontSize: 14, outline: 'none',
          boxSizing: 'border-box', transition: 'border 0.15s, box-shadow 0.15s',
          background: 'white', color: '#09090B', minHeight: 44,
        }}
      />
      {isPw && (
        <button type="button" onClick={() => setShowPw(v => !v)}
          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#A1A1AA', display: 'flex', padding: 0 }}>
          <EyeIcon show={showPw} />
        </button>
      )}
    </div>
  )
}

function TermsModal({ onClose }) {
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'white', borderRadius:14, border:'1px solid #E4E4E7', maxWidth:520, width:'100%', maxHeight:'80vh', display:'flex', flexDirection:'column', boxShadow:'0 20px 48px rgba(9,9,11,0.12)' }}>
        <div style={{ padding:'18px 22px', borderBottom:'1px solid #F4F4F5', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontFamily:FONT, fontWeight:600, fontSize:15, color:'#09090B' }}>Términos y Condiciones</span>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', fontSize:18, color:'#A1A1AA' }}>✕</button>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'18px 22px' }}>
          <pre style={{ fontFamily:FONT, fontSize:12, color:'#52525B', lineHeight:1.7, whiteSpace:'pre-wrap', margin:0 }}>{TCS}</pre>
        </div>
        <div style={{ padding:'14px 22px', borderTop:'1px solid #F4F4F5' }}>
          <button onClick={onClose} style={{ width:'100%', background:'#2563EB', color:'white', border:'none', borderRadius:8, padding:'11px', fontFamily:FONT, fontWeight:500, fontSize:13, cursor:'pointer' }}>Entendido</button>
        </div>
      </div>
    </div>
  )
}

const FieldLabel = ({ children }) => (
  <div style={{ fontSize:10, fontWeight:600, color:'#A1A1AA', letterSpacing:0.6, textTransform:'uppercase', marginBottom:6, fontFamily:FONT }}>{children}</div>
)

const ErrBox = ({ msg }) => msg ? (
  <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:8, padding:'10px 14px', marginBottom:14, fontSize:13, color:'#B91C1C', fontWeight:500, fontFamily:FONT }}>{msg}</div>
) : null

// ── LOGIN COMPONENT ──────────────────────────────────────────────────────────
export default function Login() {
  const [mode, setMode]             = useState('login')
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [businessName, setBusiness] = useState('')
  const [acceptTerms, setAccept]    = useState(false)
  const [showTerms, setShowTerms]   = useState(false)
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)
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

  const goToReset = () => { setResetMode(true); setError(''); if (email) setResetEmail(email) }
  const backFromReset = () => { setResetMode(false); setResetSent(false); setError(''); setResetEmail('') }

  return (
    <>
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        @media (max-width: 640px) { .login-left { display: none !important; } .login-right { width: 100% !important; padding: 40px 28px !important; } }
      `}</style>

      <div style={{ minHeight:'100vh', display:'flex', fontFamily:FONT, background:'#FAFAFA' }}>

        {/* LEFT */}
        <div className="login-left" style={{ flex:1, background:'#09090B', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 48px' }}>
          <div style={{ maxWidth:320, width:'100%' }}>
            <div style={{ fontSize:26, fontWeight:700, color:'white', letterSpacing:-0.5, marginBottom:6 }}>Flow</div>
            <div style={{ fontSize:11, fontWeight:600, color:'#52525B', letterSpacing:2, textTransform:'uppercase', marginBottom:48 }}>Gestión Comercial Inteligente</div>
            {[
              ['Lector de ventas',      'Vendé rápido con código de barras o nombre'],
              ['Control de stock',      'Inventario en tiempo real con alertas automáticas'],
              ['Reportes inteligentes', 'Métricas de ventas, rotación y rentabilidad'],
              ['Control de vencimientos','Alertas por color antes de que venzan los productos'],
            ].map(([title, desc]) => (
              <div key={title} style={{ display:'flex', gap:12, marginBottom:24 }}>
                <div style={{ width:4, height:4, borderRadius:'50%', background:'#3F3F46', marginTop:6, flexShrink:0 }} />
                <div>
                  <div style={{ fontWeight:600, fontSize:13, color:'white', marginBottom:3 }}>{title}</div>
                  <div style={{ fontSize:12, color:'#52525B', lineHeight:1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
            <div style={{ marginTop:48, fontSize:10, color:'#27272A' }}>© Powered by VEXA 2026</div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="login-right" style={{ width:460, background:'white', display:'flex', alignItems:'center', justifyContent:'center', padding:'56px 44px', borderLeft:'1px solid #E4E4E7' }}>
          <div style={{ width:'100%', maxWidth:340 }}>

            {/* ── RESET MODE ── */}
            {resetMode ? (
              <div>
                <button onClick={backFromReset} style={{ background:'none', border:'none', cursor:'pointer', color:'#2563EB', fontFamily:FONT, fontSize:12, fontWeight:500, padding:0, marginBottom:28 }}>
                  ← Volver al inicio de sesión
                </button>
                <div style={{ fontSize:20, fontWeight:700, color:'#09090B', letterSpacing:-0.4, marginBottom:6 }}>Recuperar contraseña</div>
                {!resetSent ? (
                  <>
                    <div style={{ fontSize:13, color:'#71717A', marginBottom:24 }}>Te enviamos un link para restablecer tu contraseña.</div>
                    <div style={{ marginBottom:16 }}>
                      <FieldLabel>Email de tu cuenta</FieldLabel>
                      <FInput type="email" placeholder="tu@email.com" value={resetEmail} onChange={e => setResetEmail(e.target.value)} />
                    </div>
                    <ErrBox msg={error} />
                    <button onClick={handleReset} disabled={resetLoading}
                      style={{ width:'100%', padding:'11px', background: resetLoading ? '#93C5FD' : '#2563EB', color:'white', border:'none', borderRadius:8, fontFamily:FONT, fontWeight:500, fontSize:13, cursor:'pointer', marginTop:4 }}>
                      {resetLoading ? 'Enviando...' : 'Enviar link de recuperación'}
                    </button>
                  </>
                ) : (
                  <div style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:12, padding:'22px 18px', textAlign:'center' }}>
                    <div style={{ fontSize:28, marginBottom:10 }}>📧</div>
                    <div style={{ fontWeight:600, fontSize:14, color:'#09090B', marginBottom:8 }}>¡Revisá tu email!</div>
                    <div style={{ fontSize:12, color:'#52525B', lineHeight:1.6 }}>
                      Enviamos el link a <strong>{resetEmail}</strong>.<br/>Revisá también la carpeta de spam.
                    </div>
                  </div>
                )}
              </div>

            ) : (
              /* ── LOGIN / REGISTER MODE ── */
              <div>
                <div style={{ marginBottom:28 }}>
                  <div style={{ fontSize:20, fontWeight:700, color:'#09090B', letterSpacing:-0.4, marginBottom:6 }}>
                    {mode === 'login' ? 'Bienvenido de nuevo' : 'Crear cuenta'}
                  </div>
                  <div style={{ fontSize:13, color:'#71717A' }}>
                    {mode === 'login' ? 'Ingresá con tu cuenta de Flow' : '30 días gratis · Sin tarjeta requerida'}
                  </div>
                </div>

                {mode === 'register' && (
                  <div style={{ marginBottom:14 }}>
                    <FieldLabel>Nombre del negocio</FieldLabel>
                    <FInput placeholder="Ej: Kiosco San Martín" value={businessName} onChange={e => setBusiness(e.target.value)} />
                  </div>
                )}

                <div style={{ marginBottom:14 }}>
                  <FieldLabel>Email</FieldLabel>
                  <FInput type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>

                <div style={{ marginBottom: mode === 'register' ? 14 : 8 }}>
                  <FieldLabel>Contraseña</FieldLabel>
                  <FInput type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                  {mode === 'register' && <div style={{ fontSize:11, color:'#A1A1AA', marginTop:5, fontFamily:FONT }}>Mínimo 6 caracteres</div>}
                </div>

                {mode === 'login' && (
                  <div style={{ textAlign:'right', marginBottom:18 }}>
                    <button onClick={goToReset} style={{ background:'none', border:'none', cursor:'pointer', color:'#2563EB', fontFamily:FONT, fontSize:12, fontWeight:500, padding:0 }}>
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                )}

                {mode === 'register' && (
                  <label style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:18, cursor:'pointer' }}>
                    <input type="checkbox" checked={acceptTerms} onChange={e => setAccept(e.target.checked)} style={{ marginTop:3, width:15, height:15, cursor:'pointer', flexShrink:0 }} />
                    <span style={{ fontSize:12, color:'#71717A', lineHeight:1.5, fontFamily:FONT }}>
                      Acepto los{' '}
                      <button onClick={e => { e.preventDefault(); setShowTerms(true) }}
                        style={{ background:'none', border:'none', cursor:'pointer', color:'#2563EB', fontWeight:600, fontFamily:FONT, fontSize:12, padding:0 }}>
                        Términos y Condiciones
                      </button>
                      {' '}y la Política de Privacidad.
                    </span>
                  </label>
                )}

                <ErrBox msg={error} />

                <button onClick={handleSubmit} disabled={loading}
                  style={{ width:'100%', padding:'11px', background: loading ? '#93C5FD' : '#2563EB', color:'white', border:'none', borderRadius:8, fontFamily:FONT, fontWeight:500, fontSize:13, cursor: loading ? 'not-allowed' : 'pointer', marginBottom:16 }}>
                  {loading ? 'Cargando...' : mode === 'login' ? 'Ingresar' : 'Crear cuenta gratis'}
                </button>

                <div style={{ textAlign:'center', fontSize:13, color:'#71717A', fontFamily:FONT }}>
                  {mode === 'login' ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}{' '}
                  <button onClick={switchMode} style={{ background:'none', border:'none', cursor:'pointer', color:'#2563EB', fontWeight:600, fontFamily:FONT, fontSize:13, padding:0 }}>
                    {mode === 'login' ? 'Registrarte' : 'Iniciá sesión'}
                  </button>
                </div>

                {mode === 'register' && (
                  <div style={{ marginTop:22, padding:'14px 16px', background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:10, fontSize:12, color:'#15803D', lineHeight:1.7, fontFamily:FONT }}>
                    ✅ <strong>30 días gratis</strong> sin tarjeta.<br/>
                    Luego, precio especial los primeros 6 meses.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

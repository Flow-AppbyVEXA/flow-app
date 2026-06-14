import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useAuth } from './src/AuthContext.jsx';
import { db } from './src/firebase.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// ── FONTS & RESET ─────────────────────────────────────────────────────────────
const GS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Mono:wght@400;500&family=Heebo:wght@900&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 3px; }
    input[type=number] { -moz-appearance: textfield; }
    input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; }
    .tr-h:hover > td { background: #F8FAFC !important; }
  `}</style>
);

// ── UTILS ─────────────────────────────────────────────────────────────────────
const fmt = n => "$" + Number(n || 0).toLocaleString("es-AR");
const todayStr = () => new Date().toISOString().slice(0, 10);
const nowStr = () => new Date().toTimeString().slice(0, 5);
const daysUntil = d => Math.ceil((new Date(d).setHours(23, 59, 59) - Date.now()) / 86400000);
const rel = days => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
const T = todayStr();
const Y = rel(-1);
const FONT = "'DM Sans', system-ui, sans-serif";
const MONO = "'DM Mono', monospace";
const HEEBO = "'Heebo', sans-serif";
const LOGO_B64 = "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";

// ── INITIAL STATE ─────────────────────────────────────────────────────────────
const INIT = {
  business: { name: "Mi Quiosco", sidebarColor: "#0f1923", accentColor: "#2563EB" },
  products: [
    { id: 1, name: "Coca Cola 500ml",    barcode: "7790001234", cost: 450, price: 750, stock: 24, providerId: 1, expDate: rel(5)  },
    { id: 2, name: "Alfajor Havanna",    barcode: "7790005678", cost: 320, price: 550, stock: 12, providerId: 2, expDate: rel(18) },
    { id: 3, name: "Sprite 500ml",       barcode: "7790009012", cost: 420, price: 700, stock: 0,  providerId: 1, expDate: rel(60) },
    { id: 4, name: "Chicles Beldent",    barcode: "7790003456", cost: 180, price: 350, stock: 40, providerId: 2, expDate: rel(90) },
    { id: 5, name: "Agua Villavicencio", barcode: "7790007890", cost: 200, price: 380, stock: 30, providerId: 1, expDate: rel(25) },
  ],
  providers: [
    { id: 1, name: "Distribuidora Norte", whatsapp: "1155667788" },
    { id: 2, name: "Accord",              whatsapp: "1144556677" },
  ],
  sales: [
    { id: 1, date: T, time: "09:30", items: [{ productId: 1, name: "Coca Cola 500ml", qty: 2, price: 750, cost: 450 }], total: 1500, cost: 900,  benefit: 600, discount: 0, cashierId: 1 },
    { id: 2, date: T, time: "10:15", items: [{ productId: 2, name: "Alfajor Havanna", qty: 3, price: 550, cost: 320 }, { productId: 4, name: "Chicles Beldent", qty: 1, price: 350, cost: 180 }], total: 2000, cost: 1140, benefit: 860, discount: 0, cashierId: 2 },
    { id: 3, date: Y, time: "11:00", items: [{ productId: 5, name: "Agua Villavicencio", qty: 4, price: 380, cost: 200 }], total: 1520, cost: 800,  benefit: 720, discount: 0, cashierId: 1 },
  ],
  registers: [
    { id: 1, date: T, openTime: "08:00", closeTime: null,    amount: 5000, status: "open"   },
    { id: 2, date: Y, openTime: "09:15", closeTime: "21:00", amount: 3000, status: "closed" },
  ],
  cashiers: [{ id: 1, name: "Juan", hours: 40 }, { id: 2, name: "María", hours: 25 }],
  nid: { product: 6, provider: 3, sale: 4, register: 3, cashier: 3 },
};

const NAVS = [
  { id: "lector",      icon: "📖", label: "Lector" },
  { id: "caja",        icon: "💰", label: "Caja" },
  { id: "productos",   icon: "📦", label: "Productos" },
  { id: "proveedores", icon: "🚚", label: "Proveedores" },
  { id: "vencimientos",icon: "⏰", label: "Vencimientos" },
  { id: "reportes",    icon: "📊", label: "Reportes" },
  { id: "cajeros",     icon: "👤", label: "Cajeros" },
  { id: "etiquetas",   icon: "🏷️", label: "Etiquetas" },
  { id: "ajustes",     icon: "⚙️", label: "Soporte y Ajustes" },
];

// ── SVG ICONS ─────────────────────────────────────────────────────────────────
function NavIcon({ id }) {
  const s = { width: 16, height: 16, stroke: "currentColor", fill: "none", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", flexShrink: 0 };
  if (id === "lector")       return <svg {...s} viewBox="0 0 24 24"><line x1="3" y1="5" x2="3" y2="19"/><line x1="7" y1="3" x2="7" y2="21"/><line x1="11" y1="5" x2="11" y2="19"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="19" y1="5" x2="19" y2="19"/></svg>;
  if (id === "caja")         return <svg {...s} viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>;
  if (id === "productos")    return <svg {...s} viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
  if (id === "proveedores")  return <svg {...s} viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
  if (id === "vencimientos") return <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
  if (id === "reportes")     return <svg {...s} viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
  if (id === "cajeros")      return <svg {...s} viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
  if (id === "etiquetas")    return <svg {...s} viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
  if (id === "ajustes")      return <svg {...s} viewBox="0 0 24 24"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>;
  return null;
}

const FilterIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);

// ── SHARED TOKENS ─────────────────────────────────────────────────────────────
const sx = {
  page:  { padding: "32px 36px", maxWidth: 900, margin: "0 auto", fontFamily: FONT },
  label: { fontSize: 11, fontWeight: 600, color: "#9CA3AF", letterSpacing: 0.5, textTransform: "uppercase" },
  title: { fontSize: 21, fontWeight: 800, color: "#0F172A", letterSpacing: -0.5 },
  card:  { background: "white", borderRadius: 16, border: "1px solid #EAEAEA", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" },
};

// ── SHARED COMPONENTS ─────────────────────────────────────────────────────────
const Card = ({ children, style }) => <div style={{ ...sx.card, ...style }}>{children}</div>;

const Overlay = ({ children, onClose }) => (
  <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(10,20,30,0.52)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16, backdropFilter: "blur(3px)" }}>
    <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 20, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", width: "100%", maxWidth: 440, maxHeight: "92vh", overflowY: "auto" }}>
      {children}
    </div>
  </div>
);

function PBtn({ children, onClick, accent = "#2563EB", style = {}, ...p }) {
  return <button onClick={onClick} style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, border: "none", cursor: "pointer", borderRadius: 10, padding: "10px 20px", background: accent, color: "white", letterSpacing: -0.1, ...style }} {...p}>{children}</button>;
}
function SBtn({ children, onClick, style = {} }) {
  return <button onClick={onClick} style={{ fontFamily: FONT, fontWeight: 500, fontSize: 13, cursor: "pointer", borderRadius: 10, padding: "10px 20px", background: "transparent", color: "#6B7280", border: "1px solid #E5E7EB", letterSpacing: -0.1, ...style }}>{children}</button>;
}
function GBtn({ children, onClick, accent = "#2563EB", style = {} }) {
  return <button onClick={onClick} style={{ fontFamily: FONT, fontWeight: 600, fontSize: 12, cursor: "pointer", background: "transparent", border: "none", color: accent, ...style }}>{children}</button>;
}

function TInput({ style = {}, ...p }) {
  const [f, setF] = useState(false);
  return <input onFocus={() => setF(true)} onBlur={() => setF(false)} style={{ fontFamily: FONT, fontSize: 13, border: `1.5px solid ${f ? "#2563EB" : "#E5E7EB"}`, borderRadius: 10, padding: "10px 14px", outline: "none", width: "100%", background: "white", transition: "border 0.15s", ...style }} {...p} />;
}
function SelInput({ children, style = {}, ...p }) {
  return <select style={{ fontFamily: FONT, fontSize: 13, border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "10px 14px", outline: "none", width: "100%", background: "white", color: "#374151", ...style }} {...p}>{children}</select>;
}

const Badge = ({ children, color = "blue" }) => {
  const c = { blue: ["#EFF6FF","#1D4ED8"], green: ["#F0FDF4","#15803D"], red: ["#FEF2F2","#DC2626"], yellow: ["#FEFCE8","#A16207"], gray: ["#F9FAFB","#6B7280"] }[color] || ["#EFF6FF","#1D4ED8"];
  return <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: c[0], color: c[1], letterSpacing: 0.2 }}>{children}</span>;
};

const TH = ({ children }) => <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#9CA3AF", letterSpacing: 0.5, textTransform: "uppercase", background: "#F9FAFB", borderBottom: "1px solid #F0F0F0" }}>{children}</th>;
const TD = ({ children, style = {} }) => <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151", borderBottom: "1px solid #F9FAFB", ...style }}>{children}</td>;

const StatCard = ({ label, value, sub }) => (
  <Card style={{ padding: "20px 22px" }}>
    <div style={{ ...sx.label, marginBottom: 6 }}>{label}</div>
    <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color: "#0F172A", letterSpacing: -0.5 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>{sub}</div>}
  </Card>
);

const PH = ({ icon, title, action }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
    <h1 style={{ ...sx.title, display: "flex", alignItems: "center", gap: 10 }}><span>{icon}</span><span>{title}</span></h1>
    {action}
  </div>
);

// ════════════════════════════════════════════════════════════════════════════════
// LECTOR
// ════════════════════════════════════════════════════════════════════════════════
function Lector({ state, setState }) {
  const [query, setQuery]       = useState("");
  const [cart, setCart]         = useState([]);
  const [totalDisc, setTotalDisc] = useState(0);
  const [confirm, setConfirm]   = useState(false);
  const [toast, setToast]       = useState(false);
  const accent = state.business.accentColor;

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return state.products.filter(p => p.stock > 0 && (p.name.toLowerCase().includes(q) || p.barcode.includes(q)));
  }, [query, state.products]);

  const addToCart = p => {
    setCart(prev => {
      const ex = prev.find(i => i.productId === p.id);
      return ex
        ? prev.map(i => i.productId === p.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { productId: p.id, name: p.name, price: p.price, cost: p.cost, qty: 1, disc: 0 }];
    });
    setQuery("");
  };

  const itemsDisc = cart.reduce((s, i) => s + i.disc * i.qty, 0);
  const subtotal  = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const total     = Math.max(0, subtotal - itemsDisc - totalDisc);
  const totalCost = cart.reduce((s, i) => s + i.cost * i.qty, 0);

  const doSale = () => {
    const sale = {
      id: state.nid.sale, date: T, time: nowStr(),
      items: cart.map(i => ({ productId: i.productId, name: i.name, qty: i.qty, price: i.price, cost: i.cost })),
      total, cost: totalCost, benefit: total - totalCost,
      discount: itemsDisc + totalDisc, cashierId: state.cashiers[0]?.id || 1,
    };
    setState(prev => ({
      ...prev,
      sales: [...prev.sales, sale],
      nid: { ...prev.nid, sale: prev.nid.sale + 1 },
      products: prev.products.map(p => {
        const item = cart.find(i => i.productId === p.id);
        return item ? { ...p, stock: Math.max(0, p.stock - item.qty) } : p;
      }),
    }));
    setCart([]); setTotalDisc(0); setConfirm(false);
    setToast(true); setTimeout(() => setToast(false), 2500);
  };

  return (
    <div style={sx.page}>
      <PH icon="📖" title="Lector — Punto de Venta" />

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20 }}>
        <TInput type="text" placeholder="Buscar producto por nombre o código de barras…" value={query} onChange={e => setQuery(e.target.value)} style={{ fontSize: 15, padding: "14px 18px" }} />
        {results.length > 0 && (
          <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "white", border: "1px solid #E5E7EB", borderRadius: 14, marginTop: 4, boxShadow: "0 8px 28px rgba(0,0,0,0.10)", zIndex: 20, overflow: "hidden" }}>
            {results.map(p => (
              <div key={p.id} onClick={() => addToCart(p)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 18px", cursor: "pointer", borderBottom: "1px solid #F9FAFB", fontFamily: FONT }}
                onMouseEnter={e => e.currentTarget.style.background = "#EFF6FF"}
                onMouseLeave={e => e.currentTarget.style.background = "white"}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#0F172A" }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{p.barcode} · Stock: {p.stock}</div>
                </div>
                <div style={{ fontFamily: MONO, fontWeight: 700, color: accent, fontSize: 16 }}>{fmt(p.price)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {cart.length > 0 ? (
        <Card>
          <div style={{ padding: "13px 20px", borderBottom: "1px solid #F0F0F0" }}>
            <span style={{ fontWeight: 600, fontSize: 13, color: "#374151" }}>Productos en la venta</span>
          </div>
          {cart.map(item => (
            <div key={item.productId} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 20px", borderBottom: "1px solid #F9FAFB" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#0F172A" }}>{item.name}</div>
                <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{fmt(item.price)} c/u</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <button onClick={() => setCart(p => p.map(i => i.productId === item.productId ? { ...i, qty: Math.max(1, i.qty - 1) } : i))} style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid #E5E7EB", background: "white", cursor: "pointer", fontWeight: 700, fontSize: 16, color: "#374151", lineHeight: 1 }}>−</button>
                <span style={{ fontFamily: MONO, fontWeight: 600, fontSize: 14, width: 28, textAlign: "center" }}>{item.qty}</span>
                <button onClick={() => setCart(p => p.map(i => i.productId === item.productId ? { ...i, qty: i.qty + 1 } : i))} style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid #E5E7EB", background: "white", cursor: "pointer", fontWeight: 700, fontSize: 16, color: "#374151", lineHeight: 1 }}>+</button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11, color: "#9CA3AF" }}>−$</span>
                <input type="number" min="0" value={item.disc} onChange={e => setCart(p => p.map(i => i.productId === item.productId ? { ...i, disc: Number(e.target.value) } : i))}
                  style={{ fontFamily: MONO, width: 72, padding: "6px 10px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, textAlign: "center", outline: "none" }} />
              </div>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, color: "#0F172A", width: 90, textAlign: "right" }}>{fmt((item.price - item.disc) * item.qty)}</div>
              <button onClick={() => setCart(p => p.filter(i => i.productId !== item.productId))}
                style={{ color: "#D1D5DB", background: "none", border: "none", cursor: "pointer", fontSize: 20, lineHeight: 1, marginLeft: 2 }}
                onMouseEnter={e => e.target.style.color = "#EF4444"}
                onMouseLeave={e => e.target.style.color = "#D1D5DB"}>✕</button>
            </div>
          ))}
          <div style={{ padding: "18px 20px", background: "#FAFAFA" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 13, color: "#6B7280" }}>Descuento sobre total:</span>
              <input type="number" min="0" value={totalDisc} onChange={e => setTotalDisc(Number(e.target.value))}
                style={{ fontFamily: MONO, width: 100, padding: "7px 12px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, textAlign: "center", outline: "none" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#0F172A" }}>TOTAL</span>
              <span style={{ fontFamily: MONO, fontSize: 26, fontWeight: 800, color: accent }}>{fmt(total)}</span>
            </div>
            <PBtn onClick={() => setConfirm(true)} accent={accent} style={{ width: "100%", padding: "14px", fontSize: 14 }}>Confirmar venta</PBtn>
          </div>
        </Card>
      ) : (
        <div style={{ textAlign: "center", padding: "88px 0", color: "#D1D5DB" }}>
          <div style={{ fontSize: 56, marginBottom: 14 }}>🛒</div>
          <div style={{ fontSize: 14, fontFamily: FONT }}>Buscá un producto para comenzar la venta</div>
        </div>
      )}

      {confirm && (
        <Overlay onClose={() => setConfirm(false)}>
          <div style={{ padding: 44, textAlign: "center" }}>
            <div style={{ fontSize: 46, marginBottom: 14 }}>💳</div>
            <h3 style={{ fontFamily: FONT, fontSize: 19, fontWeight: 800, color: "#0F172A", marginBottom: 8 }}>¿Confirmar venta?</h3>
            <p style={{ fontFamily: FONT, fontSize: 14, color: "#6B7280", marginBottom: 30 }}>
              Total: <span style={{ fontFamily: MONO, fontWeight: 800, color: accent, fontSize: 20 }}>{fmt(total)}</span>
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <SBtn onClick={() => setConfirm(false)} style={{ flex: 1, padding: "12px" }}>Cancelar</SBtn>
              <PBtn onClick={doSale} accent={accent} style={{ flex: 1, padding: "12px" }}>Confirmar</PBtn>
            </div>
          </div>
        </Overlay>
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: 28, right: 28, background: "#10B981", color: "white", padding: "13px 24px", borderRadius: 14, fontFamily: FONT, fontWeight: 600, fontSize: 13, boxShadow: "0 8px 28px rgba(16,185,129,0.35)", zIndex: 200 }}>
          ✅ Venta registrada correctamente
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// CAJA
// ════════════════════════════════════════════════════════════════════════════════
function Caja({ state, setState }) {
  const [openAmt, setOpenAmt]   = useState("");
  const [histOpen, setHistOpen] = useState(false);
  const accent = state.business.accentColor;

  const todayReg   = state.registers.find(r => r.date === T && r.status === "open");
  const todaySales = state.sales.filter(s => s.date === T);
  const total      = todaySales.reduce((s, v) => s + v.total, 0);
  const cost       = todaySales.reduce((s, v) => s + v.cost, 0);
  const benefit    = todaySales.reduce((s, v) => s + v.benefit, 0);

  const openReg = () => {
    if (Number(openAmt) < 1) return;
    setState(p => ({
      ...p,
      registers: [...p.registers, { id: p.nid.register, date: T, openTime: nowStr(), closeTime: null, amount: Number(openAmt), status: "open" }],
      nid: { ...p.nid, register: p.nid.register + 1 },
    }));
    setOpenAmt("");
  };

  const toggleReg = (id, action) => {
    setState(p => ({
      ...p,
      registers: p.registers.map(r => r.id === id
        ? action === "close" ? { ...r, status: "closed", closeTime: nowStr() } : { ...r, status: "open", closeTime: null }
        : r),
    }));
  };

  return (
    <div style={sx.page}>
      <PH icon="💰" title="Caja" />

      {!todayReg ? (
        <Card style={{ padding: "56px 40px", textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🔓</div>
          <div style={{ fontWeight: 800, fontSize: 18, color: "#0F172A", marginBottom: 8 }}>Abrir caja del día</div>
          <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 32 }}>Ingresá el monto inicial para comenzar</div>
          <div style={{ display: "flex", gap: 10, maxWidth: 300, margin: "0 auto" }}>
            <TInput type="number" min="1" value={openAmt} onChange={e => setOpenAmt(e.target.value)} placeholder="Monto inicial ($)" style={{ textAlign: "center", fontFamily: MONO }} />
            <PBtn onClick={openReg} accent={accent} style={{ whiteSpace: "nowrap", padding: "10px 22px" }}>Abrir</PBtn>
          </div>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div style={{ gridColumn: "1/-1", background: accent, borderRadius: 18, padding: "28px 30px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.55)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>Total del día</div>
            <div style={{ fontFamily: MONO, fontSize: 42, fontWeight: 800, color: "white", marginBottom: 24, letterSpacing: -1 }}>{fmt(total)}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {[["Ventas", todaySales.length], ["Costos", fmt(cost)], ["Beneficio", fmt(benefit)]].map(([l, v]) => (
                <div key={l} style={{ background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.55)", marginBottom: 4 }}>{l}</div>
                  <div style={{ fontFamily: MONO, fontWeight: 700, color: "white", fontSize: 15 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <StatCard label="Apertura" value={todayReg.openTime} />
          <StatCard label="Monto inicial" value={fmt(todayReg.amount)} />
          <div style={{ gridColumn: "1/-1" }}>
            <button onClick={() => toggleReg(todayReg.id, "close")}
              style={{ width: "100%", padding: "13px", borderRadius: 14, border: "1.5px solid #FECACA", background: "#FEF2F2", color: "#DC2626", fontFamily: FONT, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              Cerrar caja
            </button>
          </div>
        </div>
      )}

      <Card>
        <button onClick={() => setHistOpen(!histOpen)}
          style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", background: "none", border: "none", cursor: "pointer", fontFamily: FONT }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Historial de cajas</span>
          <span style={{ fontSize: 11, color: "#9CA3AF" }}>{histOpen ? "▲" : "▼"}</span>
        </button>
        {histOpen && (
          <div style={{ borderTop: "1px solid #F0F0F0" }}>
            {[...state.registers].reverse().map(r => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 20px", borderBottom: "1px solid #F9FAFB" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#0F172A" }}>{r.date}</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{r.openTime} — {r.closeTime || "Abierta"}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <Badge color={r.status === "open" ? "green" : "gray"}>{r.status === "open" ? "Abierta" : "Cerrada"}</Badge>
                  <GBtn accent={accent} onClick={() => toggleReg(r.id, r.status === "open" ? "close" : "open")}>
                    {r.status === "open" ? "Cerrar" : "Reabrir"}
                  </GBtn>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// PRODUCTOS
// ════════════════════════════════════════════════════════════════════════════════
function Productos({ state, setState }) {
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const emptyF = () => ({ name: "", barcode: "", cost: "", price: "", stock: "", providerId: "", expDate: "" });
  const [form, setForm]   = useState(emptyF());
  const [multi, setMulti] = useState([emptyF()]);
  const [view, setView]   = useState(null);
  const accent = state.business.accentColor;
  const margin = (c, p) => p > 0 ? Math.round(((p - c) / p) * 100) : 0;

  const filtered = useMemo(() => {
    if (!query.trim()) return state.products;
    const q = query.toLowerCase();
    return state.products.filter(p => p.name.toLowerCase().includes(q) || p.barcode.includes(q));
  }, [query, state.products]);

  const mkP = (f, id) => ({ id, name: f.name, barcode: f.barcode, cost: +f.cost || 0, price: +f.price || 0, stock: +f.stock || 0, providerId: +f.providerId || null, expDate: f.expDate });

  const addOne = () => {
    if (!form.name) return;
    setState(p => ({ ...p, products: [...p.products, mkP(form, p.nid.product)], nid: { ...p.nid, product: p.nid.product + 1 } }));
    setForm(emptyF()); setModal(null);
  };

  const addMany = () => {
    const valids = multi.filter(f => f.name);
    if (!valids.length) return;
    let nid = state.nid.product;
    const newProds = valids.map(f => mkP(f, nid++));
    setState(p => ({ ...p, products: [...p.products, ...newProds], nid: { ...p.nid, product: nid } }));
    setMulti([emptyF()]); setModal(null);
  };

  const PF = ({ data, onChange }) => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      <TInput placeholder="Nombre" value={data.name} onChange={e => onChange("name", e.target.value)} style={{ gridColumn: "1/-1" }} />
      <TInput placeholder="Código de barras" value={data.barcode} onChange={e => onChange("barcode", e.target.value)} />
      <TInput type="number" placeholder="Stock inicial" value={data.stock} onChange={e => onChange("stock", e.target.value)} />
      <div>
        <TInput type="number" placeholder="Costo ($)" value={data.cost} onChange={e => onChange("cost", e.target.value)} />
      </div>
      <div>
        <TInput type="number" placeholder="Precio ($)" value={data.price} onChange={e => onChange("price", e.target.value)} />
        {data.cost && data.price && +data.price > 0 && (
          <div style={{ fontSize: 11, color: "#10B981", marginTop: 5, fontWeight: 700 }}>Margen: {margin(+data.cost, +data.price)}%</div>
        )}
      </div>
      <SelInput value={data.providerId} onChange={e => onChange("providerId", e.target.value)}>
        <option value="">Sin proveedor</option>
        {state.providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </SelInput>
      <TInput type="date" value={data.expDate} onChange={e => onChange("expDate", e.target.value)} />
    </div>
  );

  if (view) {
    const prov = state.providers.find(p => p.id === view.providerId);
    return (
      <div style={sx.page}>
        <GBtn accent={accent} onClick={() => setView(null)}>← Volver</GBtn>
        <div style={{ marginTop: 22 }}>
          <Card style={{ padding: "28px 30px" }}>
            <div style={{ fontWeight: 800, fontSize: 20, color: "#0F172A", letterSpacing: -0.5 }}>{view.name}</div>
            <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4, marginBottom: 26 }}>#{view.id} · {view.barcode}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {[["Costo", fmt(view.cost)], ["Precio", fmt(view.price)], ["Margen", margin(view.cost, view.price) + "%"], ["Stock", view.stock + " ud."], ["Proveedor", prov?.name || "—"], ["Vencimiento", view.expDate || "—"]].map(([l, v]) => (
                <div key={l} style={{ background: "#F9FAFB", borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ ...sx.label, marginBottom: 6 }}>{l}</div>
                  <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 15, color: "#0F172A" }}>{v}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div style={sx.page}>
      <PH icon="📦" title="Productos" action={
        <div style={{ display: "flex", gap: 8 }}>
          <PBtn accent={accent} onClick={() => setModal("single")}>+ Cargar uno</PBtn>
          <SBtn onClick={() => setModal("multi")}>+ Cargar varios</SBtn>
        </div>
      } />
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <Card style={{ padding: "9px 16px", fontSize: 13, fontFamily: FONT }}>Total: <strong style={{ color: "#0F172A" }}>{state.products.length}</strong></Card>
        <Card style={{ padding: "9px 16px", fontSize: 13, fontFamily: FONT }}>Sin stock: <strong style={{ color: "#DC2626" }}>{state.products.filter(p => p.stock === 0).length}</strong></Card>
      </div>
      <TInput placeholder="Buscar por nombre o código de barras…" value={query} onChange={e => setQuery(e.target.value)} style={{ marginBottom: 16 }} />
      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>{["#","Nombre","Código","Costo","Precio","Stock",""].map(h => <TH key={h}>{h}</TH>)}</tr></thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id} className="tr-h" style={{ background: i % 2 === 0 ? "white" : "#FAFAFA" }}>
                <TD style={{ color: "#D1D5DB", fontSize: 11 }}>{p.id}</TD>
                <TD><span style={{ fontWeight: 600, color: "#0F172A" }}>{p.name}</span></TD>
                <TD style={{ fontFamily: MONO, fontSize: 12, color: "#9CA3AF" }}>{p.barcode}</TD>
                <TD><span style={{ fontFamily: MONO }}>{fmt(p.cost)}</span></TD>
                <TD><span style={{ fontFamily: MONO, fontWeight: 700 }}>{fmt(p.price)}</span></TD>
                <TD><span style={{ fontFamily: MONO, fontWeight: 700, color: p.stock === 0 ? "#DC2626" : "#374151" }}>{p.stock}</span></TD>
                <TD><GBtn accent={accent} onClick={() => setView(p)}>Ver →</GBtn></TD>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {modal === "single" && (
        <Overlay onClose={() => setModal(null)}>
          <div style={{ padding: 28 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#0F172A", marginBottom: 20 }}>Cargar producto</div>
            <PF data={form} onChange={(f, v) => setForm(p => ({ ...p, [f]: v }))} />
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <SBtn onClick={() => setModal(null)} style={{ flex: 1 }}>Cancelar</SBtn>
              <PBtn accent={accent} onClick={addOne} style={{ flex: 1 }}>Cargar producto</PBtn>
            </div>
          </div>
        </Overlay>
      )}

      {modal === "multi" && (
        <div onClick={() => setModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(10,20,30,0.52)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16, backdropFilter: "blur(3px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 20, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ padding: 28 }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: "#0F172A", marginBottom: 20 }}>Cargar varios productos</div>
              <div style={{ maxHeight: 400, overflowY: "auto", paddingRight: 4 }}>
                {multi.map((item, idx) => (
                  <div key={idx} style={{ background: "#F9FAFB", borderRadius: 12, padding: 16, marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", marginBottom: 10 }}>Producto {idx + 1}</div>
                    <PF data={item} onChange={(f, v) => setMulti(p => p.map((it, i) => i === idx ? { ...it, [f]: v } : it))} />
                  </div>
                ))}
              </div>
              <button onClick={() => setMulti(p => [...p, emptyF()])}
                style={{ width: "100%", padding: "10px", border: "1.5px dashed #D1D5DB", borderRadius: 10, background: "transparent", color: "#9CA3AF", fontFamily: FONT, fontSize: 13, cursor: "pointer", marginTop: 4, marginBottom: 20 }}>
                + Agregar otro producto
              </button>
              <div style={{ display: "flex", gap: 10 }}>
                <SBtn onClick={() => setModal(null)} style={{ flex: 1 }}>Cancelar</SBtn>
                <PBtn accent={accent} onClick={addMany} style={{ flex: 1 }}>Cargar todos</PBtn>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// PROVEEDORES
// ════════════════════════════════════════════════════════════════════════════════
function Proveedores({ state, setState }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ name: "", whatsapp: "" });
  const [view, setView]         = useState(null);
  const accent = state.business.accentColor;

  const add = () => {
    if (!form.name) return;
    setState(p => ({ ...p, providers: [...p.providers, { id: p.nid.provider, ...form }], nid: { ...p.nid, provider: p.nid.provider + 1 } }));
    setForm({ name: "", whatsapp: "" }); setShowForm(false);
  };

  if (view) {
    const linked = state.products.filter(p => p.providerId === view.id);
    return (
      <div style={sx.page}>
        <GBtn accent={accent} onClick={() => setView(null)}>← Volver</GBtn>
        <div style={{ marginTop: 22 }}>
          <Card style={{ padding: "20px 24px", marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: "#0F172A" }}>{view.name}</div>
            <div style={{ fontSize: 13, color: "#9CA3AF", marginTop: 4 }}>📱 {view.whatsapp}</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: accent, marginTop: 10 }}>{linked.length} productos vinculados</div>
          </Card>
          <Card>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>{["Nombre","Código","Costo","Precio","Stock"].map(h => <TH key={h}>{h}</TH>)}</tr></thead>
              <tbody>
                {linked.length === 0
                  ? <tr><td colSpan={5} style={{ padding: "28px", textAlign: "center", color: "#9CA3AF", fontSize: 13, fontFamily: FONT }}>Sin productos vinculados</td></tr>
                  : linked.map((p, i) => (
                    <tr key={p.id} className="tr-h" style={{ background: i % 2 === 0 ? "white" : "#FAFAFA" }}>
                      <TD><span style={{ fontWeight: 600 }}>{p.name}</span></TD>
                      <TD style={{ fontFamily: MONO, fontSize: 12, color: "#9CA3AF" }}>{p.barcode}</TD>
                      <TD><span style={{ fontFamily: MONO }}>{fmt(p.cost)}</span></TD>
                      <TD><span style={{ fontFamily: MONO, fontWeight: 700 }}>{fmt(p.price)}</span></TD>
                      <TD><span style={{ fontFamily: MONO }}>{p.stock}</span></TD>
                    </tr>
                  ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div style={sx.page}>
      <PH icon="🚚" title="Proveedores" action={<PBtn accent={accent} onClick={() => setShowForm(true)}>+ Nuevo proveedor</PBtn>} />
      <Card style={{ padding: "9px 16px", fontSize: 13, fontFamily: FONT, marginBottom: 20, display: "inline-block" }}>
        Total: <strong style={{ color: "#0F172A" }}>{state.providers.length}</strong>
      </Card>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {state.providers.map(prov => {
          const count = state.products.filter(p => p.providerId === prov.id).length;
          return (
            <Card key={prov.id} style={{ padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#0F172A" }}>{prov.name}</div>
                <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 3 }}>📱 {prov.whatsapp}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: accent }}>{count} productos</span>
                <GBtn accent={accent} onClick={() => setView(prov)}>Ver →</GBtn>
              </div>
            </Card>
          );
        })}
      </div>
      {showForm && (
        <Overlay onClose={() => setShowForm(false)}>
          <div style={{ padding: 28 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#0F172A", marginBottom: 20 }}>Nuevo proveedor</div>
            <TInput placeholder="Nombre del proveedor" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={{ marginBottom: 10 }} />
            <TInput placeholder="WhatsApp" value={form.whatsapp} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))} style={{ marginBottom: 20 }} />
            <div style={{ display: "flex", gap: 10 }}>
              <SBtn onClick={() => setShowForm(false)} style={{ flex: 1 }}>Cancelar</SBtn>
              <PBtn accent={accent} onClick={add} style={{ flex: 1 }}>Cargar proveedor</PBtn>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// VENCIMIENTOS
// ════════════════════════════════════════════════════════════════════════════════
function Vencimientos({ state }) {
  const [removed, setRemoved] = useState([]);
  const items = state.products
    .filter(p => p.expDate && p.stock > 0 && !removed.includes(p.id))
    .map(p => ({ ...p, days: daysUntil(p.expDate) }))
    .sort((a, b) => a.days - b.days);

  const clr = d => {
    if (d <= 10) return { bg: "#FEF2F2", border: "#FECACA", badge: ["#FEE2E2","#B91C1C"] };
    if (d <= 30) return { bg: "#FEFCE8", border: "#FEF08A", badge: ["#FEF9C3","#A16207"] };
    return       { bg: "#F0FDF4", border: "#BBF7D0", badge: ["#DCFCE7","#15803D"] };
  };

  return (
    <div style={sx.page}>
      <PH icon="⏰" title="Vencimientos" />
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {[["🔴","≤ 10 días","red"],["🟡","11 – 30 días","yellow"],["🟢","+ 30 días","green"]].map(([e,l,c]) => (
          <Badge key={l} color={c}>{e} {l}</Badge>
        ))}
      </div>
      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "88px 0", color: "#D1D5DB" }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>✅</div>
          <div style={{ fontFamily: FONT, fontSize: 14 }}>No hay alertas de vencimiento activas</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map(p => {
            const c = clr(p.days);
            return (
              <div key={p.id} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 14, display: "flex", alignItems: "center", gap: 14, padding: "15px 20px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#0F172A" }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: "#6B7280", marginTop: 3 }}>Stock: {p.stock} · Vence: {p.expDate}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: c.badge[0], color: c.badge[1] }}>
                  {p.days <= 0 ? "VENCIDO" : p.days === 1 ? "¡Mañana!" : `${p.days} días`}
                </span>
                <button onClick={() => setRemoved(r => [...r, p.id])}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#D1D5DB", fontSize: 20, lineHeight: 1 }}
                  onMouseEnter={e => e.target.style.color = "#EF4444"}
                  onMouseLeave={e => e.target.style.color = "#D1D5DB"}>✕</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// REPORTES
// ════════════════════════════════════════════════════════════════════════════════
function Reportes({ state }) {
  const [tab, setTab]             = useState("ventas");
  const [from, setFrom]           = useState("");
  const [to, setTo]               = useState("");
  const [showFilter, setShowF]    = useState(false);
  const [rotPeriod, setRotPeriod] = useState("30");
  const [rotFrom, setRotFrom]     = useState("");
  const [rotTo, setRotTo]         = useState("");
  const [showRotF, setShowRotF]   = useState(false);
  const accent = state.business.accentColor;

  const sales = useMemo(() => {
    let s = state.sales;
    if (from) s = s.filter(v => v.date >= from);
    if (to)   s = s.filter(v => v.date <= to);
    return s;
  }, [state.sales, from, to]);

  const sTotal = sales.reduce((s, v) => s + v.total, 0);
  const sCost  = sales.reduce((s, v) => s + v.cost, 0);
  const sBen   = sales.reduce((s, v) => s + v.benefit, 0);
  const sRent  = sTotal > 0 ? Math.round((sBen / sTotal) * 100) : 0;
  const invest = state.products.reduce((s, p) => s + p.cost * p.stock, 0);
  const retail = state.products.reduce((s, p) => s + p.price * p.stock, 0);

  const rotData = useMemo(() => {
    const now = new Date();
    let since, until = T;
    if (rotPeriod === "custom") {
      since = rotFrom || rel(-30); until = rotTo || T;
    } else if (rotPeriod === "mes") {
      since = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    } else if (rotPeriod === "año") {
      since = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
    } else {
      since = rel(-Number(rotPeriod));
    }
    const m = {};
    state.products.forEach(p => { m[p.name] = 0; });
    state.sales.filter(s => s.date >= since && s.date <= until).forEach(s => {
      s.items.forEach(i => { m[i.name] = (m[i.name] || 0) + i.qty; });
    });
    return Object.entries(m).map(([name, qty]) => ({ name, qty })).sort((a, b) => b.qty - a.qty);
  }, [state.sales, state.products, rotPeriod, rotFrom, rotTo]);

  const rotLabel = { "7": "Últimos 7 días", "15": "Últimos 15 días", "30": "Últimos 30 días", "mes": "Mes actual", "año": "Año actual", "custom": "Personalizado" }[rotPeriod] || "30 días";
  const maxQty = rotData[0]?.qty || 1;

  const TABS = [{ id: "ventas", l: "Ventas" }, { id: "stock", l: "Stock" }, { id: "rotacion", l: "Rotación" }];

  return (
    <div style={sx.page}>
      <PH icon="📊" title="Reportes" />
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, padding: "9px 18px", borderRadius: 10, border: `1.5px solid ${tab === t.id ? accent : "#E5E7EB"}`, background: tab === t.id ? accent : "white", color: tab === t.id ? "white" : "#6B7280", cursor: "pointer", transition: "all 0.15s" }}>
            {t.l}
          </button>
        ))}
      </div>

      {tab === "ventas" && (
        <div>
          <button onClick={() => setShowF(!showFilter)} style={{ fontFamily: FONT, fontWeight: 600, fontSize: 12, color: accent, background: "none", border: "none", cursor: "pointer", marginBottom: 16 }}>📅 Filtro avanzado</button>
          {showFilter && (
            <div style={{ background: "#EFF6FF", borderRadius: 14, padding: "16px 20px", marginBottom: 20, display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
              {[["Desde", from, setFrom], ["Hasta", to, setTo]].map(([label, val, setter]) => (
                <div key={label}>
                  <div style={{ ...sx.label, marginBottom: 6 }}>{label}</div>
                  <TInput type="date" value={val} onChange={e => setter(e.target.value)} style={{ width: "auto" }} />
                </div>
              ))}
              <GBtn accent="#EF4444" onClick={() => { setFrom(""); setTo(""); }}>✕ Limpiar</GBtn>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <StatCard label="Ventas"          value={sales.length + ""}  sub="transacciones" />
            <StatCard label="Total recaudado" value={fmt(sTotal)} />
            <StatCard label="Costos"          value={fmt(sCost)} />
            <StatCard label="Beneficio"       value={fmt(sBen)} />
            <StatCard label="Rentabilidad"    value={sRent + "%"}         sub="promedio del período" />
          </div>
        </div>
      )}

      {tab === "stock" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <StatCard label="Inversión en stock"    value={fmt(invest)}         sub="al costo" />
          <StatCard label="Valor de venta"        value={fmt(retail)}         sub="precio de góndola" />
          <StatCard label="Ganancia potencial"    value={fmt(retail - invest)} sub="si se vende todo" />
          <StatCard label="Productos con stock"   value={state.products.filter(p => p.stock > 0).length + ""} sub="activos" />
        </div>
      )}

      {tab === "rotacion" && (
        <div>
          <Card style={{ overflow: "visible" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <TH>Producto</TH>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#9CA3AF", letterSpacing: 0.5, textTransform: "uppercase", background: "#F9FAFB", borderBottom: "1px solid #F0F0F0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span>Cantidad vendida</span>
                      <div style={{ position: "relative" }}>
                        <button onClick={() => setShowRotF(!showRotF)}
                          style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(0,0,0,0.06)", border: "none", borderRadius: 6, padding: "3px 9px", color: "#6B7280", cursor: "pointer", fontSize: 11, fontFamily: FONT, fontWeight: 600 }}>
                          <FilterIcon size={11} /> {rotLabel} ▾
                        </button>
                        {showRotF && (
                          <div onClick={e => e.stopPropagation()} style={{ position: "absolute", left: 0, top: "110%", background: "white", border: "1px solid #E5E7EB", borderRadius: 14, padding: "6px 0", boxShadow: "0 10px 32px rgba(0,0,0,0.12)", zIndex: 60, minWidth: 210 }}>
                            {[["Últimos 7 días","7"],["Últimos 15 días","15"],["Últimos 30 días","30"],["Mes actual","mes"],["Año actual","año"]].map(([label, val]) => (
                              <button key={val} onClick={() => { setRotPeriod(val); setShowRotF(false); }}
                                style={{ width: "100%", textAlign: "left", padding: "9px 16px", background: rotPeriod === val ? "#EFF6FF" : "transparent", color: rotPeriod === val ? accent : "#374151", fontFamily: FONT, fontWeight: rotPeriod === val ? 700 : 400, fontSize: 13, border: "none", cursor: "pointer" }}>
                                {label}
                              </button>
                            ))}
                            <div style={{ height: 1, background: "#F0F0F0", margin: "6px 0" }} />
                            <div style={{ padding: "8px 14px 12px" }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>Período personalizado</div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                <TInput type="date" value={rotFrom} onChange={e => { setRotFrom(e.target.value); setRotPeriod("custom"); }} style={{ fontSize: 12, padding: "7px 10px" }} />
                                <TInput type="date" value={rotTo} onChange={e => { setRotTo(e.target.value); setRotPeriod("custom"); }} style={{ fontSize: 12, padding: "7px 10px" }} />
                              </div>
                              {rotPeriod === "custom" && rotFrom && (
                                <button onClick={() => setShowRotF(false)} style={{ marginTop: 10, width: "100%", background: accent, color: "white", border: "none", borderRadius: 8, padding: "8px", fontFamily: FONT, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                                  Aplicar
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rotData.length === 0 ? (
                  <tr><td colSpan={2} style={{ padding: "32px", textAlign: "center", color: "#9CA3AF", fontSize: 13, fontFamily: FONT }}>Sin datos para el período seleccionado</td></tr>
                ) : rotData.map((item, i) => (
                  <tr key={item.name} className="tr-h" style={{ background: i % 2 === 0 ? "white" : "#FAFAFA" }}>
                    <TD>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, color: "#D1D5DB", width: 18, textAlign: "right" }}>{i + 1}</span>
                        <span style={{ fontWeight: item.qty > 0 ? 600 : 400, color: item.qty > 0 ? "#0F172A" : "#9CA3AF" }}>{item.name}</span>
                      </div>
                    </TD>
                    <TD>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, color: item.qty > 0 ? accent : "#D1D5DB", width: 32 }}>{item.qty}</span>
                        {item.qty > 0 && (
                          <div style={{ flex: 1, height: 5, background: "#F0F0F0", borderRadius: 3, overflow: "hidden", maxWidth: 140 }}>
                            <div style={{ height: "100%", background: accent, borderRadius: 3, width: `${Math.round((item.qty / maxQty) * 100)}%`, opacity: 0.75 }} />
                          </div>
                        )}
                        {item.qty > 0 && <span style={{ fontSize: 11, color: "#9CA3AF" }}>ud.</span>}
                      </div>
                    </TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// CAJEROS
// ════════════════════════════════════════════════════════════════════════════════
function Cajeros({ state, setState }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName]         = useState("");
  const [sel, setSel]           = useState(null);
  const accent = state.business.accentColor;

  const stats = id => {
    const ss    = state.sales.filter(s => s.cashierId === id);
    const total = ss.reduce((s, v) => s + v.total, 0);
    const c     = state.cashiers.find(c => c.id === id);
    const hours = c?.hours || 1;
    const days  = new Set(ss.map(s => s.date)).size || 1;
    return { total, count: ss.length, hours, perHour: Math.round(total / hours), avgShift: Math.round(total / days) };
  };

  const add = () => {
    if (!name.trim()) return;
    setState(p => ({ ...p, cashiers: [...p.cashiers, { id: p.nid.cashier, name, hours: 0 }], nid: { ...p.nid, cashier: p.nid.cashier + 1 } }));
    setName(""); setShowForm(false);
  };

  if (sel) {
    const s = stats(sel.id);
    return (
      <div style={sx.page}>
        <GBtn accent={accent} onClick={() => setSel(null)}>← Volver</GBtn>
        <div style={{ marginTop: 22 }}>
          <div style={{ fontWeight: 800, fontSize: 20, color: "#0F172A", letterSpacing: -0.5, marginBottom: 22 }}>{sel.name}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <StatCard label="Ventas totales"    value={fmt(s.total)} />
            <StatCard label="Transacciones"     value={s.count + " ventas"} />
            <StatCard label="Promedio por turno" value={fmt(s.avgShift)} />
            <StatCard label="Horas trabajadas"  value={s.hours + " hs"} />
            <StatCard label="Eficiencia / hora" value={fmt(s.perHour) + "/h"} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={sx.page}>
      <PH icon="👤" title="Cajeros" action={<PBtn accent={accent} onClick={() => setShowForm(true)}>+ Agregar cajero</PBtn>} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        {state.cashiers.map(c => {
          const s = stats(c.id);
          return (
            <Card key={c.id} style={{ padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#0F172A" }}>{c.name}</div>
                <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 3 }}>{s.count} ventas · {fmt(s.perHour)}/hora</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 16, color: accent }}>{fmt(s.total)}</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF" }}>total</div>
                </div>
                <GBtn accent={accent} onClick={() => setSel(c)}>Ver →</GBtn>
              </div>
            </Card>
          );
        })}
      </div>
      {state.cashiers.length > 1 && (
        <Card>
          <div style={{ padding: "12px 18px", background: "#F9FAFB", borderBottom: "1px solid #F0F0F0", fontWeight: 600, fontSize: 13, color: "#374151" }}>⚡ Comparativa de eficiencia</div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>{["Cajero","Total","Horas","Por hora"].map(h => <TH key={h}>{h}</TH>)}</tr></thead>
            <tbody>
              {[...state.cashiers].sort((a, b) => stats(b.id).perHour - stats(a.id).perHour).map((c, i) => {
                const s = stats(c.id);
                return (
                  <tr key={c.id} className="tr-h" style={{ background: i % 2 === 0 ? "white" : "#FAFAFA" }}>
                    <TD><span style={{ fontWeight: 600 }}>{c.name}</span></TD>
                    <TD><span style={{ fontFamily: MONO }}>{fmt(s.total)}</span></TD>
                    <TD><span style={{ color: "#9CA3AF" }}>{s.hours} hs</span></TD>
                    <TD><span style={{ fontFamily: MONO, fontWeight: 800, color: accent }}>{fmt(s.perHour)}/h</span></TD>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
      {showForm && (
        <Overlay onClose={() => setShowForm(false)}>
          <div style={{ padding: 28 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#0F172A", marginBottom: 20 }}>Agregar cajero</div>
            <TInput placeholder="Nombre del cajero" value={name} onChange={e => setName(e.target.value)} style={{ marginBottom: 20 }} />
            <div style={{ display: "flex", gap: 10 }}>
              <SBtn onClick={() => setShowForm(false)} style={{ flex: 1 }}>Cancelar</SBtn>
              <PBtn accent={accent} onClick={add} style={{ flex: 1 }}>Agregar</PBtn>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// ETIQUETAS
// ════════════════════════════════════════════════════════════════════════════════
function Etiquetas({ state }) {
  const [type, setType]   = useState(null);
  const [selP, setSelP]   = useState(null);
  const [search, setSearch] = useState("");
  const accent    = state.business.accentColor;
  const lastSale  = state.sales[state.sales.length - 1];

  const ShareRow = () => (
    <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 24 }}>
      {[["📲","WhatsApp","#25D366"],["🔵","Bluetooth","#0A84FF"],["🖨️","Imprimir","#374151"]].map(([icon, label, bg]) => (
        <button key={label} style={{ fontFamily: FONT, fontWeight: 600, fontSize: 12, background: bg, color: "white", border: "none", cursor: "pointer", borderRadius: 10, padding: "10px 16px", display: "flex", alignItems: "center", gap: 6 }}>
          {icon} {label}
        </button>
      ))}
    </div>
  );

  const Watermark = () => (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      <span style={{ fontSize: 68, fontWeight: 900, color: "rgba(0,0,0,0.03)", letterSpacing: -2, whiteSpace: "nowrap" }}>{state.business.name}</span>
    </div>
  );

  return (
    <div style={sx.page}>
      <PH icon="🏷️" title="Etiquetas" />
      {!type ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[["🏷️","Etiqueta de Precio","Nombre, gramaje y precio","precio"],["🧾","Presupuesto","Ticket detallado de la venta","presupuesto"]].map(([icon, title, desc, id]) => (
            <button key={id} onClick={() => setType(id)}
              style={{ background: "white", border: "1.5px solid #EAEAEA", borderRadius: 18, padding: "38px 24px", textAlign: "center", cursor: "pointer", fontFamily: FONT, transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.background = "#EFF6FF"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#EAEAEA"; e.currentTarget.style.background = "white"; }}>
              <div style={{ fontSize: 42, marginBottom: 14 }}>{icon}</div>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#0F172A" }}>{title}</div>
              <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 6 }}>{desc}</div>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <GBtn accent={accent} onClick={() => { setType(null); setSelP(null); setSearch(""); }}>← Volver</GBtn>
          <div style={{ marginTop: 24 }}>
            {type === "precio" && !selP && (
              <div>
                <TInput placeholder="Buscar producto…" value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 14 }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {state.products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(p => (
                    <button key={p.id} onClick={() => setSelP(p)}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", border: "1px solid #EAEAEA", borderRadius: 12, padding: "14px 18px", cursor: "pointer", fontFamily: FONT, transition: "all 0.12s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#EFF6FF"; e.currentTarget.style.borderColor = accent; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#EAEAEA"; }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: "#0F172A" }}>{p.name}</span>
                      <span style={{ fontFamily: MONO, fontWeight: 700, color: accent, fontSize: 16 }}>{fmt(p.price)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {type === "precio" && selP && (
              <div>
                <div style={{ position: "relative", maxWidth: 300, margin: "0 auto", background: "white", border: "2px solid #EAEAEA", borderRadius: 22, padding: "52px 32px", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", overflow: "hidden" }}>
                  <Watermark />
                  <div style={{ position: "relative" }}>
                    <div style={{ fontWeight: 700, fontSize: 17, color: "#0F172A" }}>{selP.name}</div>
                    <div style={{ fontFamily: MONO, fontSize: 48, fontWeight: 800, color: accent, marginTop: 18, letterSpacing: -1 }}>{fmt(selP.price)}</div>
                  </div>
                </div>
                <ShareRow />
              </div>
            )}
            {type === "presupuesto" && (
              <div>
                {lastSale ? (
                  <div style={{ position: "relative", maxWidth: 340, margin: "0 auto", background: "white", border: "2px solid #EAEAEA", borderRadius: 22, padding: "28px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", overflow: "hidden" }}>
                    <Watermark />
                    <div style={{ position: "relative", fontFamily: FONT }}>
                      <div style={{ textAlign: "center", fontWeight: 800, fontSize: 15, color: "#0F172A" }}>{state.business.name}</div>
                      <div style={{ textAlign: "center", fontSize: 11, color: "#9CA3AF", marginTop: 2, marginBottom: 18 }}>{lastSale.date} · {lastSale.time}</div>
                      <div style={{ borderTop: "1.5px dashed #E5E7EB", marginBottom: 14 }} />
                      {lastSale.items.map((item, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0" }}>
                          <span style={{ color: "#374151" }}>{item.name} x{item.qty}</span>
                          <span style={{ fontFamily: MONO, fontWeight: 600 }}>{fmt(item.price * item.qty)}</span>
                        </div>
                      ))}
                      <div style={{ borderTop: "1.5px dashed #E5E7EB", marginTop: 14, marginBottom: 10 }} />
                      {lastSale.discount > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#EF4444", marginBottom: 6 }}>
                          <span>Descuento</span><span style={{ fontFamily: MONO }}>−{fmt(lastSale.discount)}</span>
                        </div>
                      )}
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 17, color: "#0F172A" }}>
                        <span>TOTAL</span><span style={{ fontFamily: MONO, color: accent }}>{fmt(lastSale.total)}</span>
                      </div>
                    </div>
                  </div>
                ) : <div style={{ textAlign: "center", padding: "40px", color: "#9CA3AF", fontFamily: FONT }}>No hay ventas recientes</div>}
                <ShareRow />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// SOPORTE Y AJUSTES
// ════════════════════════════════════════════════════════════════════════════════
function Ajustes({ state, setState }) {
  const { logout } = useAuth();
  const [tab, setTab]       = useState("soporte");
  const [feedback, setFb]   = useState("");
  const [sent, setSent]     = useState(false);
  const [logoutM, setLogM]  = useState(false);
  const [cancelM, setCanM]  = useState(false);
  const accent = state.business.accentColor;

  const upd = (f, v) => setState(p => ({ ...p, business: { ...p.business, [f]: v } }));

  const SIDEBARS = ["#0f1923","#1e3a5f","#1a3b2a","#3b1a1a","#2d1a4b","#1a2b3b"];
  const ACCENTS  = ["#2563EB","#0EA5E9","#8B5CF6","#10B981","#F59E0B","#EF4444"];

  return (
    <div style={sx.page}>
      <PH icon="⚙️" title="Soporte y Ajustes" />
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[["soporte","🆘 Soporte"],["ajustes","⚙️ Ajustes"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, padding: "9px 20px", borderRadius: 10, border: `1.5px solid ${tab === id ? accent : "#E5E7EB"}`, background: tab === id ? accent : "white", color: tab === id ? "white" : "#6B7280", cursor: "pointer", transition: "all 0.15s" }}>
            {label}
          </button>
        ))}
      </div>

      {tab === "soporte" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ padding: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#0F172A", marginBottom: 14 }}>Contacto</div>
            <div style={{ display: "flex", gap: 10 }}>
              {[["✉️","Email","#6B7280","#F9FAFB"],["📲","WhatsApp","#15803D","#F0FDF4"]].map(([icon, label, color, bg]) => (
                <button key={label} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: bg, border: "none", borderRadius: 12, padding: "14px", fontFamily: FONT, fontWeight: 600, fontSize: 13, color, cursor: "pointer" }}>
                  {icon} {label}
                </button>
              ))}
            </div>
          </Card>
          <Card style={{ padding: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#0F172A", marginBottom: 4 }}>¿Qué te gustaría mejorar?</div>
            <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 14 }}>Tu opinión nos ayuda a crecer</div>
            <textarea value={feedback} onChange={e => setFb(e.target.value)} rows={4}
              style={{ fontFamily: FONT, fontSize: 13, border: "1.5px solid #E5E7EB", borderRadius: 12, padding: "12px 14px", width: "100%", resize: "none", outline: "none" }}
              placeholder="Escribí tu sugerencia o comentario…" />
            <PBtn accent={accent} onClick={() => { setSent(true); setFb(""); setTimeout(() => setSent(false), 3000); }} style={{ marginTop: 12 }}>
              {sent ? "✅ Enviado" : "Enviar"}
            </PBtn>
          </Card>
        </div>
      )}

      {tab === "ajustes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ padding: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#0F172A", marginBottom: 16 }}>Información de cuenta</div>
            {[["Cuenta","quiosco@email.com"],["Contraseña","••••••••"],["Suscripción",null],["Método de pago","💳 Tarjeta"]].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F9FAFB" }}>
                <span style={{ fontSize: 13, color: "#6B7280" }}>{l}</span>
                {l === "Suscripción" ? <Badge color="green">Activa</Badge> : <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{v}</span>}
              </div>
            ))}
            <button onClick={() => setCanM(true)} style={{ fontSize: 12, color: "#EF4444", background: "none", border: "none", cursor: "pointer", fontFamily: FONT, marginTop: 12 }}>Cancelar suscripción</button>
          </Card>

          <Card style={{ padding: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#0F172A", marginBottom: 18 }}>Imagen y Nombre</div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ ...sx.label, marginBottom: 8 }}>Nombre del negocio</div>
              <TInput value={state.business.name} onChange={e => upd("name", e.target.value)} />
            </div>
            <div>
              <div style={{ ...sx.label, marginBottom: 8 }}>Logo</div>
              <div style={{ border: "1.5px dashed #D1D5DB", borderRadius: 12, padding: "22px", textAlign: "center", color: "#9CA3AF", fontSize: 13, cursor: "pointer", fontFamily: FONT, transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.background = "#EFF6FF"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#D1D5DB"; e.currentTarget.style.background = "transparent"; }}>
                📸 Cargar logo
              </div>
            </div>
          </Card>

          <Card style={{ padding: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#0F172A", marginBottom: 18 }}>Tema y colores</div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ ...sx.label, marginBottom: 10 }}>Color barra lateral</div>
              <div style={{ display: "flex", gap: 8 }}>
                {SIDEBARS.map(c => (
                  <button key={c} onClick={() => upd("sidebarColor", c)}
                    style={{ width: 32, height: 32, borderRadius: "50%", background: c, border: state.business.sidebarColor === c ? "3px solid #374151" : "2px solid transparent", cursor: "pointer", transition: "transform 0.12s", transform: state.business.sidebarColor === c ? "scale(1.2)" : "scale(1)" }} />
                ))}
              </div>
            </div>
            <div>
              <div style={{ ...sx.label, marginBottom: 10 }}>Color de acento</div>
              <div style={{ display: "flex", gap: 8 }}>
                {ACCENTS.map(c => (
                  <button key={c} onClick={() => upd("accentColor", c)}
                    style={{ width: 32, height: 32, borderRadius: "50%", background: c, border: state.business.accentColor === c ? "3px solid #374151" : "2px solid transparent", cursor: "pointer", transition: "transform 0.12s", transform: state.business.accentColor === c ? "scale(1.2)" : "scale(1)" }} />
                ))}
              </div>
            </div>
          </Card>

          <Card style={{ padding: "18px 24px" }}>
            <button onClick={() => setLogM(true)} style={{ width: "100%", fontFamily: FONT, fontWeight: 700, fontSize: 13, color: "#EF4444", background: "none", border: "none", cursor: "pointer", padding: "6px" }}>
              Cerrar sesión
            </button>
          </Card>
        </div>
      )}

      {logoutM && (
        <Overlay onClose={() => setLogM(false)}>
          <div style={{ padding: 44, textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>👋</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: "#0F172A", marginBottom: 8, fontFamily: FONT }}>¿Cerrar sesión?</div>
            <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 30, fontFamily: FONT }}>¿Estás seguro de que querés salir?</div>
            <div style={{ display: "flex", gap: 10 }}>
              <SBtn onClick={() => setLogM(false)} style={{ flex: 1 }}>No</SBtn>
              <button onClick={() => { logout(); setLogM(false); }} style={{ flex: 1, fontFamily: FONT, fontWeight: 700, fontSize: 13, background: "#EF4444", color: "white", border: "none", cursor: "pointer", borderRadius: 10, padding: "11px" }}>Sí, salir</button>
            </div>
          </div>
        </Overlay>
      )}

      {cancelM && (
        <Overlay onClose={() => setCanM(false)}>
          <div style={{ padding: 44, textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>⚠️</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: "#0F172A", marginBottom: 8, fontFamily: FONT }}>¿Cancelar suscripción?</div>
            <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 30, fontFamily: FONT }}>Perderás el acceso al terminar tu período actual.</div>
            <div style={{ display: "flex", gap: 10 }}>
              <SBtn onClick={() => setCanM(false)} style={{ flex: 1 }}>Volver</SBtn>
              <button onClick={() => setCanM(false)} style={{ flex: 1, fontFamily: FONT, fontWeight: 700, fontSize: 13, background: "#EF4444", color: "white", border: "none", cursor: "pointer", borderRadius: 10, padding: "11px" }}>Cancelar</button>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// APP ROOT
// ════════════════════════════════════════════════════════════════════════════════
function LoadingScreen() {
  return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f1923", fontFamily: FONT }}>
      <div style={{ textAlign: "center", color: "white" }}>
        <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: -2, marginBottom: 12 }}>Flow</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", letterSpacing: 3, textTransform: "uppercase" }}>Cargando...</div>
      </div>
    </div>
  );
}

export default function App() {
  const { user, logout } = useAuth();
  const [state, setState]         = useState(null);
  const [active, setActive]       = useState("lector");
  const [appLoading, setAppLoading] = useState(true);
  const saveTimer                 = useRef(null);

  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, "users", user.uid, "data", "main");
    getDoc(docRef).then(snap => {
      setState(snap.exists() ? snap.data() : INIT);
      setAppLoading(false);
    }).catch(() => { setState(INIT); setAppLoading(false); });
  }, [user]);

  const setStateAndSave = useCallback((updater) => {
    setState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        setDoc(doc(db, "users", user.uid, "data", "main"), next).catch(console.error);
      }, 1500);
      return next;
    });
  }, [user]);

  if (appLoading || !state) return <LoadingScreen />;

  const { sidebarColor, accentColor, name } = state.business;
  const map = { lector: Lector, caja: Caja, productos: Productos, proveedores: Proveedores, vencimientos: Vencimientos, reportes: Reportes, cajeros: Cajeros, etiquetas: Etiquetas, ajustes: Ajustes };
  const Section = map[active];

  return (
    <>
      <GS />
      <div style={{ display: "flex", height: "100vh", fontFamily: FONT, overflow: "hidden" }}>

        {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
        <div style={{ width: 210, minWidth: 210, backgroundColor: sidebarColor, display: "flex", flexDirection: "column", transition: "background 0.35s" }}>
          <div style={{ padding: "22px 18px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ color: "white", fontWeight: 900, fontSize: 15, letterSpacing: -0.4, fontFamily: HEEBO }}>{name}</div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 3 }}>Panel de gestión</div>
          </div>
          <nav style={{ flex: 1, paddingTop: 8, overflowY: "auto" }}>
            {NAVS.map(n => {
              const on = active === n.id;
              return (
                <button key={n.id} onClick={() => setActive(n.id)}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", border: "none", cursor: "pointer", background: on ? "rgba(255,255,255,0.09)" : "transparent", borderLeft: `3px solid ${on ? accentColor : "transparent"}`, color: on ? "white" : "rgba(255,255,255,0.4)", fontFamily: FONT, fontSize: 13, fontWeight: on ? 700 : 400, textAlign: "left", transition: "all 0.15s" }}
                  onMouseEnter={e => { if (!on) e.currentTarget.style.color = "rgba(255,255,255,0.72)"; }}
                  onMouseLeave={e => { if (!on) e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}>
                  <NavIcon id={n.id} />
                  <span>{n.label}</span>
                </button>
              );
            })}
          </nav>
          <div style={{ padding: "12px 14px 16px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <img
              src={`data:image/png;base64,${LOGO_B64}`}
              alt="Flow"
              style={{ width: "100%", height: "auto", display: "block" }}
            />
            <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, marginTop: 6, letterSpacing: 0.2 }}>© Powered by VEXA 2026</div>
          </div>
        </div>

        {/* ── CONTENT ─────────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", backgroundColor: "white", position: "relative" }}>
          {/* Watermark */}
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(calc(-50% + 105px), -50%)", fontSize: 92, fontWeight: 900, color: "rgba(0,0,0,0.022)", pointerEvents: "none", whiteSpace: "nowrap", userSelect: "none", zIndex: 0, letterSpacing: -3, fontFamily: FONT }}>
            {name}
          </div>
          <div style={{ position: "relative", zIndex: 1, minHeight: "100%" }}>
            {Section && <Section state={state} setState={setStateAndSave} />}
          </div>
        </div>

      </div>
    </>
  );
}

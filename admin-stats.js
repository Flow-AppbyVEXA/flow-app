// /api/admin-stats.js
// Lee todos los usuarios de Firestore y devuelve métricas para el panel de admin.
// Protegido: verifica que el token pertenezca al ADMIN_EMAIL configurado en Vercel.

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

function getServices() {
  if (!getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({ credential: cert(serviceAccount) });
  }
  return { db: getFirestore(), auth: getAuth() };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "GET") return res.status(405).end();

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token requerido" });
  }

  try {
    const { db, auth } = getServices();

    // Verificar token y que sea el admin
    const decoded = await auth.verifyIdToken(authHeader.split(" ")[1]);
    if (decoded.email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    // Leer todos los usuarios
    const userRefs = await db.collection("users").listDocuments();
    const clients = [];

    for (const userRef of userRefs) {
      const snap = await userRef.collection("data").doc("main").get();
      if (!snap.exists) continue;

      const data = snap.data();
      let email = "—";
      try {
        const rec = await auth.getUser(userRef.id);
        email = rec.email || "—";
      } catch (e) {}

      const sales    = data.sales || [];
      const lastSale = [...sales]
        .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
        .find(s => s.date);

      clients.push({
        uid:           userRef.id,
        email,
        businessName:  data.business?.name || "—",
        accentColor:   data.business?.accentColor || "#2563EB",
        billing:       data.billing || {},
        productsCount: (data.products || []).length,
        salesCount:    sales.length,
        totalRevenue:  sales.reduce((s, v) => s + (v.total || 0), 0),
        createdAt:     data.createdAt || null,
        lastSaleDate:  lastSale?.date || null,
      });
    }

    // Ordenar por fecha de registro (más reciente primero)
    clients.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

    return res.status(200).json({ clients, total: clients.length });
  } catch (err) {
    console.error("admin-stats error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}

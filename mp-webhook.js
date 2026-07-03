// /api/mp-webhook.js
// Mercado Pago llama a este endpoint cada vez que cambia el estado de una
// suscripción (pendiente, autorizada, pausada, cancelada). Actualizamos
// Firestore para reflejar el estado real de cada cliente.

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getDb() {
  if (!getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({ credential: cert(serviceAccount) });
  }
  return getFirestore();
}

export default async function handler(req, res) {
  // Mercado Pago espera siempre un 200, incluso si algo falla de nuestro lado,
  // para no generar reintentos infinitos.
  if (req.method !== "POST") {
    return res.status(200).send("ok");
  }

  try {
    const { type, data } = req.body || {};

    if (type === "subscription_preapproval" || type === "preapproval") {
      const preapprovalId = data?.id;
      if (!preapprovalId) return res.status(200).send("ok");

      const mpRes = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
        headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
      });
      const sub = await mpRes.json();
      const uid = sub.external_reference;
      if (!uid) return res.status(200).send("ok");

      const db = getDb();
      const ref = db.collection("users").doc(uid).collection("data").doc("main");
      const snap = await ref.get();
      const current = snap.exists ? snap.data() : {};
      const currentBilling = current.billing || {};

      const billing = {
        ...currentBilling,
        status: sub.status, // pending | authorized | paused | cancelled
        subscriptionId: sub.id,
        amount: sub.auto_recurring?.transaction_amount ?? currentBilling.amount ?? null,
        nextPaymentDate: sub.next_payment_date || null,
      };

      // Primera vez que se autoriza (termina el trial y se cobra) → arrancamos
      // el contador de 6 meses para el aumento de precio.
      if (sub.status === "authorized" && !currentBilling.firstChargeDate) {
        billing.firstChargeDate = new Date().toISOString();
      }

      await ref.set({ billing }, { merge: true });
    }

    return res.status(200).send("ok");
  } catch (err) {
    console.error("mp-webhook error:", err);
    return res.status(200).send("ok");
  }
}

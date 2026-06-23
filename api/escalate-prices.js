// /api/escalate-prices.js
// Se ejecuta una vez por día (configurado en vercel.json). Busca clientes
// cuya suscripción lleva 6 meses autorizada con el precio promocional y
// actualiza el monto a $15.000 directamente en Mercado Pago — sin necesidad
// de que el cliente vuelva a autorizar nada, el cobro automático cambia solo.

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getDb() {
  if (!getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({ credential: cert(serviceAccount) });
  }
  return getFirestore();
}

const REGULAR_PRICE = 15000;

export default async function handler(req, res) {
  try {
    const db = getDb();
    const userDocs = await db.collection("users").listDocuments();
    let escalated = 0;
    let checked = 0;

    for (const userDoc of userDocs) {
      const ref = userDoc.collection("data").doc("main");
      const snap = await ref.get();
      if (!snap.exists) continue;

      const data = snap.data();
      const billing = data.billing;
      if (!billing) continue;
      checked++;

      if (billing.status !== "authorized") continue;
      if (billing.priceEscalated) continue;
      if (!billing.firstChargeDate) continue;

      const firstCharge = new Date(billing.firstChargeDate);
      const sixMonthsLater = new Date(firstCharge);
      sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

      if (new Date() >= sixMonthsLater) {
        const mpRes = await fetch(`https://api.mercadopago.com/preapproval/${billing.subscriptionId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ auto_recurring: { transaction_amount: REGULAR_PRICE } }),
        });

        if (mpRes.ok) {
          await ref.set(
            { billing: { ...billing, amount: REGULAR_PRICE, priceEscalated: true } },
            { merge: true }
          );
          escalated++;
        } else {
          console.error("Error escalando precio para", userDoc.id, await mpRes.text());
        }
      }
    }

    return res.status(200).json({ ok: true, checked, escalated });
  } catch (err) {
    console.error("escalate-prices error:", err);
    return res.status(500).json({ error: "Error en el proceso de escalado" });
  }
}

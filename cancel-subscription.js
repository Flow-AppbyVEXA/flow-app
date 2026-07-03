// /api/cancel-subscription.js
// Cancela una suscripción activa en Mercado Pago. El webhook se encarga de
// reflejar el cambio en Firestore, pero también respondemos directo para que
// la interfaz pueda actualizarse al instante.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { subscriptionId } = req.body || {};
  if (!subscriptionId) {
    return res.status(400).json({ error: "Falta el ID de suscripción" });
  }

  try {
    const r = await fetch(`https://api.mercadopago.com/preapproval/${subscriptionId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "cancelled" }),
    });

    const data = await r.json();
    if (!r.ok) {
      return res.status(400).json({ error: data.message || "No se pudo cancelar" });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("cancel-subscription error:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

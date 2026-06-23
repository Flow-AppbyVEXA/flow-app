// /api/create-subscription.js
// Crea una suscripción (preapproval) en Mercado Pago con 30 días de prueba
// y precio promocional de $7.500/mes. El precio se actualiza automáticamente
// a $15.000 a partir del mes 7 mediante /api/escalate-prices.js (cron diario).

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { email, uid } = req.body || {};
  if (!email || !uid) {
    return res.status(400).json({ error: "Faltan datos (email o uid)" });
  }

  try {
    const response = await fetch("https://api.mercadopago.com/preapproval", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reason: "Suscripción Flow — Gestión de Quiosco",
        external_reference: uid,
        payer_email: email,
        back_url: `${process.env.APP_URL}?subscription=success`,
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: 7500,
          currency_id: "ARS",
          free_trial: {
            frequency: 30,
            frequency_type: "days",
          },
        },
        status: "pending",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("MercadoPago error:", data);
      return res.status(400).json({ error: data.message || "Error al crear la suscripción" });
    }

    return res.status(200).json({ init_point: data.init_point, id: data.id });
  } catch (err) {
    console.error("create-subscription error:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// /api/create-subscription.js
// Crea una suscripción (preapproval) en Mercado Pago.
// El trial de 30 días ya está manejado en Firebase — cuando el trial
// expira, el usuario llega acá y MP empieza a cobrar $7.500/mes.
// Después de 6 meses, escalate-prices.js actualiza a $15.000.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { email, uid } = req.body || {};
  if (!email || !uid) {
    return res.status(400).json({ error: "Faltan datos (email o uid)" });
  }

  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) {
    return res.status(500).json({ error: "Token de MercadoPago no configurado" });
  }

  const body = {
    reason: "Flow · Gestión Comercial Inteligente",
    external_reference: uid,
    payer_email: email,
    back_url: `${process.env.APP_URL || "https://flow-app.vercel.app"}?subscription=success`,
    auto_recurring: {
      frequency: 1,
      frequency_type: "months",
      transaction_amount: 7500,
      currency_id: "ARS",
    },
    status: "pending",
  };

  try {
    const response = await fetch("https://api.mercadopago.com/preapproval", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      // Devolvemos el error exacto de MP para facilitar el debug
      console.error("MP error:", JSON.stringify(data));
      return res.status(response.status).json({
        error: data.message || "Error de MercadoPago",
        mp_status: response.status,
        mp_detail: data,
      });
    }

    if (!data.init_point) {
      return res.status(500).json({ error: "MP no devolvió init_point", mp_detail: data });
    }

    return res.status(200).json({ init_point: data.init_point, id: data.id });
  } catch (err) {
    console.error("create-subscription error:", err.message);
    return res.status(500).json({ error: "Error de conexión con MercadoPago" });
  }
}

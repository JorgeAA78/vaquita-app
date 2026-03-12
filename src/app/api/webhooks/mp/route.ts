import { getPaymentById, WebhokPayload } from "@/lib/mercadopago";
import { confirmPurchase } from "@/lib/purchases";

export async function POST(request: Request) {
  const body: WebhokPayload = await request.json();
  console.log("Webhook received", body);

  if (body.type === "payment") {
    const mpPayment = await getPaymentById(body.data.id);
    const purchaseId = mpPayment.external_reference;

    if (!purchaseId) {
      console.warn(`Payment ${mpPayment.id} has no external_reference, skipping.`);
      return Response.json({ received: true });
    }

    if (mpPayment.status === "approved") {
      // Pago aprobado (tarjeta de crédito/débito u otros medios inmediatos)
      console.log(`Payment ${mpPayment.id} approved — confirming purchase ${purchaseId}`);
      await confirmPurchase(purchaseId);
    } else if (mpPayment.status === "in_process" || mpPayment.status === "pending") {
      // Pago en proceso: típico de transferencias bancarias.
      // MP tarda 1-3 días hábiles en aprobarlo.
      // Cuando lo apruebe, llamará de nuevo a este webhook con status "approved".
      console.log(
        `Payment ${mpPayment.id} is "${mpPayment.status}" (transferencia en proceso). ` +
        `Se confirmará automáticamente cuando MP lo apruebe.`
      );
    } else {
      // Pago rechazado u otro estado
      console.log(`Payment ${mpPayment.id} has status "${mpPayment.status}" — no action taken.`);
    }
  }

  // Responder siempre a MP para que no reintente el webhook
  return Response.json({ received: true });
}


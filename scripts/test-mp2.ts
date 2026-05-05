import { MercadoPagoConfig, PreApproval } from "mercadopago";

async function run() {
  try {
    const client = new MercadoPagoConfig({ accessToken: "APP_USR-3953777513514675-032819-dc6ebea7073d53021a92054959cfb425-3297988529" });
    const preApproval = new PreApproval(client);

    console.log("Testing with auto_recurring");
    try {
      const result = await preApproval.create({
        body: {
          reason: "Iwon Audiovisual - Suscripción Mensual",
          auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            transaction_amount: 14999,
            currency_id: "ARS",
          },
          payer_email: "test_user_123@test.com",
          external_reference: "user-test-123",
          back_url: "http://localhost:3000/suscripcion/exito",
        }
      });
      console.log("Success:", result.id, result.init_point);
    } catch (e: any) {
      console.error("Error:", e.response?.data || e.message);
    }
  } catch (err) {
    console.error("Fatal:", err);
  }
}

run();

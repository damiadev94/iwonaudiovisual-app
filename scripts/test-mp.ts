import { MercadoPagoConfig, PreApproval } from "mercadopago";

async function run() {
  try {
    const client = new MercadoPagoConfig({ accessToken: "APP_USR-3953777513514675-032819-dc6ebea7073d53021a92054959cfb425-3297988529" });
    const preApproval = new PreApproval(client);

    console.log("Testing with status: pending");
    try {
      const result1 = await preApproval.create({
        body: {
          preapproval_plan_id: "d6a8d021cfe748888a6732f1c48965f3",
          payer_email: "test@example.com",
          external_reference: "user-test-123",
          back_url: "http://localhost:3000/suscripcion/exito",
          status: "pending"
        }
      });
      console.log("Success 1:", result1.id);
    } catch (e: any) {
      console.error("Error 1:", e.response?.data || e.message);
    }

    console.log("\nTesting without status");
    try {
      const result2 = await preApproval.create({
        body: {
          preapproval_plan_id: "d6a8d021cfe748888a6732f1c48965f3",
          payer_email: "test@example.com",
          external_reference: "user-test-123",
          back_url: "http://localhost:3000/suscripcion/exito",
        }
      });
      console.log("Success 2:", result2.id);
    } catch (e: any) {
      console.error("Error 2:", e.response?.data || e.message);
    }

  } catch (err) {
    console.error("Fatal:", err);
  }
}

run();

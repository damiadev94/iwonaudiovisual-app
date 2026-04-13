import { MercadoPagoConfig, PreApproval } from "mercadopago";

const client = new MercadoPagoConfig({ accessToken: 'TEST-2919417606752447-041014-a7b1ec6c3e06643c87444baa7a93986c-254905668' });
const preApproval = new PreApproval(client);

preApproval.create({
  body: {
    reason: "Test",
    auto_recurring: {
      frequency: 1,
      frequency_type: "months",
      transaction_amount: 9999,
      currency_id: "ARS"
    },
    payer_email: "test_user_12345@testuser.com",
    back_url: "https://www.google.com"
  }
}).then(console.log).catch(err => {
  console.log("ERROR TYPE:", typeof err);
  console.log("ERROR:", err);
});

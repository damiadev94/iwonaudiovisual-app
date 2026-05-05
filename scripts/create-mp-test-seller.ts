// Crea una cuenta de test VENDEDOR en MercadoPago y muestra sus credenciales.
// Guardá el access_token que imprime — no se puede recuperar después.
//
// Uso: npx tsx --env-file=.env.local scripts/create-mp-test-seller.ts

// Para crear usuarios test se necesita el token de PRODUCCIÓN (APP_USR-...).
// Pasalo como variable: $env:MP_PROD_TOKEN="APP_USR-..." antes de correr el script.
const ACCESS_TOKEN = process.env.MP_PROD_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error("Falta MP_PROD_TOKEN (o MERCADOPAGO_ACCESS_TOKEN) en el entorno");
  process.exit(1);
}

async function main() {
  const res = await fetch("https://api.mercadopago.com/users/test", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ site_id: "MLA" }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Error de MP:", JSON.stringify(data, null, 2));
    process.exit(1);
  }

  console.log("\n✓ Cuenta de test creada. Guardá estos datos:");
  console.log(`  Email:         ${data.email}`);
  console.log(`  Password:      ${data.password}`);
  console.log(`  Access Token:  ${data.access_token}`);
  console.log(`  Client ID:     ${data.client_id}`);
  console.log(`  Client Secret: ${data.client_secret}`);
  console.log("\nPonelo en .env.local:");
  console.log(`MERCADOPAGO_ACCESS_TOKEN="${data.access_token}"`);
}

main();

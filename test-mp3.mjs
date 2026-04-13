fetch("https://api.mercadopago.com/preapproval", {
  method: "POST",
  headers: { "Authorization": "Bearer undefined" }
}).then(res => res.json()).then(console.log);

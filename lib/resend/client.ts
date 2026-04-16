import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendConfirmationEmail(email: string, name: string, token: string) {
  const confirmUrl = `${process.env.NEXT_PUBLIC_APP_URL}/confirm?token=${token}`;

  await getResend().emails.send({
    from: "Iwon Audiovisual <noreply@iwonaudiovisual.com>",
    to: email,
    subject: "Confirma tu email - Iwon Audiovisual",
    html: `
      <div style="background:#0A0A0A;color:#F5F5F5;padding:40px;font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h1 style="color:#C9A84C;margin-bottom:8px;">Confirma tu email</h1>
        <p>Hola ${name},</p>
        <p>Gracias por registrarte en Iwon Audiovisual. Para activar tu cuenta, hace click en el botón de abajo:</p>
        <a href="${confirmUrl}"
           style="display:inline-block;background:#C9A84C;color:#0A0A0A;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin:24px 0;">
          Confirmar mi email
        </a>
        <p style="color:#888;font-size:14px;">
          Este link expira en 24 horas. Si no creaste una cuenta, podés ignorar este email.
        </p>
        <p style="color:#555;font-size:12px;margin-top:32px;">
          Si el botón no funciona, copiá y pegá este link en tu navegador:<br/>
          <span style="color:#C9A84C;">${confirmUrl}</span>
        </p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(email: string, name: string) {
  await getResend().emails.send({
    from: "Iwon Audiovisual <noreply@iwonaudiovisual.com>",
    to: email,
    subject: "Bienvenido a Iwon Audiovisual",
    html: `
      <div style="background:#0A0A0A;color:#F5F5F5;padding:40px;font-family:sans-serif;">
        <h1 style="color:#C9A84C;">Bienvenido a Iwon Audiovisual</h1>
        <p>Hola ${name},</p>
        <p>Tu cuenta fue creada exitosamente. Suscribite para acceder a todos los beneficios de la plataforma.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;background:#C9A84C;color:#0A0A0A;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px;">
          Ir a la plataforma
        </a>
      </div>
    `,
  });
}

export async function sendSubscriptionConfirmation(email: string, name: string) {
  await getResend().emails.send({
    from: "Iwon Audiovisual <noreply@iwonaudiovisual.com>",
    to: email,
    subject: "Suscripcion confirmada - Iwon Audiovisual",
    html: `
      <div style="background:#0A0A0A;color:#F5F5F5;padding:40px;font-family:sans-serif;">
        <h1 style="color:#C9A84C;">Suscripcion Confirmada</h1>
        <p>Hola ${name},</p>
        <p>Tu suscripcion a Iwon Audiovisual esta activa. Ya podes acceder a todos los beneficios:</p>
        <ul>
          <li>Cursos de formacion</li>
          <li>Promos de filmacion</li>
          <li>Sorteos exclusivos</li>
          <li>Seleccion "Los 50"</li>
        </ul>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;background:#C9A84C;color:#0A0A0A;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px;">
          Explorar la plataforma
        </a>
      </div>
    `,
  });
}

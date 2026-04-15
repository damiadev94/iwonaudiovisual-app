import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones | Iwon Audiovisual",
  description: "Términos y condiciones de uso de Iwon Audiovisual. Conocé las reglas que rigen el uso de nuestra plataforma.",
};

export default function TerminosYCondicionesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold mb-2">Términos y Condiciones</h1>
      <p className="text-sm text-muted-foreground mb-10">Última actualización: abril de 2026</p>

      <div className="prose prose-sm max-w-none space-y-8 text-foreground">

        <section>
          <h2 className="text-xl font-semibold mb-3">1. Aceptación de los términos</h2>
          <p className="text-muted-foreground leading-relaxed">
            Al acceder y utilizar la plataforma <strong className="text-foreground">Iwon Audiovisual</strong> (disponible en{" "}
            <strong className="text-foreground">iwonaudiovisual.com</strong>), aceptás quedar vinculado por estos Términos y Condiciones. Si no estás de acuerdo con alguna parte de estos términos, no debés utilizar el servicio.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Descripción del servicio</h2>
          <p className="text-muted-foreground leading-relaxed">
            Iwon Audiovisual es una plataforma de impulso para artistas independientes en Argentina. Ofrece acceso a cursos audiovisuales, sorteos de producción, sistema de selección de artistas y otros recursos, bajo un modelo de suscripción mensual.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Registro y cuenta de usuario</h2>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Para acceder al servicio debés registrarte con una cuenta de Google válida.</li>
            <li>Sos responsable de mantener la confidencialidad de tu cuenta y de todas las actividades realizadas bajo la misma.</li>
            <li>Debés notificarnos inmediatamente ante cualquier uso no autorizado de tu cuenta.</li>
            <li>Nos reservamos el derecho de suspender o eliminar cuentas que violen estos términos.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Suscripción y pagos</h2>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>El acceso completo a la plataforma requiere una suscripción mensual activa.</li>
            <li>Los pagos se procesan a través de <strong className="text-foreground">MercadoPago</strong>. Al suscribirte aceptás también sus términos de servicio.</li>
            <li>La suscripción se renueva automáticamente cada mes hasta que la canceles.</li>
            <li>Podés cancelar tu suscripción en cualquier momento desde tu perfil. El acceso se mantendrá hasta el fin del período abonado.</li>
            <li>No realizamos reembolsos por períodos parciales, salvo que la ley argentina lo requiera expresamente.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Contenido del usuario</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            Al subir canciones u otro contenido a la plataforma, declarás que:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Sos el titular de los derechos sobre dicho contenido o contás con las autorizaciones necesarias.</li>
            <li>El contenido no infringe derechos de terceros ni viola la legislación vigente.</li>
            <li>El contenido no es ofensivo, discriminatorio ni inapropiado.</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Iwon Audiovisual no reclama propiedad sobre tu contenido, pero sí se reserva el derecho de eliminarlo si viola estos términos.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Propiedad intelectual</h2>
          <p className="text-muted-foreground leading-relaxed">
            Todo el contenido generado por Iwon Audiovisual (cursos, videos, textos, diseño, marca) es propiedad exclusiva de Iwon Audiovisual y está protegido por las leyes de propiedad intelectual de Argentina. Queda prohibida su reproducción, distribución o uso comercial sin autorización expresa.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Uso aceptable</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">Al usar la plataforma, te comprometés a no:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Compartir tu cuenta con terceros.</li>
            <li>Reproducir o distribuir los cursos y materiales fuera de la plataforma.</li>
            <li>Intentar acceder a funcionalidades o datos a los que no estás autorizado.</li>
            <li>Realizar acciones que puedan dañar, sobrecargar o comprometer la seguridad de la plataforma.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Disponibilidad del servicio</h2>
          <p className="text-muted-foreground leading-relaxed">
            Nos esforzamos por mantener la plataforma disponible de forma continua, pero no garantizamos un tiempo de actividad del 100%. Podemos realizar mantenimientos, actualizaciones o interrupciones temporales sin previo aviso. No seremos responsables por daños derivados de la no disponibilidad del servicio.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Limitación de responsabilidad</h2>
          <p className="text-muted-foreground leading-relaxed">
            Iwon Audiovisual no será responsable por daños indirectos, incidentales o consecuentes derivados del uso o imposibilidad de uso de la plataforma, incluyendo la pérdida de datos o lucro cesante. En ningún caso nuestra responsabilidad total superará el monto abonado por el usuario en los últimos tres meses.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">10. Modificaciones a los términos</h2>
          <p className="text-muted-foreground leading-relaxed">
            Podemos modificar estos Términos y Condiciones en cualquier momento. Notificaremos cambios relevantes por correo electrónico o mediante un aviso en la plataforma. El uso continuado del servicio luego de la notificación implica la aceptación de los nuevos términos.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">11. Ley aplicable y jurisdicción</h2>
          <p className="text-muted-foreground leading-relaxed">
            Estos términos se rigen por las leyes de la República Argentina. Ante cualquier controversia, las partes se someten a la jurisdicción de los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">12. Contacto</h2>
          <p className="text-muted-foreground leading-relaxed">
            Para consultas sobre estos Términos y Condiciones, podés contactarnos en{" "}
            <a href="mailto:contacto@iwonaudiovisual.com" className="text-primary underline underline-offset-4">
              contacto@iwonaudiovisual.com
            </a>.
          </p>
        </section>

      </div>
    </div>
  );
}

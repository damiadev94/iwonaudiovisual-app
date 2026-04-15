import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad | Iwon Audiovisual",
  description: "Política de privacidad de Iwon Audiovisual. Conocé cómo recopilamos, usamos y protegemos tu información personal.",
};

export default function PoliticaDePrivacidadPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold mb-2">Política de Privacidad</h1>
      <p className="text-sm text-muted-foreground mb-10">Última actualización: abril de 2026</p>

      <div className="prose prose-sm max-w-none space-y-8 text-foreground">

        <section>
          <h2 className="text-xl font-semibold mb-3">1. Responsable del tratamiento</h2>
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Iwon Audiovisual</strong> (en adelante, &ldquo;nosotros&rdquo;, &ldquo;la plataforma&rdquo; o &ldquo;el sitio&rdquo;) es responsable del tratamiento de los datos personales recopilados a través de{" "}
            <strong className="text-foreground">iwonaudiovisual.com</strong>. Ante cualquier consulta, podés contactarnos en{" "}
            <a href="mailto:contacto@iwonaudiovisual.com" className="text-primary underline underline-offset-4">
              contacto@iwonaudiovisual.com
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Datos que recopilamos</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">Al registrarte o utilizar la plataforma, podemos recopilar los siguientes datos:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li><strong className="text-foreground">Datos de cuenta:</strong> nombre, dirección de correo electrónico e imagen de perfil, obtenidos mediante Google OAuth.</li>
            <li><strong className="text-foreground">Datos de uso:</strong> cursos visitados, canciones subidas, participaciones en sorteos y selecciones.</li>
            <li><strong className="text-foreground">Datos de pago:</strong> estado de suscripción y referencias de transacciones procesadas por MercadoPago. No almacenamos datos de tarjetas.</li>
            <li><strong className="text-foreground">Datos técnicos:</strong> dirección IP, tipo de navegador y datos de sesión necesarios para el funcionamiento del servicio.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Finalidad del tratamiento</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">Usamos tus datos para:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Crear y gestionar tu cuenta de usuario.</li>
            <li>Brindarte acceso a los cursos, sorteos y demás funcionalidades de la plataforma.</li>
            <li>Procesar pagos y gestionar tu suscripción.</li>
            <li>Enviarte comunicaciones relacionadas con el servicio (confirmaciones, novedades).</li>
            <li>Mejorar la experiencia y el funcionamiento de la plataforma.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Base legal</h2>
          <p className="text-muted-foreground leading-relaxed">
            El tratamiento de tus datos se sustenta en la ejecución del contrato de servicio que aceptás al registrarte, y en los intereses legítimos de Iwon Audiovisual para mantener y mejorar la plataforma. En los casos que corresponda, se solicitará tu consentimiento expreso.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Compartición de datos con terceros</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">Tus datos pueden ser compartidos únicamente con los siguientes proveedores de servicio:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li><strong className="text-foreground">Supabase:</strong> almacenamiento de base de datos y autenticación.</li>
            <li><strong className="text-foreground">MercadoPago:</strong> procesamiento de pagos.</li>
            <li><strong className="text-foreground">Cloudinary:</strong> almacenamiento y entrega de contenido multimedia.</li>
            <li><strong className="text-foreground">Google:</strong> autenticación mediante OAuth 2.0.</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            No vendemos, alquilamos ni cedemos tus datos a terceros con fines comerciales.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Conservación de los datos</h2>
          <p className="text-muted-foreground leading-relaxed">
            Conservamos tus datos mientras tu cuenta permanezca activa. Si eliminás tu cuenta, procederemos a eliminar o anonimizar tus datos personales en un plazo de 30 días, salvo obligación legal de conservarlos por más tiempo.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Tus derechos</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            De acuerdo con la Ley 25.326 de Protección de Datos Personales de Argentina, tenés derecho a:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Acceder a tus datos personales.</li>
            <li>Rectificar datos inexactos o incompletos.</li>
            <li>Solicitar la eliminación de tus datos (&ldquo;derecho al olvido&rdquo;).</li>
            <li>Oponerte al tratamiento de tus datos.</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Para ejercer cualquiera de estos derechos, escribinos a{" "}
            <a href="mailto:contacto@iwonaudiovisual.com" className="text-primary underline underline-offset-4">
              contacto@iwonaudiovisual.com
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Seguridad</h2>
          <p className="text-muted-foreground leading-relaxed">
            Implementamos medidas técnicas y organizativas adecuadas para proteger tus datos frente a accesos no autorizados, pérdida o alteración. Sin embargo, ningún sistema de transmisión de datos por Internet es completamente seguro, por lo que no podemos garantizar una seguridad absoluta.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Cambios en esta política</h2>
          <p className="text-muted-foreground leading-relaxed">
            Podemos actualizar esta Política de Privacidad periódicamente. Notificaremos cambios significativos por correo electrónico o mediante un aviso destacado en la plataforma. El uso continuado del servicio tras la publicación de cambios implica la aceptación de la nueva política.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">10. Contacto</h2>
          <p className="text-muted-foreground leading-relaxed">
            Si tenés preguntas sobre esta política, podés contactarnos en{" "}
            <a href="mailto:contacto@iwonaudiovisual.com" className="text-primary underline underline-offset-4">
              contacto@iwonaudiovisual.com
            </a>{" "}
            o seguirnos en{" "}
            <a href="https://instagram.com/iwonaudiovisual" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">
              @iwonaudiovisual
            </a>.
          </p>
        </section>

      </div>
    </div>
  );
}

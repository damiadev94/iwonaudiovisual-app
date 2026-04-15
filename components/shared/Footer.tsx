import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-iwon-bg border-t border-iwon-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground max-w-md">
              Plataforma de impulso para artistas independientes en Argentina.
              Producción real con equipamiento de cine.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Plataforma</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#como-funciona" className="hover:text-foreground transition-colors">Cómo funciona</a></li>
              <li><a href="#beneficios" className="hover:text-foreground transition-colors">Beneficios</a></li>
              <li><a href="#pricing" className="hover:text-foreground transition-colors">Precio</a></li>
              <li><a href="#faq" className="hover:text-foreground transition-colors">Preguntas frecuentes</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="https://instagram.com/iwonaudiovisual" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Instagram</a></li>
              <li><a href="https://youtube.com/@iwonaudiovisual" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">YouTube</a></li>
              <li><a href="mailto:contacto@iwonaudiovisual.com" className="hover:text-foreground transition-colors">Email</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-iwon-border flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Iwon Audiovisual. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <a href="/politica-de-privacidad" className="hover:text-foreground transition-colors">
              Política de Privacidad
            </a>
            <span>·</span>
            <a href="/terminos-y-condiciones" className="hover:text-foreground transition-colors">
              Términos y Condiciones
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

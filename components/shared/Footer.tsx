export function Footer() {
  return (
    <footer className="border-t border-iwon-border px-5 md:px-10 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
      <p className="text-[11px] text-muted-foreground tracking-widest">
        © {new Date().getFullYear()} Iwon Audiovisual. Todos los derechos reservados.
      </p>
      <div className="flex gap-6">
        <a
          href="https://instagram.com/iwonaudiovisual"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] tracking-[0.12em] uppercase text-muted-foreground hover:text-gold transition-colors"
        >
          Instagram
        </a>
        <a
          href="https://youtube.com/@iwonaudiovisual"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] tracking-[0.12em] uppercase text-muted-foreground hover:text-gold transition-colors"
        >
          YouTube
        </a>
        <a
          href="/politica-de-privacidad"
          className="text-[11px] tracking-[0.12em] uppercase text-muted-foreground hover:text-gold transition-colors"
        >
          Privacidad
        </a>
      </div>
    </footer>
  );
}

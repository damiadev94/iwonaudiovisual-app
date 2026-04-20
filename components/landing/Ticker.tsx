const ITEMS = [
  "Los 50",
  "Videoclips profesionales",
  "Sin permanencia mínima",
  "Equipamiento de cine",
  "Conurbano · CABA · Argentina",
  "Sorteos mensuales",
  "Formación estratégica",
];

export function Ticker() {
  // Duplicated for seamless infinite loop (animation moves -50%)
  const all = [...ITEMS, ...ITEMS];

  return (
    <div className="bg-gold py-[14px] overflow-hidden whitespace-nowrap">
      <div
        className="inline-block"
        style={{ animation: "ticker-scroll 22s linear infinite" }}
      >
        {all.map((item, i) => (
          <span key={i} className="font-condensed font-black text-sm tracking-[0.15em] uppercase text-black mx-10">
            {item}
            <span className="text-black/30 mx-1"> ◆ </span>
          </span>
        ))}
      </div>
    </div>
  );
}

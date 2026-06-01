import Link from "next/link";

interface ButtonPrimaryProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ButtonPrimary({
  href,
  onClick,
  children,
  className = "",
  size = "md",
}: ButtonPrimaryProps) {
  const sizeClasses = {
    sm: "px-6 py-3 text-sm",
    md: "px-10 py-[18px] text-[15px]",
    lg: "px-16 py-[22px] text-[17px]",
  };

  const base = `inline-block font-black uppercase tracking-[0.12em] text-black cursor-pointer border-none transition-transform duration-150 hover:-translate-y-0.5 ${sizeClasses[size]} ${className}`;

  const style: React.CSSProperties = {
    background: "#D4A843",
    clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
    fontFamily: "var(--font-condensed, sans-serif)",
  };

  if (href) {
    return (
      <Link href={href} className={base} style={style}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={base} style={style}>
      {children}
    </button>
  );
}

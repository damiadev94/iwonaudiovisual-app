import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className="w-8 h-8 bg-gold rounded-sm flex items-center justify-center">
          <span className="text-black font-bold text-lg tracking-tighter">I</span>
        </div>
      </div>
      <span className="text-xl font-bold tracking-tight text-foreground">
        IWON<span className="text-gold ml-1">AUDIOVISUAL</span>
      </span>
    </Link>
  );
}

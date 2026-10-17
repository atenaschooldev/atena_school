import Image from "next/image";
import eipassLogo from "@/assets/eipass_logo.webp";

interface EipassCardProps {
  className?: string;
}

export default function EipassCard({ className = "" }: EipassCardProps) {
  return (
    <div 
      className={`relative w-full max-w-[340px] sm:max-w-[360px] h-[76px] sm:h-[92px] rounded-2xl bg-white shadow-sm flex overflow-hidden hover:scale-[1.03] active:scale-95 transition-all duration-300 select-none ${className}`}
    >
      {/* Left blue side with slant */}
      <div 
        className="absolute inset-y-0 left-0 bg-primary w-[56%] flex flex-col items-center justify-center pl-4 pr-9 z-10"
        style={{ clipPath: "polygon(0 0, 100% 0, 86% 100%, 0 100%)" }}
      >
        <div className="relative w-20 sm:w-24 h-[30px] sm:h-[38px] flex items-center justify-center">
          <Image
            src={eipassLogo}
            alt="EIPASS Logo"
            fill
            className="object-contain invert brightness-0"
            sizes="96px"
          />
        </div>
        <span className="text-[6px] sm:text-[7px] text-white/70 tracking-[0.5px] uppercase mt-1 sm:mt-1.5 text-center font-extrabold font-sans leading-none whitespace-nowrap">
          European Informatics Passport
        </span>
      </div>

      {/* Right white side */}
      <div className="w-[44%] ml-auto flex flex-col justify-center items-center text-center pl-3 pr-5">
        <span className="text-primary font-black text-[8px] sm:text-[9px] tracking-wider uppercase leading-none font-sans whitespace-nowrap">
          Centro Autorizzato
        </span>
        <span className="text-secondary font-black text-lg sm:text-2xl tracking-wide uppercase leading-none mt-1 font-sans">
          Eipass
        </span>
      </div>
    </div>
  );
}

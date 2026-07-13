import Image from "next/image";
import cambridgeLogo from "@/assets/cambridge.webp";

interface CambridgeCardProps {
  className?: string;
}

export default function CambridgeCard({ className = "" }: CambridgeCardProps) {
  return (
    <div
      className={`relative w-full max-w-[340px] sm:max-w-[360px] h-[92px] rounded-2xl bg-white shadow-sm flex overflow-hidden hover:scale-[1.03] active:scale-95 transition-all duration-300 select-none ${className}`}
    >
      {/* Left blue side with slant */}
      <div
        className="absolute inset-y-0 left-0 bg-[#8DE8D7] w-[56%] flex flex-col items-center justify-center pl-2 pr-7 z-10"
        style={{ clipPath: "polygon(0 0, 100% 0, 86% 100%, 0 100%)" }}
      >
        <div className="relative w-[145px] h-[52px]">
          <Image
            src={cambridgeLogo}
            alt="Cambridge Logo"
            fill
            className="object-contain scale-[2.5]"
            sizes="130px"
          />
        </div>
      </div>

      {/* Right white side */}
      <div className="w-[44%] ml-auto flex flex-col justify-center items-center text-center pl-3 pr-5">
        <span className="text-[#043569] font-black text-[9px] tracking-wider uppercase leading-none font-sans whitespace-nowrap">
          Preparazione Esami
        </span>
        <span className="text-[#F8861D] font-black text-[22px] sm:text-2xl tracking-wide uppercase leading-none mt-1 font-sans">
          Cambridge
        </span>
      </div>
    </div>
  );
}

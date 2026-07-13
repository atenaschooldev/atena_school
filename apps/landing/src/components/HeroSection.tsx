import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import heroDefault from "@/../public/hero-london.webp";
import logoDefault from "@/../public/athena-logo.webp";
import cambridgeLogo from "@/assets/cambridge.webp";
import eipassLogo from "@/assets/eipass.webp";

interface HeroSectionProps {
  data?: any;
}

const HeroSection = ({ data }: HeroSectionProps) => {
  const t = useTranslations("hero");
  const locale = useLocale();

  // Handle multilingual fields from Supabase
  const title = data?.[`title_${locale}`] || t("title");
  const tagline = data?.[`tagline_${locale}`] || t("tagline");
  const backgroundImage = data?.image_url || heroDefault;
  const logoImage = data?.logo_url || logoDefault;

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Background with advanced overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={backgroundImage}
          alt="Atena School"
          fill
          className="object-cover transition-transform duration-10000 scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/85 via-black/65 to-primary/45" />
      </div>

      {/* Decorative glowing orbs */}
      <div className="glow-orb w-[400px] h-[400px] bg-primary top-10 right-10" />
      <div className="glow-orb w-[500px] h-[500px] bg-secondary bottom-10 left-10" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 pt-28 pb-16 max-w-5xl mx-auto">
        <div className="relative w-28 h-28 md:w-36 md:h-36 mb-8 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] animate-in fade-in slide-in-from-top-6 duration-700">
          <Image
            src={logoImage}
            alt="Atena School Logo"
            fill
            className="object-contain"
          />
        </div>
        
        <h1
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white mb-6 uppercase drop-shadow-sm"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {title}
        </h1>

        {/* Dual Accreditation Badges */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10 w-full animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          {/* Cambridge Badge */}
          <div className="bg-white rounded-2xl px-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 transform hover:scale-105 hover:-rotate-1 transition-all duration-300 flex items-center justify-center h-20">
            <Image 
              src={cambridgeLogo} 
              alt="Cambridge English Qualifications" 
              width={200} 
              height={56} 
              className="object-contain h-14 w-auto"
            />
          </div>
          {/* EIPASS / Certipass Badge */}
          <div className="bg-white rounded-2xl px-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 transform hover:scale-105 hover:rotate-1 transition-all duration-300 flex items-center justify-center h-20">
            <Image 
              src={eipassLogo} 
              alt="EIPASS Accredited Center" 
              width={160} 
              height={64} 
              className="object-contain h-16 w-auto"
            />
          </div>
        </div>

        <p
          className="text-2xl md:text-3xl italic text-white/90 max-w-3xl leading-relaxed font-light drop-shadow"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {tagline}
        </p>
        <p className="text-sm text-white/60 mt-4 tracking-widest uppercase font-semibold">— {t("author")}</p>
      </div>

      {/* Curved bottom transition to About */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-20">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px] fill-background">
          <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;

import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";

interface AboutSectionProps {
  data?: any;
}

const AboutSection = ({ data }: AboutSectionProps) => {
  const t = useTranslations("about");
  const locale = useLocale();

  const title = data?.[`title_${locale}`] || t("title");
  const p1 = data?.[`p1_${locale}`] || t("p1");
  const p2 = data?.[`p2_${locale}`] || t("p2");
  const p3 = data?.[`p3_${locale}`] || t("p3");
  const cta = data?.[`cta_text_${locale}`] || t("cta");

  return (
    <section id="about" className="relative py-28 px-4 bg-muted/30 overflow-hidden">
      {/* Decorative backdrop light */}
      <div className="glow-orb w-[450px] h-[450px] bg-primary/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <div className="max-w-4xl mx-auto glass-card rounded-[32px] p-8 md:p-16 text-center relative z-10 border border-white/20 shadow-2xl transition-all duration-300 hover:shadow-primary/5">
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-primary mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
          {title}
        </h2>
        <div className="w-16 h-0.5 bg-primary/45 mx-auto mb-8" />
        
        <div className="space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed text-left max-w-3xl mx-auto mb-10">
          <p className="indent-4">
            {p1}
          </p>
          <p className="indent-4">
            {p2}
          </p>
          {p3 && (
            <p className="indent-4 border-l-2 border-primary/30 pl-4 italic text-foreground/80">
              {p3}
            </p>
          )}
        </div>

        <a href="#contact">
          <Button className="rounded-full px-10 py-6 text-sm font-bold uppercase tracking-wider shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:scale-[1.02] transition-all duration-300">
            {cta}
          </Button>
        </a>
      </div>
    </section>
  );
};

export default AboutSection;

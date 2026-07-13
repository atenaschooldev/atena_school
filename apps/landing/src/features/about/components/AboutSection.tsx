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
  const cta = data?.[`cta_text_${locale}`] || t("cta");

  return (
    <section id="about" className="relative py-32 px-4 bg-background overflow-hidden">
      {/* Decorative background accents */}
      <div className="absolute top-1/4 left-[10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-[10%] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary/80 mb-3 block">
            Atena School
          </span>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>
            {title}
          </h2>
          <div className="w-12 h-1 bg-primary mt-6 mx-auto rounded-full" />
        </div>

        {/* Editorial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          {/* Left Column: Premium Quote/Callout */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <h3
              className="text-3xl md:text-4xl font-semibold leading-tight text-foreground/90 tracking-tight"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Unire la ricchezza della cultura classica con il mondo moderno e le sue sfide.
            </h3>
            <p className="text-sm font-semibold tracking-wider text-primary/85 uppercase">
              — Elisabetta & Maria, Fondatrici
            </p>
            <div className="pt-4 hidden lg:block">
              <a href="#contact">
                <Button className="rounded-full px-8 py-6 text-xs font-extrabold uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_4px_20px_rgba(var(--primary-rgb),0.25)] hover:shadow-[0_4px_30px_rgba(var(--primary-rgb),0.35)] transition-all duration-300 hover:scale-[1.02]">
                  {cta}
                </Button>
              </a>
            </div>
          </div>

          {/* Right Column: Editorial Text Narrative */}
          <div className="lg:col-span-7 space-y-8">
            <div
              className="text-lg md:text-xl text-foreground/80 leading-relaxed space-y-6 font-light"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              <p className="first-letter:text-5xl first-letter:font-black first-letter:text-primary first-letter:float-left first-letter:mr-3 first-letter:mt-1">
                {p1}
              </p>
              <p>
                {p2}
              </p>
            </div>

            <div className="pt-4 lg:hidden text-center">
              <a href="#contact">
                <Button className="rounded-full px-8 py-6 text-xs font-extrabold uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300">
                  {cta}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

import Image from "next/image";
import { useTranslations } from "next-intl";
import { CaretRight } from "@phosphor-icons/react";
import { Link } from "@/i18n/routing";

interface CourseCardProps {
  id?: string;
  title: string;
  description: string;
  image?: any;
  category?: string;
  price?: string;
  type?: "course" | "shop";
  onCtaClick?: () => void;
}

const CourseCard = ({ id, title, description, image, category, price, type = "course", onCtaClick }: CourseCardProps) => {
  const t = useTranslations("coursesPage");

  const cardContent = (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(4,53,105,0.08)] hover:-translate-y-2 transition-all duration-500 border border-border/40 flex flex-col h-full active:scale-[0.99] relative">
      
      {/* Image container */}
      <div className="relative h-52 w-full overflow-hidden bg-muted">
        {/* Category Badge */}
        {category && (
          <div className="absolute top-4 left-4 z-20 bg-white/85 backdrop-blur-md text-[#043569] text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-white/20 shadow-sm select-none">
            {category}
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#043569]/5 to-[#F8861D]/10 flex items-center justify-center p-8 text-center transition-all duration-500">
            <span className="text-[#043569]/30 font-black uppercase tracking-widest text-sm leading-tight select-none">
              {title}
            </span>
          </div>
        )}
      </div>
      
      {/* Content wrapper */}
      <div className="p-6 sm:p-8 flex flex-col flex-grow relative z-20">
        <h3 className="text-xl sm:text-2xl font-black text-foreground mb-3 leading-tight tracking-tight group-hover:text-[#043569] transition-colors duration-300">
          {title}
        </h3>
        
        <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-grow font-medium opacity-90 line-clamp-3 group-hover:text-foreground/80 transition-colors duration-300">
          {description}
        </p>
        
        {/* Footer info */}
        <div className="flex items-center justify-between mt-auto pt-5 border-t border-border/40">
          {price ? (
            <span className="bg-[#F8861D] text-white px-3.5 py-1.5 rounded-xl text-xs font-black tracking-wider uppercase shadow-md shadow-[#F8861D]/20 transition-all duration-300 group-hover:scale-105">
              {price}
            </span>
          ) : (
            <div />
          )}

          {/* Premium button-like CTA */}
          <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary/5 text-primary rounded-xl text-xs font-black uppercase tracking-wider group-hover:bg-[#F8861D] group-hover:text-white group-hover:shadow-lg group-hover:shadow-[#F8861D]/20 transition-all duration-300">
            {t("cta")}
            <CaretRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </div>
  );

  if (id) {
    return (
      <Link href={`/book/${type}/${id}`} className="block h-full no-underline">
        {cardContent}
      </Link>
    );
  }

  return (
    <div onClick={onCtaClick} className="block h-full cursor-pointer">
      {cardContent}
    </div>
  );
};

export default CourseCard;

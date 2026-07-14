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
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-border/50 flex flex-col h-full active:scale-[0.98]">
      <div className="relative h-48 w-full overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/5 to-primary/20 flex items-center justify-center p-8 text-center group-hover:from-primary/10 group-hover:to-primary/30 transition-colors duration-500">
            <span className="text-primary/40 font-black uppercase tracking-widest text-lg leading-tight select-none">
              {title}
            </span>
          </div>
        )}
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-grow">
          {description}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
          {price ? (
            <span className="bg-[#F8861D]/10 text-[#F8861D] px-3 py-1 rounded-lg text-sm font-black tracking-wide">
              {price}
            </span>
          ) : (
            <div />
          )}
          <span className="flex items-center gap-1 text-xs font-black uppercase tracking-wider text-primary group-hover:translate-x-1 transition-transform duration-300">
            {t("cta")}
            <CaretRight className="w-4 h-4" />
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

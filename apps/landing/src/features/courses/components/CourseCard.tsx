import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/routing";

interface CourseCardProps {
  id?: string;
  title: string;
  description: string;
  image?: any;
  category?: string;
  price?: string;
  onCtaClick?: () => void;
}

const CourseCard = ({ id, title, description, image, category, price, onCtaClick }: CourseCardProps) => {
  const t = useTranslations("coursesPage");

  const content = (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border/50 flex flex-col h-full">
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
        {category && (
          <div className="absolute top-4 left-4">
            <span className="bg-primary/90 backdrop-blur-sm text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              {category}
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
            <span className="text-sm font-semibold text-primary">{price}</span>
          ) : (
            <div />
          )}
          {id ? (
            <Link 
              href={`/book/course/${id}`}
              className="flex items-center gap-1 text-xs font-bold uppercase tracking-tighter text-foreground hover:text-primary transition-colors"
            >
              {t("cta")}
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <button 
              onClick={onCtaClick}
              className="flex items-center gap-1 text-xs font-bold uppercase tracking-tighter text-foreground hover:text-primary transition-colors"
            >
              {t("cta")}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return content;
};

export default CourseCard;

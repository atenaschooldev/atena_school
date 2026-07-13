"use client";

import { useTranslations, useLocale } from "next-intl";
import { Clock, CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Link } from "@/i18n/routing";

interface ShopItem {
  id: string;
  title_it: string;
  title_en: string;
  duration_it?: string | null;
  duration_en?: string | null;
  price: string;
  category: string;
}

const ShopClient = () => {
  const t = useTranslations("shop");
  const locale = useLocale();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const categories = ["language", "tutoring", "specialized"];
  const supabase = createClient();

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('shop_items')
        .select('*')
        .eq('is_active', true);
      
      if (error) {
        console.error("Supabase error:", error);
      } else if (data) {
        setItems(data);
      }
      setLoading(false);
    };
    fetchItems();
  }, [supabase]);

  return (
    <div className="pt-32 pb-20 px-4 bg-[#f8f9fa]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6 uppercase tracking-widest">
            <ShoppingBag className="w-4 h-4" />
            {locale === "it" ? "Shop & Prezzi" : "Shop & Pricing"}
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-foreground mb-6">
            {t("title")}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Product Grid by Category */}
        <div className="space-y-20">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-border">
              <p className="text-muted-foreground italic">
                {t("notAvailable") || (locale === "it" ? "Nessun pacchetto trovato nel database." : "No packages found in the database.")}
              </p>
            </div>
          ) : categories.map((cat) => (
            <div key={cat} className="space-y-10">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground capitalize">
                  {t(`categories.${cat}`)}
                </h2>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {items
                  .filter((item) => item.category === cat)
                  .map((item) => (
                      <div key={item.id} className="group bg-background rounded-3xl p-8 border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500 flex flex-col justify-between h-full">
                        <div>
                          <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors pr-4">
                              {item[`title_${locale}` as keyof ShopItem]}
                            </h3>
                            <div className="p-2 bg-secondary/10 rounded-xl">
                              <CheckCircle2 className="w-5 h-5 text-secondary" />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-muted-foreground mb-8">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {item[`duration_${locale}` as keyof ShopItem]}
                            </span>
                          </div>
                        </div>

                        <div className="mt-auto">
                          <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-3xl font-black text-foreground">{Number(item.price).toFixed(0)}€</span>
                          </div>

                          <Link 
                            href={`/book/shop/${item.id}`}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-foreground text-background rounded-2xl font-bold hover:bg-primary transition-all duration-300 group/btn"
                          >
                            {t("cta") || "Prenota ora"}
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                  ))}
              </div>
            </div>
          ))}
        </div>


      </div>
    </div>
  );
};

export default ShopClient;

import { useTranslations } from "next-intl";
import { Instagram } from "lucide-react";

const Footer = () => {
  const t = useTranslations("footer");

  return (
    <footer className="bg-foreground text-primary-foreground py-8 px-4">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm opacity-70">{t("copyright")}</p>
      </div>
    </footer>
  );
};

export default Footer;

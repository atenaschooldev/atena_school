import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FolderTree,
  FileText,
  Briefcase,
  Receipt,
  ShieldCheck,
  Award,
  Landmark,
  CheckCircle2,
} from 'lucide-react';
import { useDocumentCategories } from '../hooks/use-document-categories';
import { DOCUMENT_CATEGORY_DICTIONARY } from '../types';

const ICON_MAP: Record<string, React.ReactNode> = {
  'file-text': <FileText className="h-5 w-5 text-blue-500" />,
  'briefcase': <Briefcase className="h-5 w-5 text-amber-500" />,
  'receipt': <Receipt className="h-5 w-5 text-emerald-500" />,
  'shield-check': <ShieldCheck className="h-5 w-5 text-purple-500" />,
  'award': <Award className="h-5 w-5 text-indigo-500" />,
  'landmark': <Landmark className="h-5 w-5 text-rose-500" />,
};

export function DocumentCategoriesView() {
  const { categories, isLoading } = useDocumentCategories();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-foreground">Categorie Documentali</h3>
        <p className="text-xs text-muted-foreground">
          Classificazione gerarchica dei documenti per studenti, docenti, amministrazione e adempimenti fiscali/legali.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => {
          const dict = DOCUMENT_CATEGORY_DICTIONARY[cat.category_type];
          const iconNode = ICON_MAP[cat.icon] || <FileText className="h-5 w-5 text-blue-500" />;

          return (
            <Card key={cat.id} className="shadow-sm">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="p-2.5 bg-muted rounded-xl">{iconNode}</div>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    ID: {cat.category_type}
                  </Badge>
                </div>
                <CardTitle className="text-sm font-bold mt-2">{cat.name_it}</CardTitle>
                <CardDescription className="text-xs">{cat.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0 text-[11px] text-muted-foreground">
                <div className="flex justify-between items-center pt-3 border-t">
                  <span>En: <strong>{cat.name_en}</strong></span>
                  <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600">
                    Attivo
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

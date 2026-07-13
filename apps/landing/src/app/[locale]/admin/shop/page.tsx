import { createClient } from "@/lib/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/features/admin/components/DeleteButton";
import { AdminPagination } from "@/features/admin/components/AdminPagination";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import Link from "next/link";

export default async function AdminShopPage({ searchParams }: { searchParams: { page?: string, search?: string } }) {
  const supabase = createClient();
  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || "";
  const pageSize = 10;

  let query = (supabase.from("shop_items") as any).select("*", { count: "exact" });
  if (search) {
    query = query.ilike("title_it", `%${search}%`);
  }

  const { data: items, count } = await query
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="space-y-8 font-sans">
      <AdminPageHeader 
        title="Shop & Servizi"
        description="Gestisci i pacchetti di ore, traduzioni e altri servizi."
        searchPlaceholder="Cerca servizi..."
        addLink="?editType=shop_item&editId=new"
      />

      <div className="border border-border/50 rounded-2xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="font-semibold">Titolo</TableHead>
              <TableHead className="font-semibold">Categoria</TableHead>
              <TableHead className="font-semibold">Prezzo</TableHead>
              <TableHead className="font-semibold">Stato</TableHead>
              <TableHead className="text-right font-semibold">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items?.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/20">
                <TableCell className="font-medium">{item.title_it}</TableCell>
                <TableCell>
                  {item.category ? (
                    <Badge variant="outline" className="font-normal bg-accent">{item.category}</Badge>
                  ) : <span className="text-muted-foreground text-xs">--</span>}
                </TableCell>
                <TableCell>€{item.price}</TableCell>
                <TableCell>
                  <Badge variant={item.is_active ? "default" : "secondary"} className="shadow-none rounded-md px-2 py-0.5">
                    {item.is_active ? "Attivo" : "Nascosto"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`?editType=shop_item&editId=${item.id}`} scroll={false}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </Link>
                    <DeleteButton table="shop_items" id={item.id} itemName={`il servizio "${item.title_it}"`} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!items || items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                  Nessun servizio trovato.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <AdminPagination totalPages={totalPages} />
    </div>
  );
}

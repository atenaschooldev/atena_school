import { createClient } from "@/lib/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/features/admin/components/DeleteButton";
import { AdminPagination } from "@/features/admin/components/AdminPagination";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import Link from "next/link";

export default async function AdminBlogPage({ searchParams }: { searchParams: { page?: string, search?: string } }) {
  const supabase = createClient();
  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || "";
  const pageSize = 10;

  let query = (supabase.from("blog_posts") as any).select("*", { count: "exact" });
  if (search) {
    query = query.ilike("title_it", `%${search}%`);
  }

  const { data: posts, count } = await query
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="space-y-8 font-sans">
      <AdminPageHeader 
        title="Blog"
        description="Gestisci i post del blog della scuola."
        searchPlaceholder="Cerca articolo..."
        addLink="?editType=blog&editId=new"
      />

      <div className="border border-border/50 rounded-2xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="font-semibold">Titolo</TableHead>
              <TableHead className="font-semibold">Stato</TableHead>
              <TableHead className="font-semibold">Lettura (min)</TableHead>
              <TableHead className="text-right font-semibold">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts?.map((post) => (
              <TableRow key={post.id} className="hover:bg-muted/20">
                <TableCell className="font-medium">{post.title_it}</TableCell>
                <TableCell>
                  <Badge variant={post.is_active ? "default" : "secondary"} className="shadow-none rounded-md px-2 py-0.5">
                    {post.is_active ? "Attivo" : "Bozza"}
                  </Badge>
                </TableCell>
                <TableCell>-- min</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`?editType=blog&editId=${post.id}`} scroll={false}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </Link>
                    <DeleteButton table="blog_posts" id={post.id} itemName={`l'articolo "${post.title_it}"`} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!posts || posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-32 text-muted-foreground">
                  Nessun articolo trovato nell'archivio.
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

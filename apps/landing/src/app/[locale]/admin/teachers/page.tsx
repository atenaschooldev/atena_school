import { createClient } from "@/lib/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/features/admin/components/DeleteButton";
import { AdminPagination } from "@/features/admin/components/AdminPagination";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import Link from "next/link";

export default async function AdminTeachersPage({ searchParams }: { searchParams: { page?: string, search?: string } }) {
  const supabase = createClient();
  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || "";
  const pageSize = 10;

  let query = (supabase.from("profiles") as any).select("*", { count: "exact" }).eq("role", "teacher");
  if (search) {
    query = query.ilike("full_name", `%${search}%`);
  }

  const { data: teachers, count } = await query
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="space-y-8 font-sans">
      <AdminPageHeader 
        title="Insegnanti"
        description="Gestisci i profili degli insegnanti."
        searchPlaceholder="Cerca nome..."
        addLink="?editType=teacher&editId=new"
      />

      <div className="border border-border/50 rounded-2xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="font-semibold">Nome</TableHead>
              <TableHead className="font-semibold">Ruolo</TableHead>
              <TableHead className="text-right font-semibold">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers?.map((teacher) => (
              <TableRow key={teacher.id} className="hover:bg-muted/20">
                <TableCell className="font-medium">{teacher.full_name || "Senza Nome"}</TableCell>
                <TableCell>
                  <Badge variant="default" className="shadow-none rounded-md px-2 py-0.5">
                    {teacher.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`?editType=teacher&editId=${teacher.id}`} scroll={false}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </Link>
                    <DeleteButton table="profiles" id={teacher.id} itemName={`l'insegnante "${teacher.full_name}"`} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!teachers || teachers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-32 text-muted-foreground">
                  Nessun insegnante trovato.
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

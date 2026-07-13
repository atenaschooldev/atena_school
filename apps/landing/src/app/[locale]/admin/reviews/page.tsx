import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPagination } from "@/features/admin/components/AdminPagination";
import { AdminSearch } from "@/features/admin/components/AdminSearch";
import { ReviewsTableClient } from "@/features/reviews/components/ReviewsTableClient";

export default async function AdminReviewsPage({ searchParams }: { searchParams: { page?: string, search?: string } }) {
  const supabase = createClient();
  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || "";
  const pageSize = 10;

  let query = supabase.from("course_reviews").select("*, courses(title_it)", { count: "exact" });
  if (search) {
    query = query.ilike("student_name", `%${search}%`);
  }

  const { data: reviews, count } = await query
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight mb-1 text-foreground">Recensioni</h2>
          <p className="text-muted-foreground text-sm max-w-xl leading-relaxed">
            Modera le recensioni degli studenti.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AdminSearch placeholder="Cerca studente..." />
          <Link href="?editType=review&editId=new" scroll={false}>
            <Button className="shrink-0 rounded-full font-bold shadow-md hover:scale-105 transition-transform h-10 px-5 bg-foreground text-background hover:bg-primary">
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi
            </Button>
          </Link>
        </div>
      </div>

      <ReviewsTableClient reviews={reviews || []} />
      
      <AdminPagination totalPages={totalPages} />
    </div>
  );
}

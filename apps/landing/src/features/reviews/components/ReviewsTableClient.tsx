"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/features/admin/components/DeleteButton";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function ReviewsTableClient({ reviews }: { reviews: any[] }) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const toggleAll = () => {
    if (selectedIds.size === reviews.length && reviews.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(reviews.map((r) => r.id)));
    }
  };

  const toggleOne = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Sei sicuro di voler eliminare ${selectedIds.size} recension${selectedIds.size > 1 ? "i" : "e"}? Questa azione è irreversibile.`)) return;

    setIsDeleting(true);
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("course_reviews")
        .delete()
        .in("id", Array.from(selectedIds));

      if (error) throw error;

      setSelectedIds(new Set());
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Errore durante l'eliminazione.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center min-h-[40px]">
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 bg-destructive/10 text-destructive rounded-lg font-medium border border-destructive/20 animate-in fade-in slide-in-from-top-2">
            <span className="text-sm">{selectedIds.size} selezionat{selectedIds.size > 1 ? "e" : "a"}</span>
            <div className="w-[1px] h-4 bg-destructive/20" />
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className="h-7 text-xs px-2 shadow-none"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              {isDeleting ? "Eliminazione..." : "Elimina"}
            </Button>
          </div>
        )}
      </div>

      <div className="border border-border/50 rounded-2xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-12 text-center px-4">
                <Checkbox
                  checked={reviews.length > 0 && selectedIds.size === reviews.length}
                  onCheckedChange={toggleAll}
                  aria-label="Seleziona tutte"
                />
              </TableHead>
              <TableHead className="font-semibold">Studente</TableHead>
              <TableHead className="font-semibold">Corso</TableHead>
              <TableHead className="font-semibold">Voto</TableHead>
              <TableHead className="font-semibold">Stato</TableHead>
              <TableHead className="text-right font-semibold">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews?.map((review) => {
              const course = review.courses as any;
              const name = review.student_name || "Anonimo";
              const courseTitle = course?.title_it || "Sconosciuto";
              const isSelected = selectedIds.has(review.id);

              return (
                <TableRow key={review.id} className={`hover:bg-muted/20 transition-colors ${isSelected ? "bg-muted/30" : ""}`}>
                  <TableCell className="text-center px-4">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleOne(review.id)}
                      aria-label={`Seleziona recensione ${review.id}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{name}</TableCell>
                  <TableCell>{courseTitle}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="font-bold mr-1">{review.rating}</span>/ 5
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={review.is_active ? "default" : "secondary"} className="shadow-none rounded-md px-2 py-0.5">
                      {review.is_active ? "Pubblicata" : "Nascosta"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`?editType=review&editId=${review.id}`} scroll={false}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </Link>
                      <DeleteButton table="course_reviews" id={review.id} itemName={`la recensione di "${name}"`} />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {!reviews || reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                  Nessuna recensione trovata.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

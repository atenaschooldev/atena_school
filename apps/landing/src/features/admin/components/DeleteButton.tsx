"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DeleteButtonProps {
  table: string;
  id: string;
  itemName?: string;
}

export function DeleteButton({ table, id, itemName = "questo elemento" }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Sei sicuro di voler eliminare definitivamente ${itemName}? Questa azione non può essere annullata.`)) {
      return;
    }

    setIsDeleting(true);
    const supabase = createClient();
    
    try {
      const { error } = await supabase.from(table).delete().eq("id", id);
      
      if (error) throw error;
      
      toast.success("Elemento eliminato con successo.");
      router.refresh();
      
    } catch (error: any) {
      toast.error("Errore durante l'eliminazione: " + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      disabled={isDeleting}
      onClick={handleDelete}
      title="Elimina"
      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
    >
      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </Button>
  );
}

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  bucket: string;
}

export function ImageUpload({ value, onChange, bucket }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onChange(publicUrl);
      toast.success("Immagine caricata");
    } catch (error: any) {
      toast.error("Errore durante il caricamento: " + error.message);
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {value ? (
        <div className="relative w-full h-48 border rounded-lg overflow-hidden group">
          <Image 
            src={value} 
            alt="Upload limit" 
            fill 
            className="object-cover" 
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button 
              type="button" 
              variant="destructive" 
              size="icon" 
              onClick={() => onChange("")}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-muted-foreground w-full bg-muted/20 hover:bg-muted/50 transition-colors">
          {isUploading ? (
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          ) : (
            <>
              <Upload className="w-8 h-8 mb-4 opacity-50" />
              <p className="font-medium text-sm">Trascina o clicca per caricare</p>
              <p className="text-xs opacity-70 mt-1 max-w-[200px] text-center">Supporta JPG, PNG, WEBP (Max 5MB)</p>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            onChange={handleUpload}
            disabled={isUploading}
          />
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useTranslation } from "@/i18n/context";
import {
  Upload,
  Crop,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Check,
  RefreshCw,
  Image as ImageIcon,
  Sparkles,
  Layers,
} from "lucide-react";

export interface ImageCropperDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageUploaded: (url: string) => void;
  initialImageUrl?: string;
  defaultAspectRatio?: number; // e.g., 16/9
  fileNamePrefix?: string;
}

type AspectRatioMode = "16:9" | "4:3" | "1:1" | "free";

export function ImageCropperDialog({
  open,
  onOpenChange,
  onImageUploaded,
  initialImageUrl,
  defaultAspectRatio = 16 / 9,
  fileNamePrefix = "course_cover",
}: ImageCropperDialogProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [imageSrc, setImageSrc] = useState<string | null>(initialImageUrl || null);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [aspectRatioMode, setAspectRatioMode] = useState<AspectRatioMode>("16:9");
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);

  // Crop box state (in normalized percentages of canvas preview 0..1)
  const [cropBox, setCropBox] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 0.05,
    y: 0.1,
    width: 0.9,
    height: 0.8,
  });

  const [isInteracting, setIsInteracting] = useState<"drag" | "resize-se" | "resize-sw" | "resize-ne" | "resize-nw" | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; cropX: number; cropY: number; cropW: number; cropH: number }>({
    x: 0,
    y: 0,
    cropX: 0,
    cropY: 0,
    cropW: 0,
    cropH: 0,
  });

  // Load image element when imageSrc changes
  useEffect(() => {
    if (!imageSrc) {
      setImageObj(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImageObj(img);
      resetCrop(img, aspectRatioMode);
    };
    img.onerror = () => {
      toast.error("Impossibile caricare l'anteprima dell'immagine.");
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const getTargetAspect = useCallback((mode: AspectRatioMode): number | null => {
    switch (mode) {
      case "16:9":
        return 16 / 9;
      case "4:3":
        return 4 / 3;
      case "1:1":
        return 1;
      case "free":
      default:
        return null;
    }
  }, []);

  const resetCrop = useCallback((img: HTMLImageElement, mode: AspectRatioMode) => {
    setZoom(1);
    setRotation(0);
    const aspect = getTargetAspect(mode);
    if (!aspect) {
      setCropBox({ x: 0.05, y: 0.05, width: 0.9, height: 0.9 });
      return;
    }

    const imgAspect = img.width / img.height;
    let w = 0.85;
    let h = (w * imgAspect) / aspect;

    if (h > 0.85) {
      h = 0.85;
      w = (h * aspect) / imgAspect;
    }

    w = Math.min(0.95, Math.max(0.2, w));
    h = Math.min(0.95, Math.max(0.2, h));

    const x = Math.max(0, (1 - w) / 2);
    const y = Math.max(0, (1 - h) / 2);
    setCropBox({ x, y, width: w, height: h });
  }, [getTargetAspect]);

  const handleAspectRatioChange = (mode: AspectRatioMode) => {
    setAspectRatioMode(mode);
    if (imageObj) {
      resetCrop(imageObj, mode);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Seleziona un file immagine valido (PNG, JPG, WebP, etc.)");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("L'immagine supera il limite di 20MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImageSrc(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Draw preview canvas
  useEffect(() => {
    if (!canvasRef.current || !imageObj) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 600;
    const height = 400;
    canvas.width = width;
    canvas.height = height;

    // Clear
    ctx.fillStyle = "#09090b";
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Maintain aspect ratio inside canvas preview
    const scale = Math.min((width * 0.9) / imageObj.width, (height * 0.9) / imageObj.height);
    const drawW = imageObj.width * scale;
    const drawH = imageObj.height * scale;

    ctx.drawImage(imageObj, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }, [imageObj, zoom, rotation]);

  // Crop Box Mouse Interactivity
  const handleMouseDown = (e: React.MouseEvent, type: "drag" | "resize-se" | "resize-sw" | "resize-ne" | "resize-nw") => {
    e.preventDefault();
    e.stopPropagation();
    setIsInteracting(type);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      cropX: cropBox.x,
      cropY: cropBox.y,
      cropW: cropBox.width,
      cropH: cropBox.height,
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isInteracting || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = (e.clientX - dragStart.x) / rect.width;
    const dy = (e.clientY - dragStart.y) / rect.height;

    const targetAspect = getTargetAspect(aspectRatioMode);

    if (isInteracting === "drag") {
      const newX = Math.max(0, Math.min(1 - dragStart.cropW, dragStart.cropX + dx));
      const newY = Math.max(0, Math.min(1 - dragStart.cropH, dragStart.cropY + dy));
      setCropBox((prev) => ({ ...prev, x: newX, y: newY }));
    } else if (isInteracting === "resize-se") {
      let newW = Math.max(0.15, Math.min(1 - dragStart.cropX, dragStart.cropW + dx));
      let newH = Math.max(0.15, Math.min(1 - dragStart.cropY, dragStart.cropH + dy));
      if (targetAspect) {
        const rectAspect = rect.width / rect.height;
        newH = (newW * rectAspect) / targetAspect;
        if (dragStart.cropY + newH > 1) {
          newH = 1 - dragStart.cropY;
          newW = (newH * targetAspect) / rectAspect;
        }
      }
      setCropBox((prev) => ({ ...prev, width: newW, height: newH }));
    }
  }, [isInteracting, dragStart, aspectRatioMode, getTargetAspect]);

  const handleMouseUp = useCallback(() => {
    setIsInteracting(null);
  }, []);

  useEffect(() => {
    if (isInteracting) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isInteracting, handleMouseMove, handleMouseUp]);

  // Export cropped image and upload to Supabase
  const handleApplyAndUpload = async () => {
    if (!imageObj) {
      toast.error("Nessuna immagine selezionata da caricare.");
      return;
    }

    try {
      setIsUploading(true);
      const exportCanvas = document.createElement("canvas");
      const exportCtx = exportCanvas.getContext("2d");
      if (!exportCtx) throw new Error("Canvas context creation failed");

      // Set clean export resolution (e.g. 1280x720 for 16:9)
      const targetAspect = getTargetAspect(aspectRatioMode) || (cropBox.width / cropBox.height);
      const targetWidth = 1280;
      const targetHeight = Math.round(targetWidth / targetAspect);

      exportCanvas.width = targetWidth;
      exportCanvas.height = targetHeight;

      // Draw high-quality cropped section
      exportCtx.imageSmoothingEnabled = true;
      exportCtx.imageSmoothingQuality = "high";

      // Calculate source image crop coordinates
      const previewCanvas = canvasRef.current;
      if (!previewCanvas) throw new Error("Preview canvas not ready");

      // Render image with transformations on high-res virtual canvas
      const virtCanvas = document.createElement("canvas");
      const virtCtx = virtCanvas.getContext("2d");
      if (!virtCtx) throw new Error("Virtual canvas creation failed");

      virtCanvas.width = previewCanvas.width;
      virtCanvas.height = previewCanvas.height;

      virtCtx.save();
      virtCtx.translate(virtCanvas.width / 2, virtCanvas.height / 2);
      virtCtx.rotate((rotation * Math.PI) / 180);
      virtCtx.scale(zoom, zoom);

      const scale = Math.min((virtCanvas.width * 0.9) / imageObj.width, (virtCanvas.height * 0.9) / imageObj.height);
      const drawW = imageObj.width * scale;
      const drawH = imageObj.height * scale;
      virtCtx.drawImage(imageObj, -drawW / 2, -drawH / 2, drawW, drawH);
      virtCtx.restore();

      // Copy crop box area from virtual canvas to export canvas
      const srcX = cropBox.x * virtCanvas.width;
      const srcY = cropBox.y * virtCanvas.height;
      const srcW = cropBox.width * virtCanvas.width;
      const srcH = cropBox.height * virtCanvas.height;

      exportCtx.drawImage(
        virtCanvas,
        srcX,
        srcY,
        srcW,
        srcH,
        0,
        0,
        targetWidth,
        targetHeight
      );

      // Convert to WebP base64
      const webpBase64 = exportCanvas.toDataURL("image/webp", 0.92);

      // Upload via backend endpoint to Supabase Storage
      const res = await api.post<{ url: string; filename: string }>("/admin/courses/upload-image", {
        fileName: fileNamePrefix,
        fileBase64: webpBase64,
        contentType: "image/webp",
      });

      if (res?.url) {
        toast.success("Immagine di copertina caricata con successo su Supabase Storage!");
        onImageUploaded(res.url);
        onOpenChange(false);
      } else {
        throw new Error("Risposta non valida dal server");
      }
    } catch (err: any) {
      console.error("Failed to upload image:", err);
      toast.error(`Errore nel caricamento dell'immagine: ${err?.message || "Errore sconosciuto"}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px] max-h-[92vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Crop className="h-4 w-4 text-primary" />
            {t("courses.editPhotoTitle") || "Carica & Ritaglia Immagine di Copertina"}
          </DialogTitle>
        </DialogHeader>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileSelect(e.target.files[0]);
            }
          }}
        />

        {!imageSrc ? (
          /* Empty Dropzone State */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingFile(true);
            }}
            onDragLeave={() => setIsDraggingFile(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              isDraggingFile
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/60 hover:bg-muted/30 bg-muted/15"
            }`}
          >
            <div className="p-4 rounded-2xl bg-primary/10 text-primary mb-3 shadow-2xs">
              <Upload className="h-7 w-7" />
            </div>
            <p className="text-sm font-bold text-foreground">
              Trascina qui l'immagine o clicca per sfogliare
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Supporta JPG, PNG, WebP, AVIF fino a 20MB. Potrai ritagliare e regolare l'immagine prima di salvarla.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4 text-xs font-semibold cursor-pointer rounded-xl gap-1.5"
            >
              <Upload className="h-3.5 w-3.5" />
              Seleziona dal Computer
            </Button>
          </div>
        ) : (
          /* Interactive Editor Workspace */
          <div className="space-y-4">
            {/* Top Toolbar: Aspect Ratio & Change File */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border/60">
                <span className="text-[11px] font-semibold text-muted-foreground px-2">Formato:</span>
                {(["16:9", "4:3", "1:1", "free"] as AspectRatioMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleAspectRatioChange(mode)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      aspectRatioMode === mode
                        ? "bg-background text-foreground shadow-2xs border border-border"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {mode === "16:9" ? "16:9 (Consigliato)" : mode === "free" ? "Libero" : mode}
                  </button>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold rounded-xl cursor-pointer gap-1.5 h-8"
              >
                <Upload className="h-3.5 w-3.5" />
                Cambia File
              </Button>
            </div>

            {/* Interactive Crop Preview Canvas */}
            <div
              ref={containerRef}
              className="relative w-full aspect-[3/2] max-h-[360px] bg-black rounded-2xl overflow-hidden border border-border shadow-inner select-none flex items-center justify-center cursor-crosshair"
            >
              <canvas ref={canvasRef} className="w-full h-full object-contain pointer-events-none" />

              {/* Dark Overlay Outside Crop Box */}
              <div
                className="absolute inset-0 bg-black/60 pointer-events-none"
                style={{
                  clipPath: `polygon(
                    0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%,
                    ${cropBox.x * 100}% ${cropBox.y * 100}%,
                    ${(cropBox.x + cropBox.width) * 100}% ${cropBox.y * 100}%,
                    ${(cropBox.x + cropBox.width) * 100}% ${(cropBox.y + cropBox.height) * 100}%,
                    ${cropBox.x * 100}% ${(cropBox.y + cropBox.height) * 100}%,
                    ${cropBox.x * 100}% ${cropBox.y * 100}%
                  )`,
                }}
              />

              {/* Movable & Resizable Crop Rectangle */}
              <div
                onMouseDown={(e) => handleMouseDown(e, "drag")}
                className="absolute border-2 border-primary shadow-lg cursor-move"
                style={{
                  left: `${cropBox.x * 100}%`,
                  top: `${cropBox.y * 100}%`,
                  width: `${cropBox.width * 100}%`,
                  height: `${cropBox.height * 100}%`,
                }}
              >
                {/* Crosshair grid lines */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none border border-primary/30">
                  <div className="border-r border-b border-primary/20" />
                  <div className="border-r border-b border-primary/20" />
                  <div className="border-b border-primary/20" />
                  <div className="border-r border-b border-primary/20" />
                  <div className="border-r border-b border-primary/20" />
                  <div className="border-b border-primary/20" />
                  <div className="border-r border-primary/20" />
                  <div className="border-r border-primary/20" />
                  <div />
                </div>

                {/* Corner Resize Handles */}
                <div
                  onMouseDown={(e) => handleMouseDown(e, "resize-se")}
                  className="absolute -right-2 -bottom-2 w-4 h-4 bg-primary border-2 border-background rounded-full cursor-se-resize shadow-md"
                />
              </div>
            </div>

            {/* Adjustments: Zoom & Rotate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-3 rounded-xl border border-border/60">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <ZoomIn className="h-3.5 w-3.5 text-muted-foreground" />
                    Zoom ({Math.round(zoom * 100)}%)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0.8}
                    max={2.5}
                    step={0.05}
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 sm:pt-0">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Rotazione</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="h-8 text-xs font-semibold rounded-lg gap-1.5 cursor-pointer"
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                      Ruota 90° ({rotation}°)
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => imageObj && resetCrop(imageObj, aspectRatioMode)}
                      className="h-8 text-xs font-medium text-muted-foreground cursor-pointer"
                    >
                      Ripristina
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 pt-2 border-t border-border/50">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-xs font-medium rounded-xl cursor-pointer"
          >
            {t("common.cancel") || "Annulla"}
          </Button>
          <Button
            type="button"
            disabled={!imageSrc || isUploading}
            onClick={handleApplyAndUpload}
            className="text-xs font-bold rounded-xl cursor-pointer gap-1.5 shadow-xs"
          >
            {isUploading ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Caricamento su Supabase...
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                Applica & Carica Copertina
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

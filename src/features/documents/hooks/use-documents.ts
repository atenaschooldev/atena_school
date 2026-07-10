import { useState, useMemo, useRef, useEffect } from "react";
import { useAppStore } from "@/stores/app-store";
import { toast } from "sonner";
import { formatDateSafe } from "@/lib/utils";
import { it } from "date-fns/locale";
import type { DocumentRecord } from "../types";

export function useDocuments() {
  const documents = useAppStore((s) => s.documents);
  const addDocument = useAppStore((s) => s.addDocument);

  const [viewMode, setViewMode] = useState<"list" | "create" | "view">("list");
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Form states
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [dataIscrizione, setDataIscrizione] = useState(new Date().toISOString().slice(0, 10));
  const [genitoreNome, setGenitoreNome] = useState("");
  const [genitoreCognome, setGenitoreCognome] = useState("");
  const [signatureData, setSignatureData] = useState<string | undefined>(undefined);

  // Canvas drawing ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Set up canvas stroke styles
  useEffect(() => {
    if (viewMode !== "create") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#0f172a"; // slate-900
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [viewMode]);

  // Reset form when opening creation
  const handleOpenCreate = () => {
    setNome("");
    setCognome("");
    setEmail("");
    setTelefono("");
    setDataIscrizione(new Date().toISOString().slice(0, 10));
    setGenitoreNome("");
    setGenitoreCognome("");
    setSignatureData(undefined);
    setSelectedDoc(null);
    setViewMode("create");
  };

  // Open existing document in view-only mode
  const handleViewDoc = (doc: DocumentRecord) => {
    setSelectedDoc(doc);
    setNome(doc.studentName);
    setCognome(doc.studentLastName);
    setEmail(doc.email);
    setTelefono(doc.telefono);
    setDataIscrizione(doc.dataIscrizione);
    setGenitoreNome(doc.genitoreName);
    setGenitoreCognome(doc.genitoreLastName);
    setSignatureData(doc.signature);
    setViewMode("view");
  };

  // Canvas Mouse events
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureData(canvas.toDataURL());
    }
  };

  // Canvas Touch events for tablet/mobile
  const startDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((touch.clientY - rect.top) / rect.height) * canvas.height;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const drawTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((touch.clientY - rect.top) / rect.height) * canvas.height;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData(undefined);
  };

  // Save document handler
  const handleSave = () => {
    if (!nome || !cognome || !email || !telefono || !genitoreNome || !genitoreCognome) {
      toast.error("Compila tutti i campi richiesti!");
      return;
    }
    if (!signatureData) {
      toast.error("La firma è obbligatoria per stipulare il contratto!");
      return;
    }

    addDocument({
      studentName: nome,
      studentLastName: cognome,
      email,
      telefono,
      dataIscrizione,
      genitoreName: genitoreNome,
      genitoreLastName: genitoreCognome,
      signature: signatureData,
    });

    toast.success("Contratto salvato con successo!");
    setViewMode("list");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link del contratto copiato negli appunti!");
  };

  const handleDownloadMock = () => {
    toast.info("Generazione del file PDF in corso...");
    setTimeout(() => {
      const link = document.createElement("a");
      link.href = signatureData || "#";
      link.download = `contratto_${nome}_${cognome}.png`;
      toast.success("Contratto scaricato correttamente!");
    }, 1000);
  };

  const formattedIscrizioneDate = useMemo(() => {
    return formatDateSafe(dataIscrizione, "dd MMMM yyyy", { locale: it });
  }, [dataIscrizione]);

  const formattedDocDate = useMemo(() => {
    if (selectedDoc) {
      return formatDateSafe(selectedDoc.createdAt, "dd/MM/yyyy");
    }
    return formatDateSafe(new Date(), "dd/MM/yyyy");
  }, [selectedDoc]);

  return {
    documents,
    viewMode,
    setViewMode,
    selectedDoc,
    zoomScale,
    setZoomScale,
    previewDoc,
    setPreviewDoc,
    previewOpen,
    setPreviewOpen,
    nome,
    setNome,
    cognome,
    setCognome,
    email,
    setEmail,
    telefono,
    setTelefono,
    dataIscrizione,
    setDataIscrizione,
    genitoreNome,
    setGenitoreNome,
    genitoreCognome,
    setGenitoreCognome,
    signatureData,
    canvasRef,
    handleOpenCreate,
    handleViewDoc,
    startDrawing,
    draw,
    stopDrawing,
    startDrawingTouch,
    drawTouch,
    clearCanvas,
    handleSave,
    handlePrint,
    handleShare,
    handleDownloadMock,
    formattedIscrizioneDate,
    formattedDocDate,
  };
}

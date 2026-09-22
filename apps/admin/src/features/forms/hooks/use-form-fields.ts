import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useTranslation } from "@/i18n/context";
import type {
  FormFieldItem,
  CreateFormFieldDto,
  UpdateFormFieldDto,
} from "../types";

export const DEFAULT_FORM_FIELDS_FALLBACK: FormFieldItem[] = [
  { id: 'f-1', key: 'purchaser_first_name', label_it: 'Nome Acquirente', label_en: 'Purchaser First Name', placeholder_it: 'es. Mario', placeholder_en: 'e.g. John', field_type: 'text', target: 'purchaser', is_system: true, is_required_default: true, sort_order: 10, options: [] },
  { id: 'f-2', key: 'purchaser_last_name', label_it: 'Cognome Acquirente', label_en: 'Purchaser Last Name', placeholder_it: 'es. Rossi', placeholder_en: 'e.g. Doe', field_type: 'text', target: 'purchaser', is_system: true, is_required_default: true, sort_order: 20, options: [] },
  { id: 'f-3', key: 'purchaser_email', label_it: 'Email Acquirente', label_en: 'Purchaser Email', placeholder_it: 'mario.rossi@email.com', placeholder_en: 'john.doe@email.com', field_type: 'email', target: 'purchaser', is_system: true, is_required_default: true, sort_order: 30, options: [] },
  { id: 'f-4', key: 'purchaser_phone', label_it: 'Telefono Acquirente', label_en: 'Purchaser Phone', placeholder_it: '+39 333 1234567', placeholder_en: '+1 555 123456', field_type: 'phone', target: 'purchaser', is_system: true, is_required_default: true, sort_order: 40, options: [] },
  { id: 'f-5', key: 'purchaser_tax_code', label_it: 'Codice Fiscale Acquirente', label_en: 'Purchaser Tax Code', placeholder_it: 'RSSMRA80A01H501U', placeholder_en: 'Tax Code', field_type: 'text', target: 'purchaser', is_system: true, is_required_default: true, sort_order: 50, options: [] },
  { id: 'f-6', key: 'purchaser_address', label_it: 'Indirizzo di Residenza', label_en: 'Residential Address', placeholder_it: 'Via Roma 10, Milano', placeholder_en: '123 Main St', field_type: 'text', target: 'purchaser', is_system: false, is_required_default: false, sort_order: 60, options: [] },
  { id: 'f-7', key: 'sdi_code', label_it: 'Codice SDI / PEC', label_en: 'SDI Code / PEC', placeholder_it: 'M5UXCR1 o pec@email.it', placeholder_en: 'SDI code', field_type: 'text', target: 'purchaser', is_system: false, is_required_default: false, sort_order: 70, options: [] },
  { id: 'f-8', key: 'student_first_name', label_it: 'Nome Studente', label_en: 'Student First Name', placeholder_it: 'es. Luca', placeholder_en: 'e.g. Alex', field_type: 'text', target: 'student', is_system: true, is_required_default: true, sort_order: 100, options: [] },
  { id: 'f-9', key: 'student_last_name', label_it: 'Cognome Studente', label_en: 'Student Last Name', placeholder_it: 'es. Rossi', placeholder_en: 'e.g. Doe', field_type: 'text', target: 'student', is_system: true, is_required_default: true, sort_order: 110, options: [] },
  { id: 'f-10', key: 'student_birth_date', label_it: 'Data di Nascita Studente', label_en: 'Student Birth Date', placeholder_it: 'GG/MM/AAAA', placeholder_en: 'DD/MM/YYYY', field_type: 'date', target: 'student', is_system: true, is_required_default: true, sort_order: 120, options: [] },
  { id: 'f-11', key: 'student_tax_code', label_it: 'Codice Fiscale Studente', label_en: 'Student Tax Code', placeholder_it: 'RSSLCA10A01H501U', placeholder_en: 'Student Fiscal Code', field_type: 'text', target: 'student', is_system: true, is_required_default: true, sort_order: 130, options: [] },
  { id: 'f-12', key: 'study_level', label_it: 'Livello Linguistico di Partenza', label_en: 'Starting Language Level', placeholder_it: 'Seleziona livello', placeholder_en: 'Select level', field_type: 'select', target: 'student', is_system: false, is_required_default: false, sort_order: 140, options: [{label:'Principiante (A1)',value:'A1'},{label:'Elementare (A2)',value:'A2'},{label:'Intermedio (B1)',value:'B1'},{label:'Avanzato (B2/C1)',value:'B2'}] },
  { id: 'f-13', key: 'heard_from', label_it: 'Come ci hai conosciuto?', label_en: 'How did you hear about us?', placeholder_it: 'Seleziona canale', placeholder_en: 'Select channel', field_type: 'select', target: 'booking', is_system: false, is_required_default: false, sort_order: 200, options: [{label:'Passaparola',value:'word_of_mouth'},{label:'Social Network',value:'social'},{label:'Google',value:'google'},{label:'Altro',value:'other'}] },
  { id: 'f-14', key: 'special_requests', label_it: 'Note o Richieste Particolari', label_en: 'Special Requests / Notes', placeholder_it: 'Eventuali preferenze...', placeholder_en: 'Preferences...', field_type: 'textarea', target: 'booking', is_system: false, is_required_default: false, sort_order: 210, options: [] },
  { id: 'f-15', key: 'contact_name', label_it: 'Nome e Cognome Contatto', label_en: 'Contact Full Name', placeholder_it: 'es. Mario Rossi', placeholder_en: 'e.g. John Doe', field_type: 'text', target: 'contact', is_system: true, is_required_default: true, sort_order: 300, options: [] },
  { id: 'f-16', key: 'contact_email', label_it: 'Email di Contatto', label_en: 'Contact Email', placeholder_it: 'mario.rossi@email.com', placeholder_en: 'john.doe@email.com', field_type: 'email', target: 'contact', is_system: true, is_required_default: true, sort_order: 310, options: [] },
  { id: 'f-17', key: 'contact_phone', label_it: 'Telefono di Contatto', label_en: 'Contact Phone', placeholder_it: '+39 333 1234567', placeholder_en: '+1 555 123456', field_type: 'phone', target: 'contact', is_system: true, is_required_default: false, sort_order: 320, options: [] },
  { id: 'f-18', key: 'contact_subject', label_it: 'Oggetto Richiesta', label_en: 'Inquiry Subject', placeholder_it: 'es. Informazioni corsi', placeholder_en: 'e.g. Inquiries', field_type: 'text', target: 'contact', is_system: true, is_required_default: true, sort_order: 330, options: [] },
  { id: 'f-19', key: 'contact_message', label_it: 'Messaggio', label_en: 'Message', placeholder_it: 'Scrivi qui il messaggio...', placeholder_en: 'Type message...', field_type: 'textarea', target: 'contact', is_system: true, is_required_default: true, sort_order: 340, options: [] },
];

export function useFormFields(filter?: { target?: string; is_system?: boolean }) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const queryKey = ["form-fields", filter?.target, filter?.is_system];

  const {
    data: fields = DEFAULT_FORM_FIELDS_FALLBACK,
    isLoading,
    refetch,
  } = useQuery<FormFieldItem[]>({
    queryKey,
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (filter?.target && filter.target !== 'all') params.set("target", filter.target);
        if (typeof filter?.is_system === "boolean") params.set("is_system", String(filter.is_system));
        const queryString = params.toString() ? `?${params.toString()}` : "";
        const data = await apiFetch<FormFieldItem[]>(`/admin/forms/fields${queryString}`);
        return Array.isArray(data) && data.length > 0 ? data : DEFAULT_FORM_FIELDS_FALLBACK;
      } catch (err) {
        return DEFAULT_FORM_FIELDS_FALLBACK;
      }
    },
    staleTime: 1000 * 30,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: CreateFormFieldDto) => {
      return apiFetch<FormFieldItem>("/admin/forms/fields", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      toast.success(t("forms.fields.createSuccess") || "Campo creato con successo");
      queryClient.invalidateQueries({ queryKey: ["form-fields"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || t("forms.fields.createError") || "Errore durante la creazione del campo");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateFormFieldDto }) => {
      return apiFetch<FormFieldItem>(`/admin/forms/fields/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      toast.success(t("forms.fields.updateSuccess") || "Campo aggiornato con successo");
      queryClient.invalidateQueries({ queryKey: ["form-fields"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || t("forms.fields.updateError") || "Errore durante l'aggiornamento del campo");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiFetch<{ success: boolean; id: string }>(`/admin/forms/fields/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast.success(t("forms.fields.deleteSuccess") || "Campo eliminato con successo");
      queryClient.invalidateQueries({ queryKey: ["form-fields"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || t("forms.fields.deleteError") || "Errore durante l'eliminazione del campo");
    },
  });

  return {
    fields,
    isLoading,
    refetch,
    createField: (payload: CreateFormFieldDto) => createMutation.mutateAsync(payload),
    updateField: (id: string, payload: UpdateFormFieldDto) =>
      updateMutation.mutateAsync({ id, payload }),
    deleteField: (id: string) => deleteMutation.mutateAsync(id),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

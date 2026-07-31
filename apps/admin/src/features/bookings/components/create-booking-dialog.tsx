"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCourses } from "@/features/courses/hooks/use-courses";

const createBookingSchema = z.object({
  courseId: z.string().optional(),
  courseName: z.string().min(2, { message: "Inserisci il nome del corso." }),
  purchaserName: z.string().min(2, { message: "Inserisci il nome del cliente." }),
  purchaserEmail: z.string().email({ message: "Email non valida." }),
  purchaserPhone: z.string().optional(),
  studentName: z.string().optional(),
  amountPaid: z.coerce.number().min(0),
  paymentStatus: z.string().min(1),
  paymentMethod: z.string().min(1),
});

type CreateBookingValues = z.infer<typeof createBookingSchema>;

interface CreateBookingDialogProps {
  onCreateBooking: (values: CreateBookingValues) => Promise<unknown>;
}

export function CreateBookingDialog({ onCreateBooking }: CreateBookingDialogProps) {
  const [open, setOpen] = useState(false);
  const { coursesList } = useCourses();

  const form = useForm<CreateBookingValues>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      courseId: "",
      courseName: "",
      purchaserName: "",
      purchaserEmail: "",
      purchaserPhone: "",
      studentName: "",
      amountPaid: 0,
      paymentStatus: "reserved",
      paymentMethod: "cash",
    },
  });

  const handleCourseChange = (courseId: string) => {
    const found = coursesList.find((c) => c.id === courseId);
    if (found) {
      form.setValue("courseId", found.id);
      form.setValue("courseName", found.nome);
      if (found.prezzo) {
        form.setValue("amountPaid", Number(found.prezzo));
      }
    }
  };

  async function onSubmit(data: CreateBookingValues) {
    try {
      await onCreateBooking(data);
      form.reset();
      setOpen(false);
    } catch {
      // Handled in parent
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          Nuova Prenotazione
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuova Prenotazione Manuale</DialogTitle>
          <DialogDescription>
            Registra una nuova iscrizione o ordine effettuato in sede.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seleziona Corso</FormLabel>
                  <Select onValueChange={(val) => { field.onChange(val); handleCourseChange(val); }} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="cursor-pointer w-full">
                        <SelectValue placeholder="Seleziona corso esistente..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {coursesList.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nome} (€{c.prezzo})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="courseName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Corso / Servizio</FormLabel>
                  <FormControl>
                    <Input placeholder="Es. Inglese B1 Individuale" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="purchaserName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente / Genitore</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome Cognome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="studentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Studente (se diverso)</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome Studente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="purchaserEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@esempio.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purchaserPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefono</FormLabel>
                    <FormControl>
                      <Input placeholder="+39 333..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="amountPaid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Importo (€)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stato Pagamento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="reserved">Da Saldare</SelectItem>
                        <SelectItem value="completed">Pagato</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metodo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Contanti</SelectItem>
                        <SelectItem value="pos">POS / Carta</SelectItem>
                        <SelectItem value="transfer">Bonifico</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit" className="cursor-pointer">
                Registra Ordine
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

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
import type { UserFormValues } from "@/features/users/types";

const userFormSchema = z.object({
  firstName: z.string().min(2, { message: "Nome richiesto (min 2 caract)." }),
  lastName: z.string().min(2, { message: "Cognome richiesto (min 2 caract)." }),
  email: z.string().email({ message: "Inserisci un email valida." }),
  role: z.string().min(1, { message: "Seleziona un ruolo." }),
  password: z.string().optional(),
});

interface UserFormDialogProps {
  onAddUser: (user: UserFormValues) => Promise<unknown>;
}

export function UserFormDialog({ onAddUser }: UserFormDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "student",
      password: "",
    },
  });

  const onSubmit = async (data: UserFormValues) => {
    try {
      await onAddUser(data);
      form.reset();
      setOpen(false);
    } catch {
      // Handled in caller
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer font-medium shadow-sm text-xs">
          <Plus className="mr-1.5 h-4 w-4" /> Nuovo Utente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nuovo Utente</DialogTitle>
          <DialogDescription>
            Inserisci i dettagli per creare un nuovo profilo utente a sistema.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="es. Mario" className="h-9 text-xs" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Cognome</FormLabel>
                    <FormControl>
                      <Input placeholder="es. Rossi" className="h-9 text-xs" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Email</FormLabel>
                  <FormControl>
                    <Input placeholder="mario.rossi@example.com" className="h-9 text-xs" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Ruolo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-9 text-xs cursor-pointer">
                        <SelectValue placeholder="Seleziona un ruolo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Amministratore</SelectItem>
                      <SelectItem value="teacher">Docente</SelectItem>
                      <SelectItem value="student">Studente</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-xs cursor-pointer">
                Annulla
              </Button>
              <Button type="submit" className="text-xs font-bold bg-primary text-primary-foreground cursor-pointer">
                Crea Utente
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

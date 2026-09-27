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
import { useTranslation } from "@/i18n/context";
import type { UserFormValues } from "@/features/users/types";

const userFormSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email" }),
  role: z.string().min(1, { message: "Role is required" }),
  password: z.string().optional(),
});

interface UserFormDialogProps {
  onAddUser: (user: UserFormValues) => Promise<unknown>;
}

export function UserFormDialog({ onAddUser }: UserFormDialogProps) {
  const { t } = useTranslation();
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
        <Button className="cursor-pointer font-medium shadow-xs text-xs">
          <Plus className="mr-1.5 h-4 w-4" /> {t("users.newUser")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("users.newUser")}</DialogTitle>
          <DialogDescription>
            {t("users.subtitle")}
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
                    <FormLabel className="text-xs">{t("teachers.firstName")}</FormLabel>
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
                    <FormLabel className="text-xs">{t("teachers.lastName")}</FormLabel>
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
                  <FormLabel className="text-xs">{t("common.email")}</FormLabel>
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
                  <FormLabel className="text-xs">{t("users.role")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-9 text-xs cursor-pointer">
                        <SelectValue placeholder={t("users.role")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin" className="cursor-pointer">{t("roles.admin")}</SelectItem>
                      <SelectItem value="secretary" className="cursor-pointer">{t("roles.secretary")}</SelectItem>
                      <SelectItem value="teacher" className="cursor-pointer">{t("roles.teacher")}</SelectItem>
                      <SelectItem value="parent" className="cursor-pointer">{t("roles.parent")}</SelectItem>
                      <SelectItem value="student" className="cursor-pointer">{t("roles.student")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-xs cursor-pointer">
                {t("common.cancel")}
              </Button>
              <Button type="submit" className="text-xs font-bold bg-primary text-primary-foreground cursor-pointer">
                {t("common.create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

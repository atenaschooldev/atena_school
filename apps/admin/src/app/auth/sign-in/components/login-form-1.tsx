"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { api, setAdminSession } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { useTranslation } from "@/i18n/context"

const loginFormSchema = z.object({
  email: z.string().email("Inserisci un indirizzo email valido"),
  password: z.string().min(1, "Inserisci la password"),
})

type LoginFormValues = z.infer<typeof loginFormSchema>

export function LoginForm1({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: LoginFormValues) {
    try {
      setLoading(true)
      const res = await api.post<{ access_token: string; refresh_token?: string; user?: any }>("/admin/auth/login", values)
      if (res.access_token) {
        setAdminSession(res.access_token, res.refresh_token)
        toast.success(t("common.saveSuccess") || "Accesso effettuato con successo")
        navigate("/dashboard")
      } else {
        toast.error("Errore di autenticazione: Token non ricevuto")
      }
    } catch (err: any) {
      console.error("Login error:", err)
      toast.error(err?.message || "Credenziali non valide. Riprova.")
    } finally {
      setLoading(false)
    }
  }

  const onInvalid = (errors: any) => {
    console.warn("Login form validation errors:", errors)
    const firstError = Object.values(errors)[0] as any
    if (firstError?.message) {
      toast.error(firstError.message)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Atena School Admin</CardTitle>
          <CardDescription>
            {t("nav.dashboard") || "CRM & Gestione Scuola"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
              <div className="grid gap-6">
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("users.email") || "Email"}</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="admin@atenaschool.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center">
                          <FormLabel>Password</FormLabel>
                        </div>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
                    {loading ? (t("common.loading") || "Accesso in corso...") : (t("common.confirm") || "Accedi")}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

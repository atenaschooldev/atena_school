import { Card, CardContent } from "@/components/ui/card"
import { Users, UserCheck, ShieldCheck, GraduationCap } from "lucide-react"
import type { User } from "@/features/users/types"

interface StatCardsProps {
  users: User[]
}

export function StatCards({ users }: StatCardsProps) {
  const total = users.length
  const students = users.filter((u) => u.role === "student").length
  const parents = users.filter((u) => u.role === "parent").length
  const staff = users.filter((u) => u.role === "admin" || u.role === "teacher").length

  const metrics = [
    {
      title: "Totale Utenti",
      value: total,
      description: "Utenti registrati nel sistema",
      icon: Users,
    },
    {
      title: "Studenti",
      value: students,
      description: "Iscritti ai corsi",
      icon: GraduationCap,
    },
    {
      title: "Genitori",
      value: parents,
      description: "Genitori/Acquirenti",
      icon: UserCheck,
    },
    {
      title: "Staff & Admin",
      value: staff,
      description: "Amministratori e insegnanti",
      icon: ShieldCheck,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="border">
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center justify-between">
              <metric.icon className="text-muted-foreground size-6" />
            </div>

            <div className="space-y-1">
              <p className="text-muted-foreground text-sm font-medium">{metric.title}</p>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="text-muted-foreground text-xs">{metric.description}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

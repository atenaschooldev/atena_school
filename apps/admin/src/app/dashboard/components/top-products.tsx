"use client"

import { BookOpen, Star, FileX } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { formatCurrency } from "@atena/utils"

export function TopProducts() {
  const { data: coursesData, isLoading } = useQuery({
    queryKey: ["courses", "public"],
    queryFn: () => api.get<any[]>("/checkout/courses"),
  })

  const coursesList = Array.isArray(coursesData) ? coursesData : []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Catalogo Corsi Attivi
          </CardTitle>
          <CardDescription>Corsi disponibili e relative tariffe dal database</CardDescription>
        </div>
        <Badge variant="outline" className="text-xs">
          Totale corsi: {coursesList.length}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Caricamento catalogo corsi...</div>
        ) : coursesList.length === 0 ? (
          <div className="p-8 border border-dashed rounded-xl text-center space-y-2 bg-card/40">
            <FileX className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="font-semibold text-sm">Nessun corso trovato</p>
            <p className="text-xs text-muted-foreground">Nessun corso pubblico disponibile nel catalogo.</p>
          </div>
        ) : (
          coursesList.slice(0, 5).map((course: any, index: number) => (
            <div key={course.id || index} className="flex items-center p-3 rounded-lg border gap-2 hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                #{index + 1}
              </div>
              <div className="flex gap-2 items-center justify-between space-x-3 flex-1 flex-wrap">
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium truncate">{course.title_it || course.name || "Corso"}</p>
                    <Badge variant="outline" className="text-xs">
                      {course.category || "Generale"}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-muted-foreground">4.8</span>
                    </div>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">Max: {course.max_students || 20} posti</span>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm font-semibold text-primary">{formatCurrency(course.price ?? 0)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

import { Plus, Settings, FileText, Download, Calendar, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTranslation } from "@/i18n/context"

export function QuickActions() {
  const { t } = useTranslation()

  return (
    <div className="flex items-center space-x-2">
      <Button asChild className="cursor-pointer">
        <Link to="/prenotazioni">
          <Plus className="h-4 w-4 mr-2" />
          {t("dashboard.newBooking")}
        </Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="cursor-pointer">
            <Settings className="h-4 w-4 mr-2" />
            {t("common.actions")}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link to="/corsi">
              <Plus className="h-4 w-4 mr-2" />
              {t("dashboard.newCourse")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link to="/presenze">
              <Calendar className="h-4 w-4 mr-2" />
              {t("dashboard.markAttendance")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link to="/settings/account">
              <Settings className="h-4 w-4 mr-2" />
              {t("nav.accountSettings")}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

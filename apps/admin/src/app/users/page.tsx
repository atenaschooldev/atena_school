"use client"

import { BaseLayout } from "@/components/layouts/base-layout"
import { StatCards } from "./components/stat-cards"
import { DataTable } from "./components/data-table"
import { useUsers } from "@/features/users/hooks/use-users"

export default function UsersPage() {
  const {
    users,
    loading,
    selectedRole,
    setSelectedRole,
    addUser,
    updateUser,
    deleteUser,
  } = useUsers()

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    await updateUser(id, { isActive: !currentActive })
  }

  return (
    <BaseLayout title="Utenti">
      <div className="flex flex-col gap-4">
        <div className="@container/main px-4 lg:px-6">
          <StatCards users={users} />
        </div>

        <div className="@container/main px-4 lg:px-6 mt-4 lg:mt-6">
          <DataTable
            users={users}
            loading={loading}
            selectedRole={selectedRole}
            onRoleFilterChange={setSelectedRole}
            onDeleteUser={deleteUser}
            onToggleActive={handleToggleActive}
            onAddUser={addUser}
          />
        </div>
      </div>
    </BaseLayout>
  )
}

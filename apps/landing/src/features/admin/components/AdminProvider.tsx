"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface AdminContextProps {
  isAdmin: boolean;
  isPreviewMode: boolean;
  setPreviewMode: (val: boolean) => void;
}

const AdminContext = createContext<AdminContextProps | undefined>(undefined);

export function AdminProvider({
  children,
  isAdmin,
}: {
  children: React.ReactNode;
  isAdmin: boolean;
}) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Rehydrate state from localStorage
  useEffect(() => {
    if (isAdmin) {
      const saved = localStorage.getItem("admin_preview_mode");
      if (saved) {
        setIsPreviewMode(saved === "true");
      }
    }
  }, [isAdmin]);

  const setPreviewMode = (val: boolean) => {
    setIsPreviewMode(val);
    localStorage.setItem("admin_preview_mode", val.toString());
  };

  return (
    <AdminContext.Provider value={{ isAdmin, isPreviewMode, setPreviewMode }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    return { isAdmin: false, isPreviewMode: false, setPreviewMode: () => {} };
  }
  return context;
}

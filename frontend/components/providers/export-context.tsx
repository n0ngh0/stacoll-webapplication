"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { User } from "@/types/user";

interface ExportContextType {
  selectedSkills: Set<number>;
  selectedProjects: Set<number>;
  setSelectedSkills: (skills: Set<number>) => void;
  setSelectedProjects: (projects: Set<number>) => void;
  userData: User | null;
  setUserData: (user: User | null) => void;
}

const ExportContext = createContext<ExportContextType | undefined>(undefined);

export function ExportProvider({ children }: { children: ReactNode }) {
  const [selectedSkills, setSelectedSkills] = useState<Set<number>>(new Set());
  const [selectedProjects, setSelectedProjects] = useState<Set<number>>(new Set());
  const [userData, setUserData] = useState<User | null>(null);

  return (
    <ExportContext.Provider
      value={{
        selectedSkills,
        selectedProjects,
        setSelectedSkills,
        setSelectedProjects,
        userData,
        setUserData,
      }}
    >
      {children}
    </ExportContext.Provider>
  );
}

export function useExportContext() {
  const context = useContext(ExportContext);
  if (context === undefined) {
    throw new Error("useExportContext must be used within an ExportProvider");
  }
  return context;
}

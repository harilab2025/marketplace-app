"use client";

import { createContext, useContext, useState } from "react";
import { MenuSidebarDashboard } from "@/types/menu.sidebar";
import { menuDashboard } from "@/constants/menu/menu.dashboard";

type SelectedMenuContextType = {
    selectedMenu: MenuSidebarDashboard;
    setSelectedMenu: (selectedMenu: MenuSidebarDashboard) => void;
};

const SelectedMenuContext = createContext<SelectedMenuContextType | undefined>(undefined);

export function MenuSidebarProvider({ children }: { children: React.ReactNode }) {
    const [selectedMenu, setSelectedMenu] = useState<MenuSidebarDashboard>(menuDashboard[0]);

    return (
        <SelectedMenuContext.Provider value={{ selectedMenu, setSelectedMenu }}>
            {children}
        </SelectedMenuContext.Provider>
    );
}

export function useMenusidebar() {
    const ctx = useContext(SelectedMenuContext);
    if (!ctx) throw new Error("useSidebar must be used inside MenuSidebarProvider");
    return ctx;
}

"use client";

import { createContext, useContext, useState } from "react";

type ToggleMenuContextType = {
    toggleSidebar: boolean;
    setToggleSidebar: (toggleSidebar: boolean) => void;
};

const ToggleMenuContext = createContext<ToggleMenuContextType | undefined>(undefined);

export function ToggleSidebarProvider({ children }: { children: React.ReactNode }) {
    const [toggleSidebar, setToggleSidebar] = useState<boolean>(true);

    return (
        <ToggleMenuContext.Provider value={{ toggleSidebar, setToggleSidebar }}>
            {children}
        </ToggleMenuContext.Provider>
    );
}

export function useToggleSidebar() {
    const ctx = useContext(ToggleMenuContext);
    if (!ctx) throw new Error("useSidebar must be used inside ToggleSidebarProvider");
    return ctx;
}

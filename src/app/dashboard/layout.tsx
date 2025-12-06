import Container from "@/components/dashboard/container/container";
import Header from "@/components/dashboard/header/header";
import Sidebar from "@/components/dashboard/sidebar/sidebar";
import { MenuSidebarProvider } from "@/context/dashboard/useMenu.sidebar";
import { ToggleSidebarProvider } from "@/context/dashboard/useToggle.sidebar";

// Dashboard Layout
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-screen h-screen">
      <MenuSidebarProvider>
        <ToggleSidebarProvider>
          <main className="w-full h-full flex">
            <Header />
            <Sidebar />
            <Container>
              {children}
            </Container>
          </main>
        </ToggleSidebarProvider>
      </MenuSidebarProvider>
    </div>
  );
}
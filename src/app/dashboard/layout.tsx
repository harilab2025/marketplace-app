import Container from "@/components/dashboard/container/container";
import Sidebar from "@/components/dashboard/sidebar/sidebar";
import { MenuSidebarProvider } from "@/contexts/dashboard/useMenu.sidebar";
import { ToggleSidebarProvider } from "@/contexts/dashboard/useToggle.sidebar";
import { userData } from "@/lib/auth.user";
import { redirect } from "next/navigation";

// Dashboard Layout
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await userData();

  // Redirect to login if no user
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="w-screen h-screen">
      <MenuSidebarProvider>
        <ToggleSidebarProvider>
          <main className="w-full h-full flex">
            <Sidebar />
            <Container user={user}>
              {children}
            </Container>
          </main>
        </ToggleSidebarProvider>
      </MenuSidebarProvider>
    </div>
  );
}

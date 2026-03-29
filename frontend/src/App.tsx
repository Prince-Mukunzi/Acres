import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AppSidebar } from "./components/layout/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import Tickets from "@/pages/Tickets";
import Tenants from "@/pages/Tenants";
import Properties from "@/pages/Properties";
import Dashboard from "@/pages/Dashboard";
import LoginPage from "@/pages/Login";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ThemeProvider } from "./components/layout/ThemeProvider";
import SubmitTicket from "./pages/TicketSubmission";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-hidden bg-background">
        <AppSidebar variant="floating" />
        <SidebarInset>
          <main className="flex-1">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
export default function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <GoogleOAuthProvider clientId={googleClientId}>
          <AuthProvider>
            <TooltipProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/:propertyName/submit-ticket/:unitName"
                  element={<SubmitTicket />}
                />
                <Route element={<AppLayout />}>
                  <Route element={<ProtectedRoute />}>
                    <Route
                      path="/"
                      element={<Navigate to="/dashboard" replace />}
                    />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/tenants" element={<Tenants />} />
                    <Route path="/maintenance" element={<Tickets />} />
                    <Route path="/properties" element={<Properties />} />
                  </Route>
                </Route>
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </ThemeProvider>
    </QueryClientProvider>
  );
}

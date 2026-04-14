import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AppSidebar } from "./components/layout/Sidebar";
import { AdminSidebar } from "./components/layout/AdminSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import Tickets from "@/pages/app/Tickets";
import Tenants from "@/pages/app/Tenants";
import Properties from "@/pages/app/Properties";
import Dashboard from "@/pages/app/Dashboard";
import LoginPage from "@/pages/app/Login";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, OnboardingGuard } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import { ThemeProvider } from "./components/layout/ThemeProvider";
import SubmitTicket from "./pages/app/TicketSubmission";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import TicketFeed from "./pages/admin/TicketFeed";
import AdminCommunications from "./pages/admin/AdminCommunications";
import AdminProperties from "./pages/admin/AdminProperties";
import AdminFeedback from "./pages/admin/AdminFeedback";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LandingPage from "./pages/landing/Index";
import Checkout from "./pages/landing/Checkout";
import StaticLandingLayout from "./pages/landing/StaticLandingLayout";
import Terms from "./pages/landing/Terms";
import Privacy from "./pages/landing/Privacy";
import NotFound from "./pages/landing/NotFound";
import { Analytics } from "@vercel/analytics/react";

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

function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-hidden bg-background">
        <AdminSidebar variant="floating" />
        <SidebarInset>
          <main className="flex-1 overflow-y-auto">
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
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route
                    path="/:propertyName/submit-ticket/:unitName"
                    element={<SubmitTicket />}
                  />

                  {/* Standard User UI */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<OnboardingGuard />}>
                      <Route element={<AppLayout />}>
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
                  </Route>

                  {/* Admin Platform UI */}
                  <Route element={<AdminLayout />}>
                    <Route element={<AdminRoute />}>
                      <Route path="/admin" element={<AdminOverview />} />
                      <Route path="/admin/users" element={<AdminUsers />} />
                      <Route
                        path="/admin/properties"
                        element={<AdminProperties />}
                      />
                      <Route path="/admin/activity" element={<TicketFeed />} />
                      <Route
                        path="/admin/communications"
                        element={<AdminCommunications />}
                      />
                      <Route
                        path="/admin/feedback"
                        element={<AdminFeedback />}
                      />
                    </Route>
                  </Route>

                  {/* Static Legal Pages */}
                  <Route
                    path="/terms"
                    element={
                      <StaticLandingLayout>
                        <Terms />
                      </StaticLandingLayout>
                    }
                  />
                  <Route
                    path="/privacy"
                    element={
                      <StaticLandingLayout>
                        <Privacy />
                      </StaticLandingLayout>
                    }
                  />

                  {/* Catch-all 404 Route */}
                  <Route
                    path="*"
                    element={
                      <StaticLandingLayout>
                        <NotFound />
                      </StaticLandingLayout>
                    }
                  />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </ThemeProvider>
      <Analytics />
    </QueryClientProvider>
  );
}

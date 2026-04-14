import * as React from "react";
import { useState } from "react";

import { NavMain } from "./NavMain";
import { NavUser } from "./NavUser";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import {
  LayoutDashboardIcon,
  Users2,
  Building2,
  MessageCircle,
  FolderCog,
  Bug,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { FeedbackDialog } from "@/components/features/feedback/FeedbackDialog";

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackType] = useState<"BUG" | "FEATURE" | "GENERAL">("GENERAL");

  const navMain = [
    {
      title: "Overview",
      url: "/admin",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Properties",
      url: "/admin/properties",
      icon: <Building2 />,
    },
    {
      title: "Subscriptions",
      url: "/admin/users",
      icon: <Users2 />,
    },
    {
      title: "Maintenance Tickets",
      url: "/admin/activity",
      icon: <FolderCog />,
    },
    {
      title: "Communications",
      url: "/admin/communications",
      icon: <MessageCircle />,
    },
    {
      title: "Feedback & Bugs",
      url: "/admin/feedback",
      icon: <Bug />,
    },
  ];

  const sidebarUser = {
    name: user?.name || "Admin User",
    email: user?.email || "admin@acres.com",
    avatar: user?.picture || "/avatars/shadcn.jpg",
  };

  return (
    <>
      <Sidebar collapsible="offcanvas" variant="floating" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:p-1.5!"
              >
                <Link to="/admin">
                  <img src="/acres_dark.svg" alt="Acres" className="size-5 dark:hidden" />
                  <img src="/acres_light.svg" alt="Acres" className="size-5 hidden dark:block" />

                  <span className="text-base font-semibold">Acres</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={navMain} />
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={sidebarUser} />
        </SidebarFooter>
      </Sidebar>

      <FeedbackDialog
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        defaultType={feedbackType}
      />
    </>
  );
}

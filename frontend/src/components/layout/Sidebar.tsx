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
import { SidebarGroup, SidebarGroupContent } from "../ui/sidebar";
import {
  LayoutDashboardIcon,
  Building2,
  MessageSquare,
  FolderCog,
  Users2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { FeedbackDialog } from "@/components/features/feedback/FeedbackDialog";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<
    "BUG" | "FEATURE" | "GENERAL"
  >("GENERAL");

  const navMain = [
    {
      title: "Overview",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Properties",
      url: "/properties",
      icon: <Building2 />,
    },
    {
      title: "Tenants",
      url: "/tenants",
      icon: <Users2 />,
    },
    {
      title: "Maintenance Tickets",
      url: "/maintenance",
      icon: <FolderCog />,
    },
  ];

  const sidebarUser = {
    name: user?.name || "Unknown User",
    email: user?.email || "unknown@user.com",
    avatar: user?.picture || "/avatars/shadcn.jpg",
  };

  return (
    <>
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:p-1.5!"
              >
                <Link to="/">
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

          {/* Quick actions */}
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => {
                      setFeedbackType("GENERAL");
                      setFeedbackOpen(true);
                    }}
                    className="cursor-pointer"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Feedback</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
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

import * as React from "react";

import { NavDocuments } from "./NavAccounting";
import { NavMain } from "./NavMain";
import { NavSecondary } from "./NavSecondary";
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
  CircleHelpIcon,
  FileChartColumnIcon,
  FileIcon,
  CommandIcon,
  Sheet,
  Building2,
  MessageSquare,
  Bug,
  FolderCog,
  Users2,
} from "lucide-react";
import { Link } from "react-router-dom";

const data = {
  user: {
    name: "Unkown User",
    email: "unkown@user.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
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
  ],
  navSecondary: [
    {
      title: "Get Help",
      url: "#",
      icon: <CircleHelpIcon />,
    },
    {
      title: "Feedback",
      url: "#",
      icon: <MessageSquare />,
    },
    {
      title: "Report a bug",
      url: "#",
      icon: <Bug />,
    },
  ],
  documents: [
    {
      name: "Bookkeeping",
      url: "#",
      icon: <Sheet />,
    },
    {
      name: "Reports",
      url: "#",
      icon: <FileChartColumnIcon />,
    },
    {
      name: "Tax filling",
      url: "#",
      icon: <FileIcon />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link to="/">
                <img src="/acres.svg" alt="Acres" className="size-5" />
                <span className="text-base font-semibold">Acres</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}

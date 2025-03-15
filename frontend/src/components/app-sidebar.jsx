import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { NavUser } from "./nav-user";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link, useLocation } from "react-router-dom";

const data = {
  navMain: {
    doctor: [
      {
        title: "Main",
        items: [
          { title: "Dashboard", url: "/dashboard" },
          { title: "Patients", url: "/patients" },
          { title: "Appointments", url: "/appointments" },
        ],
      },
      {
        title: "Medical",
        items: [
          { title: "Prescriptions", url: "/prescriptions" },
          { title: "Medical Records", url: "/medicalrecords" },
          { title: "Billing", url: "/billing" },
        ],
      },
      {
        title: "Misc.",
        items: [{ title: "Notifications", url: "/notifications" }],
      },
      {
        title: "Settings",
        items: [{ title: "Settings", url: "/settings" }],
      },
    ],
    patient: [
      {
        title: "Main",
        items: [
          { title: "Dashboard", url: "/dashboard" },
          { title: "My Doctor", url: "/doctor" },
          { title: "Appointments", url: "/appointments" },
        ],
      },
      {
        title: "Medical",
        items: [
          { title: "My Prescriptions", url: "/prescriptions" },
          { title: "Medical Records", url: "/medicalrecords" },
        ],
      },
      {
        title: "Misc.",
        items: [
          { title: "Billing", url: "/billing" },
          { title: "Notifications", url: "/notifications" },
        ],
      },
      {
        title: "Settings",
        items: [{ title: "Settings", url: "/settings" }],
      },
    ],
  },
};

export function AppSidebar({ userRole = "doctor", ...props }) {
  const navItems = data.navMain[userRole] || [];
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <Progress value={33} className="bg-gray-400 w-40" />
      </div>
    );
  }

  if (!user) {
    return <div>User not authenticated</div>;
  }

  function logout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  return (
    <Sidebar {...props}>
      <SidebarContent className="bg-gray-50">
        {navItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = currentPath === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        className={
                          isActive
                            ? "bg-gray-200 font-medium text-blue-700 border-l-4 border-blue-700"
                            : "hover:bg-gray-200"
                        }
                        asChild
                      >
                        <Link to={item.url}>
                          {item.title}
                          {isActive && <span className="ml-2">•</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        <SidebarMenuItem key="Log Out">
          <SidebarMenuButton className="hover:bg-red-200 hover:text-red-800 text-red-600">
            <AlertDialog>
              <AlertDialogTrigger>Log Out</AlertDialogTrigger>
              <AlertDialogContent className="bg-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. You will need to login back if
                    you want to access your data again.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-gray-800 text-gray-100  border border-transparent transition hover:bg-transparent hover:text-gray-800 hover:border-gray-800">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="border-gray-800 text-gray-800 transition hover:bg-gray-800 hover:text-gray-100 hover:border-transparent border"
                    onClick={logout}
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarContent>
      <SidebarFooter className="bg-gray-50">
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

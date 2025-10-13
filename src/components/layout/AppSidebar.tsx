
import { useState } from "react";
import {
  BookOpen,
  Clock,
  FileText,
  Home,
  PenTool,
  Star,
  Target,
  Trophy,
  Crown,
  Menu,
  StickyNote
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";

interface AppSidebarProps {
  currentPage?: string;
  userSubscription?: 'freemium' | 'premium';
  onPageChange?: (page: string) => void;
}

export function AppSidebar({ currentPage, userSubscription = "freemium", onPageChange }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const menuItems = [
    { id: "dashboard", title: "Dashboard", icon: Home },
    { id: "chapter-practice", title: "Chapter wise Practice", icon: PenTool },
    { id: "chapter-pyqs", title: "Chapter wise PYQs", icon: Target },
    { id: "mock-tests", title: "Full Mock Papers", icon: FileText },
    { id: "pyp-tests", title: "Full PYP Papers", icon: Clock },
    { id: "test-series", title: "Test Series", icon: Trophy },
    { id: "notes", title: "Notes", icon: BookOpen },
    { id: "short-notes", title: "Short Notes", icon: StickyNote },
  ];

  const isActive = (pageId: string) => currentPage === pageId;
  const getNavCls = (pageId: string) =>
    isActive(pageId) ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" : "hover:bg-muted/50";

  const handleGoSuper = () => {
    // Navigate to GoSuper page by opening it in a new window or current window
    window.location.href = '/go-super';
  };

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent>
        {/* Logo */}
        <div className="p-4 border-b">
          <Logo size={collapsed ? "sm" : "md"} showText={!collapsed} />
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    className={getNavCls(item.id)}
                    onClick={() => onPageChange?.(item.id)}
                    tooltip={collapsed ? item.title : undefined}
                  >
                    <item.icon className="h-5 w-5" />
                    {!collapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Go Super Button */}
        {userSubscription === 'freemium' && (
          <div className="p-4 mt-auto">
            <Button 
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
              size={collapsed ? "icon" : "default"}
              onClick={handleGoSuper}
            >
              <Crown className="h-4 w-4" />
              {!collapsed && <span className="ml-2">Go Super</span>}
            </Button>
          </div>
        )}

        {/* Sidebar Toggle */}
        <div className="p-2 border-t">
          <SidebarTrigger className="w-full" />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

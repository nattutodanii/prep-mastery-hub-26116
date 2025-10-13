import { useState, ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopBar } from "@/components/layout/TopBar";

interface AppLayoutProps {
  children: ReactNode;
  currentPage?: string;
  userName?: string;
  userSubscription?: 'freemium' | 'premium';
  onPageChange?: (page: string) => void;
}

export function AppLayout({ children, currentPage, userName = "User", userSubscription = "freemium", onPageChange }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar currentPage={currentPage} userSubscription={userSubscription} onPageChange={onPageChange} />
        <div className="flex-1 flex flex-col">
          <TopBar userName={userName} />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
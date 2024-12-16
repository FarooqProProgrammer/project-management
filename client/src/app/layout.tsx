import type { Metadata } from "next";
import "./globals.css";
import { Inter as FontSans } from "next/font/google";

import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

import NavBar from "@/components/nav-bar";
import NavSheet from "@/components/nav-sheet";
import UserMenu from "@/components/usermenu";
import DashboardBreadcumbs from "@/components/dash-breadcrumbs";
import DashboardSearch from "@/components/dash-search";
import ProviderComponent from "@/store/provider";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ProviderComponent>
          <TooltipProvider>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
              <NavBar />
              <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                  <NavSheet />
                  <DashboardBreadcumbs />
                  <DashboardSearch />
                  <UserMenu />
                </header>
                {children}
              </div>
            </div>
          </TooltipProvider>
        </ProviderComponent>
      </body>
    </html>
  );
}
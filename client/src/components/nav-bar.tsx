"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Package2,
  Home,
  ShoppingCart,
  Package,
  Users2,
  LineChart,
  Settings,
  Projector,
  BookAIcon,
} from "lucide-react";

export default function NavBar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="#"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <Package2 className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">Acme Inc</span>
        </Link>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/"
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8 ${pathname === "/" ? "bg-accent" : ""}`}
            >
              <Home className="h-5 w-5" />
              <span className="sr-only">Dashboard</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Dashboard</TooltipContent>
        </Tooltip>
    
    
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/projects"
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8 ${pathname === "/products" ? "bg-accent" : ""}`}
            >
              <Projector className="h-5 w-5" />
              <span className="sr-only">Projects</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Projects</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/task"
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8 ${pathname === "/products" ? "bg-accent" : ""}`}
            >
              <BookAIcon className="h-5 w-5" />
              <span className="sr-only">Task</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Task</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/severity"
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8 ${pathname === "/products" ? "bg-accent" : ""}`}
            >
              <BookAIcon className="h-5 w-5" />
              <span className="sr-only">Severity</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Severity</TooltipContent>
        </Tooltip>


      
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/settings"
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8 ${pathname === "/settings" ? "bg-accent" : ""}`}
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip>
      </nav>
    </aside>
  );
}

"use client"

import * as React from "react"
import { Moon, Sun, Laptop } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-100 shadow-sm transition-all focus:outline-none"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all text-amber-500 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all text-sky-400 dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-2xl z-[100] p-1.5 rounded-xl">
        <DropdownMenuItem 
          onClick={() => setTheme("light")} 
          className="flex items-center gap-2 cursor-pointer font-bold text-gray-900 dark:text-slate-100 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-lg px-2.5 py-2"
        >
          <Sun className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")} 
          className="flex items-center gap-2 cursor-pointer font-bold text-gray-900 dark:text-slate-100 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-lg px-2.5 py-2"
        >
          <Moon className="w-4 h-4 text-sky-400 flex-shrink-0" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")} 
          className="flex items-center gap-2 cursor-pointer font-bold text-gray-900 dark:text-slate-100 hover:bg-purple-50 dark:hover:bg-slate-800 rounded-lg px-2.5 py-2"
        >
          <Laptop className="w-4 h-4 text-purple-500 flex-shrink-0" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

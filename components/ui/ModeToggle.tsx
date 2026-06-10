"use client"

import * as React from "react"
import { MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { useTheme } from "next-themes"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  function handleClick() {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    // <div className="flex items-center">
    //   <button onClick={handleClick} className="cursor-pointer">
        // {theme === 'light' ? 
        //   <SunIcon className="h-5 w-5" color="black" /> : 
        //   <MoonIcon className="h-5 w-5" color="yellow" />
        // }
    //   </button>
    // </div>
    <>
      <DropdownMenuItem onClick={handleClick}>
        {theme === 'light' ? 
          (<>
            <SunIcon className="h-5 w-5" color="black" />
            <span>Light Mode</span>
          </>)
           : 
          (<>
            <MoonIcon className="h-5 w-5" color="yellow" />
            <span>Dark Mode</span>
          </>)
        }
      </DropdownMenuItem>
    </>
  )
}
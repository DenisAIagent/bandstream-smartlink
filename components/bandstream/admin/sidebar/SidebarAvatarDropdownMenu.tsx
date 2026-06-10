"use client"
import React from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import SidebarAvatar from "./SidebarAvatar";
import { LogOut, UserCircle, SunIcon, MoonIcon } from "lucide-react";
import { logout } from "@/components/auth/auth";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { SidebarGroup } from "@/components/ui/sidebar";

export default function SidebarAvatarDropdownMenu() {
    const { theme, setTheme } = useTheme()
    const ta = useTranslations('admin');
    const tc = useTranslations('common');

    function handleClick() {
        setTheme(theme === 'light' ? 'dark' : 'light')
    }

    return (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <DropdownMenu>
                <DropdownMenuTrigger>
                <SidebarAvatar />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" side="top">
                <DropdownMenuItem>
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>{ta('profile')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleClick}>
                    {theme === 'light' ? 
                        (
                            <>
                                <SunIcon className="mr-2 h-4 w-4" color="black" />
                                <span>{tc('lightmode')}</span>
                            </>
                        )
                        : 
                        (
                            <>
                                <MoonIcon className="mr-2 h-4 w-4" color="yellow" />
                                <span>{tc('darkmode')}</span>
                            </>
                        )
                    }
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{tc('logout')}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </SidebarGroup>
    )
}
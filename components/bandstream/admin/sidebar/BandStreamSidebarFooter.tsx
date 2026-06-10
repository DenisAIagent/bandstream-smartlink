'use client'

import { SidebarFooter } from "@/components/ui/sidebar"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { SunIcon, MoonIcon, LogOut } from "lucide-react";
import { logout } from "@/components/auth/auth";
import LanguageSelector from "../../i18n/LanguageSelector"


export default function BandStreamSidebarFooter() {
    const { theme, setTheme } = useTheme()
    // const ta = useTranslations('admin');
    const tc = useTranslations('common');


    function handleLightDarkModeClick() {
        setTheme(theme === 'light' ? 'dark' : 'light')
    }

    return (
        <SidebarFooter>
                <LanguageSelector />
                <SidebarMenuButton onClick={handleLightDarkModeClick}>
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
                </SidebarMenuButton>

                <SidebarMenuButton onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{tc('logout')}</span>
                </SidebarMenuButton>
        </SidebarFooter>
    )
}
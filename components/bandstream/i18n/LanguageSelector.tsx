"use client"
import { useTranslations, useLocale } from "next-intl"
import { usePathname } from "next/navigation"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { routing } from "@/i18n/routing"

// Define available languages (must be a superset of routing.locales)
const allLanguages = [
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'is', name: 'Íslenska', flag: '🇮🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ms', name: 'Melayu', flag: '🇲🇾' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
]

// Only show locales that are actually enabled in the routing config
const enabledLocales = routing.locales as readonly string[]
const languages = allLanguages.filter(l => enabledLocales.includes(l.code))

export default function LanguageSelector() {
    const tc = useTranslations('common');
    const locale = useLocale();
    // usePathname from next/navigation here (not next-intl) — we WANT the full
    // path including the current locale segment so we can swap it cleanly.
    const pathname = usePathname();

    const currentLanguage = languages.find(l => l.code === locale) ?? languages[0];

    const handleLanguageChange = (langCode: string) => {
        // Hard reload via window.location.href — bypasses next-intl's soft client
        // navigation which leaves the body blank on locale switch (EN→FR) until F5.
        // Trade-off: ~200ms full-page reload, but the language switcher is a
        // once-per-session action so the cost is negligible and correctness is
        // guaranteed by going through the full server pipeline.
        const segments = pathname.split('/');
        // segments[0] is empty (leading slash), segments[1] is the locale prefix
        if (segments[1] && (routing.locales as readonly string[]).includes(segments[1])) {
            segments[1] = langCode;
        } else {
            segments.splice(1, 0, langCode);
        }
        window.location.href = segments.join('/');
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <SidebarMenuButton className="w-full justify-start">
                    <span className="mr-2 text-xl">{currentLanguage.flag}</span>
                    <span>{currentLanguage.name}</span>
                </SidebarMenuButton>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogTitle className="sr-only">
                    {tc('select_language')}
                </DialogTitle>
                <div className="grid grid-cols-3 gap-2">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`flex items-center space-x-2 p-2 rounded-md ${
                                currentLanguage.code === lang.code
                                    ? 'bg-accent ring-2 ring-primary'
                                    : 'hover:bg-accent'
                            }`}
                        >
                            <span className="text-xl">{lang.flag}</span>
                            <span className="text-sm">{lang.name}</span>
                        </button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}

"use client";
import IconButton from "@/components/IconButton";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { href: "/home", icon: "home.svg", activeIcon: "home-active.svg", alt: t('home') },
    { href: "/search", icon: "search.svg", activeIcon: "search-active.svg", alt: t('search') },
    { href: "/publish", icon: "plus.svg", activeIcon: "plus-active.svg", alt: t('publish') },
    { href: "/profile", icon: "user.svg", activeIcon: "user-active.svg", alt: t('profile') },
    { href: "/settings", icon: "menu.svg", activeIcon: "menu-active.svg", alt: t('settings') },
  ];

  return (
    <nav className="w-full flex justify-around items-center px-5 py-2 fixed bottom-0 left-0 z-50" style={{ backgroundColor: "var(--UI)", borderTop: "1px solid var(--border)" }}>
      {navItems.map(({ href, icon, activeIcon, alt }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/");
        return (
          <IconButton key={href} href={href} icon={icon} activeIcon={activeIcon} alt={alt} isActive={isActive} className="p-2" />);
      })}
    </nav>
  );
}
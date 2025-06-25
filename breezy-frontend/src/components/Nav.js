"use client";
import IconButton from "@/components/IconButton";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/home", icon: "home.svg", activeIcon: "home-active.svg", alt: "Accueil" },
  { href: "/search", icon: "search.svg", activeIcon: "search-active.svg", alt: "Recherche" },
  { href: "/publish", icon: "plus.svg", activeIcon: "plus-active.svg", alt: "Nouveau post" },
  { href: "/profile", icon: "user.svg", activeIcon: "user-active.svg", alt: "Profil" },
  { href: "/menu", icon: "menu.svg", activeIcon: "menu-active.svg", alt: "Menu" },
];

export default function BottomNav() {
  const pathname = usePathname();

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
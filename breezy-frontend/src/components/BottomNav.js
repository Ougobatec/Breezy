"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

//href à non-verifiés
const navItems = [
  { href: "/home", icon: "home.svg", activeIcon: "home-active.svg", alt: "Accueil" },
  { href: "/search", icon: "search.svg", activeIcon: "search-active.svg", alt: "Recherche" },
  { href: "/posts/", icon: "plus.svg", activeIcon: "plus-active.svg", alt: "Nouveau post" },
  { href: "/profile", icon: "user.svg", activeIcon: "user-active.svg", alt: "Profil" },
  { href: "/menu", icon: "menu.svg", activeIcon: "menu-active.svg", alt: "Menu" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50">
      {navItems.map(({ href, icon, activeIcon, alt }) => {
        // Vérifie si la route actuelle commence par le href du bouton
        const isActive = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link href={href} key={href}>
            <Image
              src={isActive ? `/${activeIcon}` : `/${icon}`}
              alt={alt}
              width={28}
              height={28}
            />
          </Link>
        );
      })}
    </nav>
  );
}